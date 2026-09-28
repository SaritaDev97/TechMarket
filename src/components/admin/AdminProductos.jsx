import { useState, useEffect, useCallback, useRef } from 'react'
import { getProductos, getCategorias, getMarcas, createProducto, updateProducto, deleteProducto, uploadImagen } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import Modal from './shared/Modal'
import Pagination from './shared/Pagination'
import * as Icons from './shared/Icons'

const emptyForm = {
  nombre: '', codigo: '', marca: '', descripcion: '',
  precio: '', stock: '', imagen: '', categoria_id: '', estado: 'ACTIVO'
}

const LIMIT = 12

function AdminProductos() {
  const [products, setProducts] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  
  // Filtros
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterMarca, setFilterMarca] = useState('')
  const [filterMin, setFilterMin] = useState('')
  const [filterMax, setFilterMax] = useState('')
  const [filterStock, setFilterStock] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  // Cargar datos auxiliares
  useEffect(() => {
    Promise.all([
      getCategorias().catch(() => ({ data: [] })),
      getMarcas().catch(() => ({ data: [] }))
    ]).then(([cats, mrcs]) => {
      setCategorias(toArr(cats.data))
      const mrcList = mrcs.data?.data ?? mrcs.data
      setMarcas(Array.isArray(mrcList) ? mrcList : [])
    })
  }, [])

  const cargar = useCallback(() => {
    const params = { page, limit: LIMIT }
    setLoading(true)
    if (search) params.buscar = search
    if (filterCat) params.categoria_id = filterCat
    if (filterMarca) params.marca = filterMarca
    if (filterMin) params.minPrice = filterMin
    if (filterMax) params.maxPrice = filterMax
    if (filterStock) params.inStock = 'true'

    getProductos(params)
      .then(r => {
        setProducts(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => setError('Error al cargar productos'))
      .finally(() => setLoading(false))
  }, [page, search, filterCat, filterMarca, filterMin, filterMax, filterStock])

  useEffect(() => { cargar() }, [cargar])

  function resetFiltros() {
    setSearch(''); setFilterCat(''); setFilterMarca('');
    setFilterMin(''); setFilterMax(''); setFilterStock(false);
    setPage(1)
  }

  function handleEdit(p) {
    setEditProduct(p)
    setForm({
      nombre: p.nombre || '',
      codigo: p.codigo || '',
      marca: p.marca || '',
      descripcion: p.descripcion || '',
      precio: p.precio || p.precio_venta || '',
      stock: p.stock || 0,
      imagen: p.imagen || '',
      categoria_id: p.categoria_id || p.categorias?.id || '',
      estado: p.estado || 'ACTIVO'
    })
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteProducto(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setTotal(t => t - 1)
    } catch { alert('No se pudo eliminar') }
  }

  async function handleSubmit() {
    if (!form.nombre.trim()) return setError('El nombre es requerido')
    if (!form.precio) return setError('El precio es requerido')
    
    setSaving(true); setError(null)
    
    try {
      // TRUCO DE COMPATIBILIDAD APLICADO AQUÍ
      const payload = {
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim() || undefined,
        marca: form.marca.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        precio_venta: parseFloat(form.precio), // Mapeado para el backend
        stock: parseInt(form.stock) || 0,
        stock_minimo: 5, // Valor por defecto obligatorio para el backend
        imagen: form.imagen.trim() || undefined,
        categoria_id: form.categoria_id ? parseInt(form.categoria_id) : undefined,
        estado: form.estado
      }

      if (editProduct) {
        const { data } = await updateProducto(editProduct.id, payload)
        setProducts(prev => prev.map(p => p.id === editProduct.id ? (data?.data || data) : p))
      } else {
        const { data } = await createProducto(payload)
        setProducts(prev => [data?.data || data, ...prev])
        setTotal(t => t + 1)
      }
      setShowForm(false); setEditProduct(null); setForm(emptyForm)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al guardar')
    } finally { setSaving(false) }
  }

  async function handleImageUpload(file) {
    if (!file) return
    setUploading(true)
    try {
      const { data } = await uploadImagen(file)
      if (data?.url) setForm(p => ({ ...p, imagen: data.url }))
    } catch { setError('Error al subir la imagen') }
    finally { setUploading(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const hayFiltros = search || filterCat || filterMarca || filterMin || filterMax || filterStock

  const fi = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        style={inputStyle}
      />
    </div>
  )

  return (
    <div>
      {/* Barra superior */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <Icons.Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
          <input type="text" placeholder="Buscar producto, código..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ padding: '0.65rem 0.65rem 0.65rem 2.4rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', width: '280px', outline: 'none' }}
          />
        </div>
        <button onClick={() => { setShowForm(true); setEditProduct(null); setForm(emptyForm); setError(null) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Agregar producto
        </button>
      </div>

      {/* Grid de cards */}
      {loading ? (
        <div style={gridStyle}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: '#f4f6fb', borderRadius: '12px', height: '340px', animation: 'pulse 1.4s ease-in-out infinite' }}></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--subtle)' }}>
          <div style={{ marginBottom: '1rem', color: '#ccc' }}><Icons.Package size={48} /></div>
          <p style={{ fontWeight: 600 }}>No se encontraron productos</p>
          {hayFiltros && <button onClick={resetFiltros} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>Limpiar filtros</button>}
        </div>
      ) : (
        <div style={gridStyle}>
          {products.map(p => (
            <ProductAdminCard key={p.id} product={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal crear/editar */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} maxWidth="600px">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>
            {editProduct ? 'Editar producto' : 'Agregar producto'}
          </h3>
          {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem', background: '#ffebee', padding: '0.6rem 1rem', borderRadius: '6px' }}>{error}</p>}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {fi('Nombre *', 'nombre')}
            {fi('Código / SKU', 'codigo')}
            {fi('Marca', 'marca')}
            {fi('Precio *', 'precio', 'number')}
            {fi('Stock', 'stock', 'number')}
            
            <div>
              <label style={labelStyle}>Estado</label>
              <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))} style={selectStyle}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '0.875rem' }}>
            <label style={labelStyle}>Categoría</label>
            <select value={form.categoria_id} onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))} style={selectStyle}>
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div style={{ marginTop: '0.875rem' }}>
            <label style={labelStyle}>Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Guardando...' : editProduct ? 'Guardar cambios' : 'Agregar'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Estilos y Componente Tarjeta
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }
const labelStyle = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: '0.3rem' }
const inputStyle = { width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
const selectStyle = { width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#fff', fontFamily: 'inherit' }

function ProductAdminCard({ product: p, onEdit, onDelete }) {
  const precio = parseFloat(p.precio || p.precio_venta || 0)
  const stockOk = p.stock > 0

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--secondary)', overflow: 'hidden' }}>
        {p.imagen ? <img src={p.imagen} alt={p.nombre} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}><Icons.Package size={40} /></div>}
        <span style={{ position: 'absolute', top: '8px', right: '8px', background: p.estado === 'ACTIVO' ? '#2E7D32' : '#c62828', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
          {p.estado || 'ACTIVO'}
        </span>
      </div>
      
      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {p.marca && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>{p.marca}</span>}
          {p.categorias?.nombre && <span style={{ fontSize: '0.7rem', color: 'var(--subtle)', background: 'var(--secondary)', padding: '1px 6px', borderRadius: '4px' }}>{p.categorias.nombre}</span>}
        </div>
        
        <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.35, flex: 1 }}>{p.nombre}</p>
        {p.codigo && <p style={{ fontSize: '0.7rem', color: 'var(--subtle)', fontFamily: 'monospace' }}>{p.codigo}</p>}
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--fg)' }}>${precio.toFixed(2)}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: stockOk ? '#e8f5e9' : '#ffebee', color: stockOk ? '#2E7D32' : '#c62828' }}>
            {p.stock} uds
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
          <button onClick={() => onEdit(p)} style={{ flex: 1, padding: '0.45rem 0', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}>
            Editar
          </button>
          <button onClick={() => onDelete(p.id)} style={{ flex: 1, padding: '0.45rem 0', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: '1.5px solid #c62828', color: '#c62828', background: 'transparent' }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProductos