import { useState, useEffect } from 'react'
import { getInventarioCriticos } from '../../services/api'
import { toArr } from '../../utils/parseResponse'
import * as Icons from './shared/Icons'

function AdminInventario() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getInventarioCriticos()
      .then(r => setProductos(toArr(r.data?.data ?? r.data)))
      .catch(() => setError('Error al cargar inventario crítico'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando inventario...</p>
  if (error) return <p style={{ padding: '2rem', color: '#c62828' }}>{error}</p>

  return (
    <div>
      <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icons.AlertTriangle size={22} color="#c62828" />
        <div>
          <p style={{ fontWeight: 700, color: '#c62828', margin: 0, marginBottom: '0.2rem' }}>Productos con stock crítico</p>
          <p style={{ fontSize: '0.8rem', color: '#c62828', margin: 0 }}>
            {productos.length} producto{productos.length !== 1 ? 's' : ''} por debajo del nivel de seguridad
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {productos.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.5rem', color: '#2e7d32' }}><Icons.CheckCircle size={40} /></div>
            <p style={{ color: 'var(--subtle)', margin: 0 }}>Todos los artículos tecnológicos tienen stock suficiente</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['Producto', 'Marca', 'Categoría', 'Stock actual', 'Límite de alerta', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productos.map(p => {
                const stock = p.stock ?? 0
                const minimo = p.stock_minimo ?? 5
                const pct = minimo > 0 ? Math.min((stock / minimo) * 100, 100) : 0

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{p.nombre}</p>
                      {p.codigo && <p style={{ fontSize: '0.75rem', color: 'var(--subtle)', margin: 0, marginTop: '0.2rem' }}>{p.codigo}</p>}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{p.marca || '-'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{p.categorias?.nombre || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 700, margin: 0, color: stock === 0 ? '#c62828' : '#f57f17' }}>{stock} uds</p>
                      <div style={{ height: '6px', background: 'var(--secondary)', borderRadius: '3px', marginTop: '6px', width: '80px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct < 30 ? '#c62828' : '#f57f17', borderRadius: '3px', transition: '0.3s' }} />
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{minimo} uds</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: stock === 0 ? '#ffebee' : '#fff3e0', color: stock === 0 ? '#c62828' : '#e65100' }}>
                        {stock === 0 ? 'Agotado' : 'Stock bajo'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminInventario