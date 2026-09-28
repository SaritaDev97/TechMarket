import { useState, useEffect } from 'react'
import { getClientes, createCliente, updateCliente, deleteCliente, buscarCliente, getPedidos } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import Modal from './shared/Modal'
import Pagination from './shared/Pagination'

const emptyForm = { nombre: '', documento: '', telefono: '', email: '', direccion: '' }

// --- SVG Icons ---
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
)
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
)
const IconHistory = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
)
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const IconPackage = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
)

// --- Status helpers ---
const STATUS_CONFIG = {
  PENDIENTE_CONFIRMACION: { label: 'Pendiente', bg: '#fff8e1', color: '#f57f17', border: '#ffe082' },
  CONFIRMADO: { label: 'Confirmado', bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
  EN_RUTA: { label: 'En ruta', bg: '#fff3e0', color: '#e65100', border: '#ffb74d' },
  ENTREGADO: { label: 'Entregado', bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
  CANCELADO: { label: 'Cancelado', bg: '#ffebee', color: '#c62828', border: '#ef9a9a' },
}

function StatusBadge({ estado }) {
  const cfg = STATUS_CONFIG[estado] || { label: estado, bg: '#f5f5f5', color: '#555', border: '#ddd' }
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  )
}

function formatDate(str) {
  if (!str) return '-'
  return new Date(str).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
}

// --- Main component ---
function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Historial de compras
  const [historialCliente, setHistorialCliente] = useState(null)
  const [historialData, setHistorialData] = useState([])
  const [historialLoading, setHistorialLoading] = useState(false)
  const [historialPage, setHistorialPage] = useState(1)
  const [pedidoDetalle, setPedidoDetalle] = useState(null)
  
  const HISTORIAL_LIMIT = 6
  const limit = 10

  function cargar() {
    setLoading(true)
    getClientes({ page, limit })
      .then(r => {
        setClientes(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => setError('Error al cargar clientes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [page])

  async function handleBuscar() {
    if (!search.trim()) return cargar()
    setLoading(true)
    try {
      const r = await buscarCliente(search.trim())
      setClientes(toArr(r.data))
      setTotal(toTotal(r.data))
    } catch {
      setClientes([])
      setTotal(0)
    } finally { setLoading(false) }
  }

  function handleEdit(c) {
    setEditItem(c)
    setForm({
      nombre: c.nombre || '', 
      documento: c.documento || '',
      telefono: c.telefono || '', 
      email: c.email || '', 
      direccion: c.direccion || ''
    })
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este cliente?')) return
    try {
      await deleteCliente(id)
      setClientes(prev => prev.filter(c => c.id !== id))
    } catch { alert('No se pudo eliminar') }
  }

  async function handleVerHistorial(cliente) {
    setHistorialCliente(cliente)
    setHistorialData([])
    setHistorialPage(1)
    setPedidoDetalle(null)
    setHistorialLoading(true)
    try {
      const r = await getPedidos({ cliente_id: cliente.id, limit: 100 })
      setHistorialData(toArr(r.data))
    } catch {
      setHistorialData([])
    } finally { setHistorialLoading(false) }
  }

  async function handleSubmit() {
    if (!form.nombre.trim()) return setError('El nombre es requerido')
    setSaving(true); setError(null)
    try {
      if (editItem) {
        const { data } = await updateCliente(editItem.id, form)
        setClientes(prev => prev.map(c => c.id === editItem.id ? (data?.data || data) : c))
      } else {
        const { data } = await createCliente(form)
        setClientes(prev => [data?.data || data, ...prev])
      }
      setShowForm(false); setEditItem(null); setForm(emptyForm)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  
  // Totales para el historial
  const historialStats = historialData.reduce((acc, p) => ({
    total: acc.total + Number(p.total || 0),
    entregados: acc.entregados + (p.estado === 'ENTREGADO' ? 1 : 0)
  }), { total: 0, entregados: 0 })

  // Paginación cliente-side del historial
  const historialTotalPages = Math.max(1, Math.ceil(historialData.length / HISTORIAL_LIMIT))
  const historialPaged = historialData.slice((historialPage - 1) * HISTORIAL_LIMIT, historialPage * HISTORIAL_LIMIT)

  return (
    <div>
      {/* Barra superior */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', display: 'flex' }}>
              <IconSearch />
            </span>
            <input type="text" placeholder="Buscar por nombre, documento..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBuscar()}
              style={{ padding: '0.65rem 1rem 0.65rem 2.4rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', width: '260px', outline: 'none' }}
            />
          </div>
          <button onClick={handleBuscar} style={{ padding: '0.65rem 1rem', background: 'var(--secondary)', border: '1.5px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            Buscar
          </button>
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); cargar() }} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.65rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--subtle)' }}>
              <IconClose /> Limpiar
            </button>
          )}
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          <IconPlus /> Nuevo cliente
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 3px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['Cliente', 'Documento', 'Teléfono', 'Email', 'Dirección', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin clientes registrados</td></tr>
              ) : clientes.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                        <IconUser />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--muted-fg)' }}>{c.documento || '-'}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{c.telefono || '-'}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{c.email || '-'}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--subtle)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.direccion || '-'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <ActionBtn onClick={() => handleVerHistorial(c)} color="#1565c0" bg="#e3f2fd" hoverBg="var(--accent)" title="Ver historial de compras" icon={<IconHistory />} label="Historial" />
                      <ActionBtn onClick={() => handleEdit(c)} color="var(--accent)" bg="transparent" hoverBg="#1565c0" title="Editar cliente" icon={<IconEdit />} label="Editar" />
                      <ActionBtn onClick={() => handleDelete(c.id)} color="#c62828" bg="transparent" hoverBg="#c62828" title="Eliminar cliente" icon={<IconTrash />} label="Eliminar" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal Editar / Crear */}
      {showForm && (
        <Modal onClose={() => { setShowForm(false); setError(null) }} maxWidth="480px">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>
            {editItem ? 'Editar cliente' : 'Nuevo cliente'}
          </h3>
          {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem', background: '#ffebee', padding: '0.6rem', borderRadius: '6px' }}>{error}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Nombre', key: 'nombre' },
              { label: 'Documento', key: 'documento' },
              { label: 'Teléfono', key: 'telefono' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Dirección', key: 'direccion' }
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--muted-fg)' }}>{f.label}</label>
                <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Guardando...' : editItem ? 'Guardar' : 'Crear'}
            </button>
            <button onClick={() => { setShowForm(false); setError(null) }} style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Historial de Compras */}
      {historialCliente && (
        <Modal onClose={() => setHistorialCliente(null)} maxWidth="620px">
          {/* Cabecera */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0 }}>{historialCliente.nombre}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', margin: '0.2rem 0 0' }}>
                {historialCliente.telefono && `${historialCliente.telefono} • `}{historialCliente.email || 'Sin email'}
              </p>
            </div>
          </div>

          {/* Stats */}
          {!historialLoading && historialData.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Pedidos totales', value: historialData.length, color: '#1565c0' },
                { label: 'Entregados', value: historialStats.entregados, color: '#2e7d32' },
                { label: 'Total gastado', value: `$${historialStats.total.toFixed(2)}`, color: 'var(--accent)' }
              ].map(s => (
                <div key={s.label} style={{ background: '#f8f9fb', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--subtle)', margin: '0.2rem 0 0', fontWeight: 500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Lista de pedidos paginada */}
          {historialLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: '56px', background: '#f3f4f6', borderRadius: '8px' }} />
              ))}
            </div>
          ) : historialData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{ marginBottom: '0.75rem', color: '#d1d5db' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280', margin: 0 }}>Sin compras registradas</p>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0.3rem 0 0' }}>Este cliente aún no ha realizado pedidos</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    {['Pedido', 'Fecha', 'Estado', 'Total', ''].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historialPaged.map(pedido => (
                    <tr key={pedido.id} style={{ borderBottom: '1px solid #f9fafb' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>#{pedido.id}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(pedido.created_at)}</td>
                      <td style={{ padding: '0.75rem' }}><StatusBadge estado={pedido.estado} /></td>
                      <td style={{ padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>
                        ${Number(pedido.total || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button onClick={() => setPedidoDetalle(pedido)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, background: 'transparent', border: '1.5px solid var(--accent)', transition: 'background 0.15s, color 0.15s', whiteSpace: 'nowrap' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)' }}>
                          <IconHistory /> Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación historial */}
          {historialTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', marginTop: '0.75rem' }}>
              <button onClick={() => setHistorialPage(p => Math.max(1, p - 1))} disabled={historialPage === 1} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: historialPage === 1 ? '#f9fafb' : '#fff', color: historialPage === 1 ? '#d1d5db' : '#374151', cursor: historialPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                &larr; Ant.
              </button>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Pág. {historialPage} de {historialTotalPages}</span>
              <button onClick={() => setHistorialPage(p => Math.min(historialTotalPages, p + 1))} disabled={historialPage === historialTotalPages} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: historialPage === historialTotalPages ? '#f9fafb' : '#fff', color: historialPage === historialTotalPages ? '#d1d5db' : '#374151', cursor: historialPage === historialTotalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                Sig. &rarr;
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* Sub-modal: Detalle de pedido */}
      {pedidoDetalle && (
        <Modal onClose={() => setPedidoDetalle(null)} maxWidth="560px">
          {/* Cabecera */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Pedido #{pedidoDetalle.id}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>{formatDate(pedidoDetalle.created_at)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                ${Number(pedidoDetalle.total || 0).toFixed(2)}
              </span>
              <StatusBadge estado={pedidoDetalle.estado} />
            </div>
          </div>

          {/* Productos */}
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem' }}>Productos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
            {(pedidoDetalle.detalle_pedido || []).length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Sin detalles disponibles</p>
            ) : (
              (pedidoDetalle.detalle_pedido || []).map((d, i) => {
                const prod = d.productos || d
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.875rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                    {prod.imagen ? (
                      <img src={prod.imagen} alt={prod.nombre} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconPackage />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#111827' }}>
                        {prod.nombre || '-'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.1rem 0 0' }}>
                        ${Number(d.precio_unitario || 0).toFixed(2)} c/u x {d.cantidad}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                      ${Number(d.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Dirección */}
          {pedidoDetalle.direccion_entrega && (
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.65rem 0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: '#667280' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '0.1rem' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {pedidoDetalle.direccion_entrega}
            </div>
          )}

          {/* Observaciones */}
          {pedidoDetalle.observaciones && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '0.65rem 0.875rem', fontSize: '0.82rem', color: '#92400e' }}>
              <strong>Nota:</strong> {pedidoDetalle.observaciones}
            </div>
          )}

          {/* Resumen total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #f3f4f6' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>Total del pedido</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', margin: '0.1rem 0 0', fontFamily: 'var(--font-display)' }}>
                ${Number(pedidoDetalle.total || 0).toFixed(2)}
              </p>
            </div>
          </div>
          
          <button onClick={() => setPedidoDetalle(null)} style={{ width: '100%', marginTop: '1rem', padding: '0.7rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>
            Cerrar
          </button>
        </Modal>
      )}
    </div>
  )
}

// Action button
function ActionBtn({ onClick, color, bg, hoverBg, title, icon, label }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${color}`, color: hover ? '#fff' : color, background: hover ? hoverBg : bg, transition: 'background 0.15s, color 0.15s', whiteSpace: 'nowrap' }}>
      {icon} {label}
    </button>
  )
}

export default AdminClientes