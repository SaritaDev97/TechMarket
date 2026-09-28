import { useState, useEffect } from 'react'
import { getEstadoCaja, getHistorialCaja, abrirCaja, cerrarCaja } from '../../services/api'
import { toArr } from '../../utils/parseResponse'
import * as Icons from './shared/Icons'

// Prisma enum: caja_estado { ABIERTA, CERRADA }
// Prisma fields: monto_inicial, monto_final, fecha_apertura, fecha_cierre, estado

function AdminCaja() {
  const [estado, setEstado]       = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const [montoApertura, setMontoApertura] = useState('')
  
  function cargar() {
    setLoading(true)
    Promise.all([
      getEstadoCaja().catch(() => ({ data: null })),
      getHistorialCaja().catch(() => ({ data: [] })),
    ]).then(([e, h]) => {
      console.log('[Caja estado]', e.data)
      console.log('[Caja historial]', h.data)

      const historialList = toArr(h.data)
      setHistorial(historialList)

      // La API puede devolver { caja: {...} } o el objeto directo
      const cajaData = e.data?.data || e.data

      if (cajaData?.estado === 'ABIERTA') {
        // El endpoint de estado devolvió la caja abierta correctamente
        setEstado(cajaData)
      } else {
        // Fallback: buscar en el historial si hay alguna caja abierta
        const abiertaEnHistorial = historialList.find(c => c.estado === 'ABIERTA')
        setEstado(abiertaEnHistorial || null)
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  async function handleAbrir() {
    if (!montoApertura || parseFloat(montoApertura) < 0) return setError('Ingresa un monto de apertura válido')
    setSaving(true); setError(null)
    try {
      // Prisma field: monto_inicial
      const { data } = await abrirCaja({ monto_inicial: parseFloat(montoApertura) })
      console.log('[Abrir caja]', data)
      setEstado(data?.data || data)
      setMontoApertura('')
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al abrir caja')
    } finally { setSaving(false) }
  }

  async function handleCerrar() {
    if (!confirm('¿Cerrar la caja actual?')) return
    setSaving(true); setError(null)
    try {
      const { data } = await cerrarCaja({})
      console.log('[Cerrar caja]', data)
      setEstado(null)
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cerrar caja')
    } finally { setSaving(false) }
  }

  if (loading) return <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando caja...</p>

  // Prisma: estado es el enum ABIERTA/CERRADA
  const abierta = estado?.estado === 'ABIERTA'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Estado actual */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.Wallet size={20} color="var(--accent)" /> Estado de caja — <span style={{ color: abierta ? '#2E7D32' : '#c62828' }}>{abierta ? 'ABIERTA' : 'CERRADA'}</span></span>
        </h3>
        {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

        {abierta ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Monto inicial',  value: `$${parseFloat(estado?.monto_inicial || 0).toFixed(2)}` },
                { label: 'Apertura',       value: estado?.fecha_apertura ? new Date(estado.fecha_apertura).toLocaleString('es') : '–' },
                { label: 'Cajero',         value: estado?.usuarios?.nombre || '–' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--secondary)', borderRadius: '10px', padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginBottom: '0.35rem' }}>{s.label}</p>
                  <p style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{s.value}</p>
                </div>
              ))}
            </div>
            <button onClick={handleCerrar} disabled={saving}
              style={{ padding: '0.75rem 2rem', background: '#c62828', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
              {saving ? 'Cerrando...' : <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Icons.Lock size={15} /> Cerrar caja</span>}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Monto de apertura *</label>
              <input type="number" value={montoApertura} onChange={e => setMontoApertura(e.target.value)}
                placeholder="0.00" min="0" step="0.01"
                style={{ padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', width: '160px' }}
              />
            </div>
            <button onClick={handleAbrir} disabled={saving}
              style={{ padding: '0.75rem 2rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
              {saving ? 'Abriendo...' : <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Icons.Unlock size={15} /> Abrir caja</span>}
            </button>
          </div>
        )}
      </div>

      {/* Historial */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.ClipboardList size={20} color="var(--accent)" /> Historial de cajas</h3>
        {historial.length === 0
          ? <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>Sin historial</p>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--secondary)' }}>
                  {['ID', 'Cajero', 'Apertura', 'Cierre', 'Monto inicial', 'Monto final', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.8rem' }}>#{c.id}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{c.usuarios?.nombre || '–'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{c.fecha_apertura ? new Date(c.fecha_apertura).toLocaleString('es') : '–'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{c.fecha_cierre ? new Date(c.fecha_cierre).toLocaleString('es') : '–'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>${parseFloat(c.monto_inicial || 0).toFixed(2)}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{c.monto_final != null ? `$${parseFloat(c.monto_final).toFixed(2)}` : '–'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: c.estado === 'ABIERTA' ? '#e8f5e9' : '#f5f5f5', color: c.estado === 'ABIERTA' ? '#2E7D32' : '#555' }}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  )
}

export default AdminCaja
