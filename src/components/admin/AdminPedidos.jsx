import { useState, useEffect, useCallback } from 'react'
import { getPedidos, getPedido, actualizarEstadoPedido, confirmarPedido, cancelarPedido } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import * as Icons from './shared/Icons'

// Enums exactos del schema Prisma
const ESTADOS = ['PENDIENTE_CONFIRMACION', 'CONFIRMADO', 'EN_RUTA', 'ENTREGADO', 'CANCELADO']
const ESTADOS_CAMBIABLES = ['EN_RUTA', 'ENTREGADO', 'CANCELADO']

const STATUS_COLORS = {
  PENDIENTE_CONFIRMACION: { bg: '#fff3e0', color: '#e65100', label: 'Pendiente' },
  CONFIRMADO:             { bg: '#e8f5e9', color: '#2E7D32', label: 'Confirmado' },
  EN_RUTA:                { bg: '#e3f2fd', color: '#1565C0', label: 'En ruta' },
  ENTREGADO:              { bg: '#dcfce7', color: '#15803d', label: 'Entregado' },
  CANCELADO:              { bg: '#ffebee', color: '#c62828', label: 'Cancelado' }
}

function Toast({ msg, type = 'error', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = type === 'success'
    ? { bg: '#ecfdf5', border: '#6ee7b7', color: '#065f46' }
    : { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' }

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.875rem 1.25rem', borderRadius: '10px', background: colors.bg, border: `1.5px solid ${colors.border}`, color: colors.color, fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '340px' }}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem', padding: 0, lineHeight: 1 }}>&times;</button>
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 900 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 901, background: '#fff', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '380px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>No, volver</button>
          <button onClick={onConfirm} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Sí, cancelar</button>
        </div>
      </div>
    </>
  )
}

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('TODOS')
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  
  const limit = 10

  const showToast = (msg, type = 'error') => setToast({ msg, type })

  const cargarPedidos = useCallback((initial = false) => {
    if (initial) setLoading(true)
    const params = { page, limit }
    if (filterStatus !== 'TODOS') params.estado = filterStatus

    getPedidos(params)
      .then(r => {
        setPedidos(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => {})
      .finally(() => { if (initial) setLoading(false) })
  }, [page, filterStatus])

  useEffect(() => {
    cargarPedidos(true)
    const id = setInterval(() => cargarPedidos(false), 15000)
    return () => clearInterval(id)
  }, [cargarPedidos])

  async function changeStatus(id, estado) {
    if (!ESTADOS_CAMBIABLES.includes(estado)) return
    setUpdating(id)
    try {
      await actualizarEstadoPedido(id, { estado })
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p))
      if (detail?.id === id) setDetail(prev => ({ ...prev, estado }))
      showToast(`Estado actualizado: ${STATUS_COLORS[estado]?.label || estado}`, 'success')
    } catch (err) {
      showToast(err?.response?.data?.error || err?.response?.data?.message || 'No se pudo actualizar el estado')
    } finally { setUpdating(null) }
  }

  async function handleConfirmar(id) {
    setUpdating(id)
    try {
      await confirmarPedido(id)
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: 'CONFIRMADO' } : p))
      if (detail?.id === id) setDetail(prev => ({ ...prev, estado: 'CONFIRMADO' }))
      showToast('Pedido confirmado correctamente', 'success')
    } catch (err) {
      showToast(err?.response?.data?.error || err?.response?.data?.message || 'No se pudo confirmar el pedido')
    } finally { setUpdating(null) }
  }

  function pedirConfirmacionCancelar(id, fromDetail = false) {
    setConfirmDialog({ id, fromDetail })
  }

  async function handleCancelar(id, fromDetail = false) {
    setConfirmDialog(null)
    setUpdating(id)
    try {
      await cancelarPedido(id)
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: 'CANCELADO' } : p))
      if (detail?.id === id) setDetail(prev => ({ ...prev, estado: 'CANCELADO' }))
      showToast('Pedido cancelado', 'success')
    } catch (err) {
      showToast(err?.response?.data?.error || err?.response?.data?.message || 'No se pudo cancelar el pedido')
    } finally { setUpdating(null) }
  }

  async function handleVerDetalle(id) {
    setDetailLoading(true)
    setDetail({ id })
    try {
      const { data } = await getPedido(id)
      setDetail(data?.data || data)
    } catch {
      setDetail(null)
      showToast('No se pudo cargar el detalle del pedido')
    } finally { setDetailLoading(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {confirmDialog && (
        <ConfirmDialog
          message="¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer."
          onConfirm={() => handleCancelar(confirmDialog.id, confirmDialog.fromDetail)}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['TODOS', ...ESTADOS].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1) }}
            style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: filterStatus === s ? 'var(--accent)' : 'var(--secondary)', color: filterStatus === s ? '#fff' : 'var(--muted-fg)', transition: 'background 0.15s' }}>
            {STATUS_COLORS[s]?.label || 'Todos'}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando pedidos...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['ID', 'Cliente', 'Total', 'Dirección', 'Fecha', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin pedidos</td></tr>
              ) : pedidos.map(p => {
                const estado = p.estado || 'PENDIENTE_CONFIRMACION'
                const clienteNombre = p.clientes?.nombre || p.cliente?.nombre || '-'
                const isBusy = updating === p.id

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem' }}>#{p.id}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{clienteNombre}</td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>${parseFloat(p.total || 0).toFixed(2)}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.direccion_entrega || '-'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)', whiteSpace: 'nowrap' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('es') : '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: STATUS_COLORS[estado]?.bg || '#f5f5f5', color: STATUS_COLORS[estado]?.color || '#555', whiteSpace: 'nowrap' }}>
                        {STATUS_COLORS[estado]?.label || estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button onClick={() => handleVerDetalle(p.id)} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}>
                          Ver
                        </button>
                        <select value={estado} disabled={isBusy || ['ENTREGADO', 'CANCELADO'].includes(estado)} onChange={e => changeStatus(p.id, e.target.value)} style={{ padding: '0.35rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.7rem', cursor: (isBusy || ['ENTREGADO', 'CANCELADO'].includes(estado)) ? 'not-allowed' : 'pointer', outline: 'none', opacity: ['ENTREGADO', 'CANCELADO'].includes(estado) ? 0.6 : 1 }}>
                          <option value={estado}>{STATUS_COLORS[estado]?.label || estado}</option>
                          {ESTADOS_CAMBIABLES.filter(s => s !== estado).map(s => (
                            <option key={s} value={s}>{STATUS_COLORS[s]?.label || s}</option>
                          ))}
                        </select>
                        {estado === 'PENDIENTE_CONFIRMACION' && (
                          <button onClick={() => handleConfirmar(p.id)} disabled={isBusy} title="Confirmar pedido" style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: isBusy ? 'wait' : 'pointer', border: 'none', background: '#e8f5e9', color: '#2E7D32', opacity: isBusy ? 0.5 : 1 }}>
                            {isBusy ? '...' : <Icons.Check size={12} />}
                          </button>
                        )}
                        {!['CANCELADO', 'ENTREGADO'].includes(estado) && (
                          <button onClick={() => pedirConfirmacionCancelar(p.id)} disabled={isBusy} title="Cancelar pedido" style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: isBusy ? 'wait' : 'pointer', border: 'none', background: '#ffebee', color: '#c62828', opacity: isBusy ? 0.5 : 1 }}>
                            <Icons.X size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', background: page === 1 ? '#f9fafb' : '#fff' }}>Anterior</button>
          <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', background: page === totalPages ? '#f9fafb' : '#fff' }}>Siguiente</button>
        </div>
      )}

      {/* Modal detalle del pedido */}
      {detail && (
        <>
          <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 800, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '580px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            {detailLoading ? (
              <p style={{ textAlign: 'center', color: 'var(--subtle)', padding: '2rem' }}>Cargando detalle...</p>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: 0 }}>Pedido #{detail.id}</h3>
                  {detail.estado && (
                    <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: STATUS_COLORS[detail.estado]?.bg || '#f5f5f5', color: STATUS_COLORS[detail.estado]?.color || '#555' }}>
                      {STATUS_COLORS[detail.estado]?.label || detail.estado}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Cliente', value: detail.clientes?.nombre || detail.cliente?.nombre || 'Consumidor final' },
                    { label: 'Teléfono', value: detail.clientes?.telefono || detail.cliente?.telefono || '-' },
                    { label: 'Fecha', value: detail.created_at ? new Date(detail.created_at).toLocaleString('es') : '-' },
                    { label: 'Total', value: `$${parseFloat(detail.total || 0).toFixed(2)}` },
                    { label: 'Dirección', value: detail.direccion_entrega || '-', full: true },
                    ...(detail.observaciones ? [{ label: 'Observaciones', value: detail.observaciones, full: true }] : [])
                  ].map((f, i) => (
                    <div key={i} style={f.full ? { gridColumn: '1 / -1' } : {}}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--subtle)', marginBottom: '0.2rem', marginTop: 0 }}>{f.label}</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-fg)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Productos</p>
                {toArr(detail.detalle_pedido).length === 0 ? (
                  <p style={{ color: 'var(--subtle)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Sin productos registrados</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--secondary)' }}>
                        {['Producto', 'Cant.', 'Precio unit.', 'Subtotal'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {toArr(detail.detalle_pedido).map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>{d.productos?.nombre || d.producto?.nombre || '-'}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{d.cantidad}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>${parseFloat(d.precio_unitario || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>${parseFloat(d.subtotal || (d.cantidad * d.precio_unitario) || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'var(--secondary)' }}>
                        <td colSpan={3} style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.875rem', textAlign: 'right' }}>Total</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '1rem' }}>${parseFloat(detail.total || 0).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {detail.estado === 'PENDIENTE_CONFIRMACION' && (
                    <button disabled={updating === detail.id} onClick={() => handleConfirmar(detail.id)} style={{ padding: '0.65rem 1.25rem', background: '#e8f5e9', color: '#2E7D32', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: updating === detail.id ? 'wait' : 'pointer', opacity: updating === detail.id ? 0.6 : 1 }}>
                      {updating === detail.id ? 'Confirmando...' : 'Confirmar pedido'}
                    </button>
                  )}
                  {detail.estado === 'CONFIRMADO' && (
                    <button disabled={updating === detail.id} onClick={() => changeStatus(detail.id, 'EN_RUTA')} style={{ padding: '0.65rem 1.25rem', background: '#e3f2fd', color: '#1565C0', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: updating === detail.id ? 'wait' : 'pointer', opacity: updating === detail.id ? 0.6 : 1 }}>
                      En ruta
                    </button>
                  )}
                  {['CONFIRMADO', 'EN_RUTA'].includes(detail.estado) && (
                    <button disabled={updating === detail.id} onClick={() => changeStatus(detail.id, 'ENTREGADO')} style={{ padding: '0.65rem 1.25rem', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: updating === detail.id ? 'wait' : 'pointer', opacity: updating === detail.id ? 0.6 : 1 }}>
                      {updating === detail.id ? 'Procesando...' : 'Marcar entregado'}
                    </button>
                  )}
                  {!['CANCELADO', 'ENTREGADO'].includes(detail.estado) && (
                    <button disabled={updating === detail.id} onClick={() => pedirConfirmacionCancelar(detail.id, true)} style={{ padding: '0.65rem 1.25rem', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: updating === detail.id ? 'wait' : 'pointer', opacity: updating === detail.id ? 0.6 : 1 }}>
                      Cancelar pedido
                    </button>
                  )}
                  <button onClick={() => setDetail(null)} style={{ padding: '0.65rem 1.25rem', background: 'var(--secondary)', color: 'var(--fg)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminPedidos