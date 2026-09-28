import { useState, useEffect, useCallback } from 'react'
import { getDashboard, getTopProductos, getClientes, getProductos, getPedidos } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import * as Icons from './shared/Icons'

const STATUS_COLORS = {
  PENDIENTE_CONFIRMACION: { bg: '#fff3e0', color: '#e65100' },
  CONFIRMADO:             { bg: '#e8f5e9', color: '#2E7D32' },
  EN_RUTA:                { bg: '#e3f2fd', color: '#1565C0' },
  ENTREGADO:              { bg: '#e8f5e9', color: '#2E7D32' },
  CANCELADO:              { bg: '#ffebee', color: '#c62828' },
  COMPLETADA:             { bg: '#e8f5e9', color: '#2E7D32' },
}

function StatCard({ label, value, Icon, color, bg, isText }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={26} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ 
          fontSize: isText ? '1.1rem' : '1.75rem', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 700, 
          color,
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }}>
          {value}
        </p>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [data, setData]             = useState(null)
  const [topProds, setTopProds]     = useState([])
  const [extraStats, setExtraStats] = useState({ total_clientes: '–', total_productos: '–', pedidos_recientes: [] })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const cargar = useCallback((initial = false) => {
    if (initial) setLoading(true)
    Promise.all([
      getDashboard().catch(() => ({ data: null })),
      getTopProductos().catch(() => ({ data: null })),
      getClientes({ limit: 1 }).catch(() => ({ data: null })),
      getProductos({ limit: 1 }).catch(() => ({ data: null })),
      getPedidos({ limit: 5 }).catch(() => ({ data: null })),
    ]).then(([dashRes, topRes, clientesRes, productosRes, pedidosRes]) => {
      const dashData = dashRes.data?.data ?? dashRes.data
      setData(dashData)
      setTopProds(toArr(topRes.data?.data ?? topRes.data))
      setExtraStats({
        total_clientes:   toTotal(clientesRes.data),
        total_productos:  toTotal(productosRes.data),
        pedidos_recientes: toArr(pedidosRes.data?.data ?? pedidosRes.data),
      })
    })
    .catch(() => { if (initial) setError('No se pudo conectar al servidor') })
    .finally(() => { if (initial) setLoading(false) })
  }, [])

  useEffect(() => {
    cargar(true)
    const id = setInterval(() => cargar(false), 30_000)
    return () => clearInterval(id)
  }, [cargar])

  if (loading) return <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando dashboard...</p>
  if (error)   return <p style={{ padding: '2rem', color: '#c62828' }}>{error}</p>

  // Tarjetas adaptadas a los requerimientos de TechMarket
  const stats = [
    { label: 'Ventas mensuales', value: `$${parseFloat(data?.ventas_mes || 0).toFixed(2)}`, Icon: Icons.DollarSign,   color: '#2E7D32', bg: '#e8f5e9' },
    { label: 'Total de pedidos', value: data?.total_pedidos || 0,                           Icon: Icons.ShoppingCart, color: '#1565C0', bg: '#e3f2fd' },
    { label: 'Producto más vendido', value: topProds[0]?.nombre || topProds[0]?.name || 'Sin datos', Icon: Icons.Package, color: '#FF6B35', bg: '#fff3e0', isText: true },
  ]

  const recentOrders = extraStats.pedidos_recientes

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Pedidos recientes */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.ShoppingCart size={18} color="var(--accent)" /> Pedidos recientes</h3>
          {recentOrders.length === 0
            ? <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>Sin pedidos recientes</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['ID', 'Cliente', 'Total', 'Estado'].map(h => (
                      <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--subtle)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => {
                    const estado = order.estado || ''
                    const clienteNombre = order.clientes?.nombre || order.cliente?.nombre || '–'
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>#{order.id}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem' }}>{clienteNombre}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>${parseFloat(order.total || 0).toFixed(2)}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: STATUS_COLORS[estado]?.bg || '#f5f5f5', color: STATUS_COLORS[estado]?.color || '#555' }}>
                            {estado}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          }
        </div>

        {/* Top productos */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.Package size={18} color="var(--accent)" /> Productos más vendidos</h3>
          {topProds.length === 0
            ? <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>Sin datos disponibles</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topProds.slice(0, 5).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, color: i < 3 ? '#fff' : 'var(--subtle)' }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre || p.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--subtle)' }}>{p.total_vendido || p.totalVendido || p.cantidad || 0} vendidos</p>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>${parseFloat(p.precio_venta || p.precio || p.price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard