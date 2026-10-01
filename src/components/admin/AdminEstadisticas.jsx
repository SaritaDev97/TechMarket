import { useCallback, useEffect, useState } from 'react'
import { getEstadisticas } from '../../services/api'
import * as Icons from './shared/Icons'

const ESTADOS = [
  {
    key: 'PENDIENTE_CONFIRMACION',
    label: 'Pendientes',
    color: '#e65100',
    bg: '#fff3e0',
  },
  {
    key: 'CONFIRMADO',
    label: 'Confirmados',
    color: '#2E7D32',
    bg: '#e8f5e9',
  },
  {
    key: 'EN_RUTA',
    label: 'En ruta',
    color: '#1565C0',
    bg: '#e3f2fd',
  },
  {
    key: 'ENTREGADO',
    label: 'Entregados',
    color: '#2E7D32',
    bg: '#e8f5e9',
  },
  {
    key: 'CANCELADO',
    label: 'Cancelados',
    color: '#c62828',
    bg: '#ffebee',
  },
]

function StatCard({
  label,
  value,
  Icon,
  color,
  bg,
  subtitle,
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1.4rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '12px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={25} color={color} />
      </div>

      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.78rem',
            color: 'var(--subtle)',
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin: '0.2rem 0 0',
            fontSize: '1.55rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color,
          }}
        >
          {value}
        </p>

        {subtitle && (
          <p
            style={{
              margin: '0.15rem 0 0',
              fontSize: '0.7rem',
              color: '#9ca3af',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

function AdminEstadisticas() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarEstadisticas = useCallback(
    async (initial = false) => {
      try {
        if (initial) {
          setLoading(true)
        }

        const response = await getEstadisticas()

        const estadisticas =
          response.data?.data ?? response.data

        setData(estadisticas)
        setError(null)
      } catch (err) {
        console.error(
          'Error cargando estadísticas:',
          err
        )

        if (initial) {
          setError(
            'No se pudieron cargar las estadísticas'
          )
        }
      } finally {
        if (initial) {
          setLoading(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    cargarEstadisticas(true)

    const id = setInterval(() => {
      cargarEstadisticas(false)
    }, 30000)

    return () => clearInterval(id)
  }, [cargarEstadisticas])

  if (loading) {
    return (
      <p
        style={{
          padding: '2rem',
          color: 'var(--subtle)',
        }}
      >
        Cargando estadísticas...
      </p>
    )
  }

  if (error) {
    return (
      <p
        style={{
          padding: '2rem',
          color: '#c62828',
        }}
      >
        {error}
      </p>
    )
  }

  const topProductos = data?.topProductos || []

  const productoMasVendido =
    data?.productoMasVendido || null

  const ventasPorMes =
    data?.ventasPorMes || []

  const pedidosPorEstado =
    data?.pedidosPorEstado || {}

  const maxVentaMensual = Math.max(
    ...ventasPorMes.map(
      item => Number(item.total) || 0
    ),
    1
  )

  const totalEstados = Object.values(
    pedidosPorEstado
  ).reduce(
    (total, cantidad) =>
      total + Number(cantidad || 0),
    0
  )

  const stats = [
    {
      label: 'Ventas totales',
      value: `$${Number(
        data?.ventasTotales || 0
      ).toFixed(2)}`,
      Icon: Icons.DollarSign,
      color: '#2E7D32',
      bg: '#e8f5e9',
      subtitle: 'Pedidos no cancelados',
    },
    {
      label: 'Total de pedidos',
      value: data?.pedidos || 0,
      Icon: Icons.ShoppingCart,
      color: '#1565C0',
      bg: '#e3f2fd',
      subtitle: 'Pedidos registrados',
    },
    {
      label: 'Ticket promedio',
      value: `$${Number(
        data?.ticketPromedio || 0
      ).toFixed(2)}`,
      Icon: Icons.DollarSign,
      color: '#7B1FA2',
      bg: '#f3e5f5',
      subtitle: 'Promedio por pedido',
    },
    {
      label: 'Clientes registrados',
      value: data?.clientes || 0,
      Icon: Icons.Users,
      color: '#FF6B35',
      bg: '#fff3e0',
      subtitle: 'Clientes activos',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* TÍTULO */}

      <div>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: '#111827',
          }}
        >
          Estadísticas de Ventas
        </h2>

        <p
          style={{
            margin: '0.3rem 0 0',
            color: 'var(--subtle)',
            fontSize: '0.85rem',
          }}
        >
          Resumen general del rendimiento de TechMarket
        </p>
      </div>

      {/* TARJETAS PRINCIPALES */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
          />
        ))}
      </div>

      {/* PRODUCTO MÁS VENDIDO + ESTADOS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* PRODUCTO MÁS VENDIDO */}

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1.25rem',
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Icons.Package
              size={19}
              color="var(--accent)"
            />

            Producto más vendido
          </h3>

          {productoMasVendido ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '12px',
                  background: '#fff3e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {productoMasVendido.imagen ? (
                  <img
                    src={productoMasVendido.imagen}
                    alt={productoMasVendido.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Icons.Package
                    size={30}
                    color="#FF6B35"
                  />
                )}
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#111827',
                  }}
                >
                  {productoMasVendido.nombre}
                </p>

                {productoMasVendido.marca && (
                  <p
                    style={{
                      margin: '0.2rem 0',
                      fontSize: '0.75rem',
                      color: 'var(--subtle)',
                    }}
                  >
                    {productoMasVendido.marca}
                  </p>
                )}

                <p
                  style={{
                    margin: '0.45rem 0 0',
                    fontSize: '0.85rem',
                    color: '#FF6B35',
                    fontWeight: 700,
                  }}
                >
                  {productoMasVendido.unidadesVendidas}{' '}
                  unidades vendidas
                </p>

                <p
                  style={{
                    margin: '0.15rem 0 0',
                    fontSize: '0.8rem',
                    color: '#2E7D32',
                    fontWeight: 600,
                  }}
                >
                  $
                  {Number(
                    productoMasVendido.ingresos || 0
                  ).toFixed(2)}{' '}
                  generados
                </p>
              </div>
            </div>
          ) : (
            <p
              style={{
                color: 'var(--subtle)',
                fontSize: '0.85rem',
              }}
            >
              Todavía no hay productos vendidos.
            </p>
          )}
        </div>

        {/* ESTADO DE PEDIDOS */}

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1.25rem',
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Icons.ShoppingCart
              size={19}
              color="var(--accent)"
            />

            Estado de pedidos
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            {ESTADOS.map(estado => {
              const cantidad =
                Number(
                  pedidosPorEstado[estado.key]
                ) || 0

              const porcentaje =
                totalEstados > 0
                  ? (cantidad / totalEstados) * 100
                  : 0

              return (
                <div key={estado.key}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      marginBottom: '0.3rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: '#374151',
                        fontWeight: 600,
                      }}
                    >
                      {estado.label}
                    </span>

                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: estado.color,
                      }}
                    >
                      {cantidad}
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '7px',
                      borderRadius: '10px',
                      background: estado.bg,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${porcentaje}%`,
                        height: '100%',
                        background: estado.color,
                        borderRadius: '10px',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* VENTAS ÚLTIMOS 6 MESES */}

      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow:
            '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <h3
          style={{
            margin: '0 0 1.5rem',
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
          }}
        >
          Ventas de los últimos 6 meses
        </h3>

        <div
          style={{
            height: '250px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1rem',
            borderBottom:
              '1px solid var(--border)',
            padding: '0 0.5rem',
          }}
        >
          {ventasPorMes.map((item, index) => {
            const total =
              Number(item.total) || 0

            const altura =
              total > 0
                ? Math.max(
                    (total / maxVentaMensual) * 190,
                    8
                  )
                : 4

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: '0.35rem',
                  }}
                >
                  ${total.toFixed(2)}
                </span>

                <div
                  title={`${item.pedidos} pedidos`}
                  style={{
                    width: '65%',
                    maxWidth: '70px',
                    minWidth: '20px',
                    height: `${altura}px`,
                    background: 'var(--accent)',
                    borderRadius: '7px 7px 0 0',
                    transition: 'height 0.3s',
                  }}
                />

                <span
                  style={{
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--subtle)',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.nombre}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* TOP 5 + INVENTARIO */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* TOP 5 */}

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1.25rem',
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
            }}
          >
            Top 5 productos más vendidos
          </h3>

          {topProductos.length === 0 ? (
            <p
              style={{
                color: 'var(--subtle)',
                fontSize: '0.85rem',
              }}
            >
              Sin ventas registradas.
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {topProductos.map((producto, index) => (
                <div
                  key={producto.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    paddingBottom: '0.8rem',
                    borderBottom:
                      index <
                      topProductos.length - 1
                        ? '1px solid var(--border)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background:
                        index === 0
                          ? '#FFD700'
                          : index === 1
                            ? '#C0C0C0'
                            : index === 2
                              ? '#CD7F32'
                              : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color:
                        index < 3
                          ? '#fff'
                          : '#6b7280',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {producto.nombre}
                    </p>

                    <p
                      style={{
                        margin: '0.15rem 0 0',
                        fontSize: '0.72rem',
                        color: 'var(--subtle)',
                      }}
                    >
                      {producto.unidadesVendidas}{' '}
                      unidades
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#2E7D32',
                    }}
                  >
                    $
                    {Number(
                      producto.ingresos || 0
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INVENTARIO */}

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1.25rem',
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
            }}
          >
            Resumen de inventario
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, 1fr)',
              gap: '1rem',
            }}
          >
            <MiniStat
              label="Productos"
              value={data?.productos || 0}
            />

            <MiniStat
              label="Categorías"
              value={data?.categorias || 0}
            />

            <MiniStat
              label="Unidades disponibles"
              value={data?.inventario?.unidades || 0}
            />

            <MiniStat
              label="Stock bajo"
              value={data?.inventario?.stockBajo || 0}
              danger={
                (data?.inventario?.stockBajo || 0) > 0
              }
            />

            <MiniStat
              label="Sin stock"
              value={data?.inventario?.sinStock || 0}
              danger={
                (data?.inventario?.sinStock || 0) > 0
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  danger = false,
}) {
  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '10px',
        background: danger
          ? '#ffebee'
          : '#f9fafb',
        border: `1px solid ${
          danger ? '#ffcdd2' : '#e5e7eb'
        }`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.72rem',
          color: 'var(--subtle)',
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: '0.3rem 0 0',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: danger
            ? '#c62828'
            : '#111827',
        }}
      >
        {value}
      </p>
    </div>
  )
}

export default AdminEstadisticas