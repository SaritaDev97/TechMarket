import { useState, useEffect, useCallback } from 'react'
import {
  getEstadisticas,
  getPedidos
} from '../../services/api'

import { toArr } from '../../utils/parseResponse'
import * as Icons from './shared/Icons'

const STATUS_COLORS = {
  PENDIENTE_CONFIRMACION: {
    bg: '#fff3e0',
    color: '#e65100'
  },
  CONFIRMADO: {
    bg: '#e8f5e9',
    color: '#2E7D32'
  },
  EN_RUTA: {
    bg: '#e3f2fd',
    color: '#1565C0'
  },
  ENTREGADO: {
    bg: '#e8f5e9',
    color: '#2E7D32'
  },
  CANCELADO: {
    bg: '#ffebee',
    color: '#c62828'
  }
}

const STATUS_LABELS = {
  PENDIENTE_CONFIRMACION: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_RUTA: 'En ruta',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
}

function StatCard({
  label,
  value,
  Icon,
  color,
  bg,
  isText,
  subtitle
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Icon size={26} color={color} />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0
        }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--subtle)',
            margin: 0,
            marginBottom: '0.25rem'
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: isText ? '1.05rem' : '1.75rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={String(value)}
        >
          {value}
        </p>

        {subtitle && (
          <p
            style={{
              margin: '0.2rem 0 0',
              fontSize: '0.7rem',
              color: '#9ca3af'
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [data, setData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (initial = false) => {
    try {
      if (initial) {
        setLoading(true)
      }

      const [estadisticasRes, pedidosRes] =
        await Promise.all([
          getEstadisticas(),
          getPedidos({ limit: 5 }).catch(() => ({
            data: null
          }))
        ])

      const estadisticas =
        estadisticasRes.data?.data ??
        estadisticasRes.data

      setData(estadisticas)

      setRecentOrders(
        toArr(
          pedidosRes.data?.data ??
          pedidosRes.data
        )
      )

      setError(null)
    } catch (err) {
      console.error(
        'Error al cargar dashboard:',
        err
      )

      if (initial) {
        setError(
          'No se pudo conectar al servidor'
        )
      }
    } finally {
      if (initial) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    cargar(true)

    const id = setInterval(() => {
      cargar(false)
    }, 30000)

    return () => clearInterval(id)
  }, [cargar])

  if (loading) {
    return (
      <p
        style={{
          padding: '2rem',
          color: 'var(--subtle)'
        }}
      >
        Cargando dashboard...
      </p>
    )
  }

  if (error) {
    return (
      <p
        style={{
          padding: '2rem',
          color: '#c62828'
        }}
      >
        {error}
      </p>
    )
  }

  const topProductos =
    data?.topProductos || []

  const productoMasVendido =
    data?.productoMasVendido || null

  const stats = [
    {
      label: 'Ventas mensuales',

      value: `$${Number(
        data?.ventasMesActual || 0
      ).toFixed(2)}`,

      Icon: Icons.DollarSign,
      color: '#2E7D32',
      bg: '#e8f5e9',

      subtitle: 'Ventas del mes actual'
    },

    {
      label: 'Total de pedidos',

      value: data?.pedidos || 0,

      Icon: Icons.ShoppingCart,
      color: '#1565C0',
      bg: '#e3f2fd',

      subtitle: 'Pedidos registrados'
    },

    {
      label: 'Producto más vendido',

      value:
        productoMasVendido?.nombre ||
        'Sin datos',

      Icon: Icons.Package,
      color: '#FF6B35',
      bg: '#fff3e0',
      isText: true,

      subtitle: productoMasVendido
        ? `${productoMasVendido.unidadesVendidas} unidades vendidas`
        : 'Aún no hay ventas'
    }
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}
    >
      {/* TARJETAS PRINCIPALES */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
          />
        ))}
      </div>

      {/* SECCIÓN INFERIOR */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* PEDIDOS RECIENTES */}

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.06)',
            overflowX: 'auto'
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              marginTop: 0,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Icons.ShoppingCart
              size={18}
              color="var(--accent)"
            />

            Pedidos recientes
          </h3>

          {recentOrders.length === 0 ? (
            <p
              style={{
                color: 'var(--subtle)',
                fontSize: '0.875rem'
              }}
            >
              Sin pedidos recientes
            </p>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom:
                      '2px solid var(--border)'
                  }}
                >
                  {[
                    'ID',
                    'Cliente',
                    'Total',
                    'Estado'
                  ].map(header => (
                    <th
                      key={header}
                      style={{
                        padding: '0.5rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        color: 'var(--subtle)',
                        fontWeight: 600
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {recentOrders.map(order => {
                  const estado =
                    order.estado || ''

                  const clienteNombre =
                    order.usuario?.nombre ||
                    order.clientes?.nombre ||
                    order.cliente?.nombre ||
                    'Sin nombre'

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom:
                          '1px solid var(--border)'
                      }}
                    >
                      <td
                        style={{
                          padding:
                            '0.75rem 0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        #{order.id}
                      </td>

                      <td
                        style={{
                          padding:
                            '0.75rem 0.5rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        {clienteNombre}
                      </td>

                      <td
                        style={{
                          padding:
                            '0.75rem 0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        $
                        {Number(
                          order.total || 0
                        ).toFixed(2)}
                      </td>

                      <td
                        style={{
                          padding:
                            '0.75rem 0.5rem'
                        }}
                      >
                        <span
                          style={{
                            padding:
                              '0.2rem 0.5rem',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 700,

                            background:
                              STATUS_COLORS[estado]
                                ?.bg ||
                              '#f5f5f5',

                            color:
                              STATUS_COLORS[estado]
                                ?.color ||
                              '#555'
                          }}
                        >
                          {STATUS_LABELS[
                            estado
                          ] || estado}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PRODUCTOS MÁS VENDIDOS */}

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              marginTop: 0,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Icons.Package
              size={18}
              color="var(--accent)"
            />

            Productos más vendidos
          </h3>

          {topProductos.length === 0 ? (
            <p
              style={{
                color: 'var(--subtle)',
                fontSize: '0.875rem'
              }}
            >
              Sin datos disponibles
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {topProductos
                .slice(0, 5)
                .map((producto, index) => (
                  <div
                    key={producto.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',

                        background:
                          index === 0
                            ? '#FFD700'
                            : index === 1
                              ? '#C0C0C0'
                              : index === 2
                                ? '#CD7F32'
                                : 'var(--secondary)',

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'center',

                        fontSize: '0.7rem',
                        fontWeight: 700,
                        flexShrink: 0,

                        color:
                          index < 3
                            ? '#fff'
                            : 'var(--subtle)'
                      }}
                    >
                      {index + 1}
                    </span>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis'
                        }}
                      >
                        {producto.nombre}
                      </p>

                      <p
                        style={{
                          margin:
                            '0.15rem 0 0',
                          fontSize: '0.75rem',
                          color:
                            'var(--subtle)'
                        }}
                      >
                        {
                          producto.unidadesVendidas
                        }{' '}
                        vendidos
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: 'right',
                        flexShrink: 0
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#2E7D32'
                        }}
                      >
                        $
                        {Number(
                          producto.ingresos || 0
                        ).toFixed(2)}
                      </p>

                      <p
                        style={{
                          margin:
                            '0.1rem 0 0',
                          fontSize: '0.65rem',
                          color:
                            'var(--subtle)'
                        }}
                      >
                        generado
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard