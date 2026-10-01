import { useState, useEffect, useCallback } from 'react'
import {
  getProductos,
  getCategorias,
  createProducto,
  updateProducto,
  deleteProducto
} from '../../services/api'

import { toArr, toTotal } from '../../utils/parseResponse'
import Modal from './shared/Modal'
import Pagination from './shared/Pagination'
import * as Icons from './shared/Icons'

const API_URL = 'http://localhost:3000'

const emptyForm = {
  nombre: '',
  codigo: '',
  marca: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagen: '',
  categoria_id: '',
  estado: 'ACTIVO'
}

const LIMIT = 12

function getImageUrl(imagen) {
  if (!imagen) return ''

  // Imagen externa
  if (
    imagen.startsWith('http://') ||
    imagen.startsWith('https://') ||
    imagen.startsWith('data:') ||
    imagen.startsWith('blob:')
  ) {
    return imagen
  }

  // NUEVAS imágenes subidas desde el administrador.
  // Estas están guardadas en el backend.
  if (imagen.startsWith('/uploads/')) {
    return `${API_URL}${imagen}`
  }

  // Imágenes antiguas del proyecto.
  // Estas siguen siendo servidas por Vite/frontend.
  return imagen
}

function AdminProductos() {
  const [products, setProducts] = useState([])
  const [categorias, setCategorias] = useState([])

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

  // Imagen seleccionada desde la computadora
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Cargar categorías
  useEffect(() => {
    getCategorias()
      .then(r => setCategorias(toArr(r.data)))
      .catch(() => setCategorias([]))
  }, [])

  // Liberar memoria de previews blob
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const cargar = useCallback(() => {
    const params = {
      page,
      limit: LIMIT
    }

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
      .catch(() => {
        setError('Error al cargar productos')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [
    page,
    search,
    filterCat,
    filterMarca,
    filterMin,
    filterMax,
    filterStock
  ])

  useEffect(() => {
    cargar()
  }, [cargar])

  function resetFiltros() {
    setSearch('')
    setFilterCat('')
    setFilterMarca('')
    setFilterMin('')
    setFilterMax('')
    setFilterStock(false)
    setPage(1)
  }

  function resetFormulario() {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setForm(emptyForm)
    setEditProduct(null)
    setImageFile(null)
    setImagePreview('')
    setError(null)
  }

  function abrirNuevoProducto() {
    resetFormulario()
    setShowForm(true)
  }

  function cerrarFormulario() {
    resetFormulario()
    setShowForm(false)
  }

  function handleEdit(product) {
    setEditProduct(product)

    setForm({
      nombre: product.nombre || '',
      codigo: product.codigo || '',
      marca: product.marca || '',
      descripcion: product.descripcion || '',
      precio:
        product.precio ||
        product.precio_venta ||
        '',
      stock: product.stock ?? 0,
      imagen: product.imagen || '',
      categoria_id:
        product.categoria_id ||
        product.categorias?.id ||
        '',
      estado:
        product.activo === false
          ? 'INACTIVO'
          : product.estado || 'ACTIVO'
    })

    setImageFile(null)
    setImagePreview(
      product.imagen
        ? getImageUrl(product.imagen)
        : ''
    )

    setError(null)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) {
      return
    }

    try {
      await deleteProducto(id)

      setProducts(prev =>
        prev.filter(product => product.id !== id)
      )

      setTotal(current =>
        Math.max(0, current - 1)
      )
    } catch {
      alert('No se pudo eliminar')
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]

    if (!tiposPermitidos.includes(file.type)) {
      setError(
        'Solo se permiten imágenes JPG, PNG o WEBP'
      )

      event.target.value = ''
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setError(
        'La imagen no puede superar los 5 MB'
      )

      event.target.value = ''
      return
    }

    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
  }

  function removeSelectedImage() {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(null)
    setImagePreview('')

    setForm(prev => ({
      ...prev,
      imagen: ''
    }))
  }

  async function handleSubmit() {
    if (!form.nombre.trim()) {
      return setError(
        'El nombre es requerido'
      )
    }

    if (!form.precio) {
      return setError(
        'El precio es requerido'
      )
    }

    const precio = Number(form.precio)

    if (
      Number.isNaN(precio) ||
      precio < 0
    ) {
      return setError(
        'El precio debe ser válido'
      )
    }

    const stock = Number(form.stock || 0)

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return setError(
        'El stock debe ser un número entero mayor o igual a 0'
      )
    }

    setSaving(true)
    setError(null)

    try {
      const payload = new FormData()

      payload.append(
        'nombre',
        form.nombre.trim()
      )

      payload.append(
        'precio_venta',
        String(precio)
      )

      payload.append(
        'stock',
        String(stock)
      )

      payload.append(
        'activo',
        String(form.estado === 'ACTIVO')
      )

      if (form.marca.trim()) {
        payload.append(
          'marca',
          form.marca.trim()
        )
      }

      if (form.descripcion.trim()) {
        payload.append(
          'descripcion',
          form.descripcion.trim()
        )
      }

      if (form.categoria_id) {
        payload.append(
          'categoria_id',
          String(form.categoria_id)
        )
      }

      // Si seleccionamos una imagen nueva,
      // Multer la recibirá en req.file.
      if (imageFile) {
        payload.append(
          'imagen',
          imageFile
        )
      } else if (
        editProduct &&
        form.imagen
      ) {
        // Al editar sin cambiar imagen,
        // mantenemos la ruta anterior.
        payload.append(
          'imagen',
          form.imagen
        )
      }

      if (editProduct) {
        const { data } =
          await updateProducto(
            editProduct.id,
            payload
          )

        const updated =
          data?.data || data

        setProducts(prev =>
          prev.map(product =>
            product.id === editProduct.id
              ? updated
              : product
          )
        )
      } else {
        const { data } =
          await createProducto(payload)

        const created =
          data?.data || data

        setProducts(prev => [
          created,
          ...prev
        ])

        setTotal(current =>
          current + 1
        )
      }

      cerrarFormulario()
    } catch (err) {
      console.error(
        'Error al guardar producto:',
        err
      )

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al guardar'
      )
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(total / LIMIT)
  )

  const hayFiltros =
    search ||
    filterCat ||
    filterMarca ||
    filterMin ||
    filterMax ||
    filterStock

  const fi = (
    label,
    key,
    type = 'text',
    placeholder = ''
  ) => (
    <div key={key}>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        min={
          type === 'number'
            ? '0'
            : undefined
        }
        onChange={event =>
          setForm(prev => ({
            ...prev,
            [key]: event.target.value
          }))
        }
        style={inputStyle}
      />
    </div>
  )

  return (
    <div>
      {/* BARRA SUPERIOR */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div
          style={{
            position: 'relative'
          }}
        >
          <Icons.Search
            size={15}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--subtle)'
            }}
          />

          <input
            type="text"
            placeholder="Buscar producto, código..."
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            style={{
              padding:
                '0.65rem 0.65rem 0.65rem 2.4rem',
              border:
                '1.5px solid var(--border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              width: '280px',
              outline: 'none'
            }}
          />
        </div>

        <button
          onClick={abrirNuevoProducto}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            padding:
              '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          + Agregar producto
        </button>
      </div>

      {/* GRID PRODUCTOS */}

      {loading ? (
        <div style={gridStyle}>
          {Array.from({
            length: 8
          }).map((_, index) => (
            <div
              key={index}
              style={{
                background: '#f4f6fb',
                borderRadius: '12px',
                height: '340px',
                animation:
                  'pulse 1.4s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            color: 'var(--subtle)'
          }}
        >
          <div
            style={{
              marginBottom: '1rem',
              color: '#ccc'
            }}
          >
            <Icons.Package size={48} />
          </div>

          <p
            style={{
              fontWeight: 600
            }}
          >
            No se encontraron productos
          </p>

          {hayFiltros && (
            <button
              onClick={resetFiltros}
              style={{
                marginTop: '1rem',
                padding:
                  '0.5rem 1.25rem',
                borderRadius: '8px',
                border:
                  '1.5px solid var(--accent)',
                color: 'var(--accent)',
                background: 'transparent',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div style={gridStyle}>
          {products.map(product => (
            <ProductAdminCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* MODAL CREAR / EDITAR */}

      {showForm && (
        <Modal
          onClose={cerrarFormulario}
          maxWidth="650px"
        >
          <h3
            style={{
              fontFamily:
                'var(--font-display)',
              fontSize: '1.3rem',
              marginBottom: '1.5rem'
            }}
          >
            {editProduct
              ? 'Editar producto'
              : 'Agregar producto'}
          </h3>

          {error && (
            <p
              style={{
                color: '#c62828',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                background: '#ffebee',
                padding: '0.6rem 1rem',
                borderRadius: '6px'
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '0.875rem'
            }}
          >
            {fi(
              'Nombre *',
              'nombre'
            )}

            {fi(
              'Código / SKU',
              'codigo'
            )}

            {fi(
              'Marca',
              'marca'
            )}

            {fi(
              'Precio *',
              'precio',
              'number'
            )}

            {fi(
              'Stock',
              'stock',
              'number'
            )}

            <div>
              <label style={labelStyle}>
                Estado
              </label>

              <select
                value={form.estado}
                onChange={event =>
                  setForm(prev => ({
                    ...prev,
                    estado:
                      event.target.value
                  }))
                }
                style={selectStyle}
              >
                <option value="ACTIVO">
                  Activo
                </option>

                <option value="INACTIVO">
                  Inactivo
                </option>
              </select>
            </div>
          </div>

          {/* CATEGORÍA */}

          <div
            style={{
              marginTop: '0.875rem'
            }}
          >
            <label style={labelStyle}>
              Categoría
            </label>

            <select
              value={form.categoria_id}
              onChange={event =>
                setForm(prev => ({
                  ...prev,
                  categoria_id:
                    event.target.value
                }))
              }
              style={selectStyle}
            >
              <option value="">
                Sin categoría
              </option>

              {categorias.map(category => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPCIÓN */}

          <div
            style={{
              marginTop: '0.875rem'
            }}
          >
            <label style={labelStyle}>
              Descripción
            </label>

            <textarea
              value={form.descripcion}
              onChange={event =>
                setForm(prev => ({
                  ...prev,
                  descripcion:
                    event.target.value
                }))
              }
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical'
              }}
            />
          </div>

          {/* IMAGEN */}

          <div
            style={{
              marginTop: '1rem'
            }}
          >
            <label style={labelStyle}>
              Imagen del producto
            </label>

            <div
              style={{
                border:
                  '1.5px dashed var(--border)',
                borderRadius: '10px',
                padding: '1rem',
                background: '#fafafa'
              }}
            >
              {imagePreview ? (
                <div
                  style={{
                    marginBottom: '1rem'
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    style={{
                      width: '100%',
                      maxHeight: '220px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      background: '#fff',
                      border:
                        '1px solid var(--border)'
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: '130px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                    color: '#9ca3af',
                    marginBottom: '1rem'
                  }}
                >
                  <Icons.Package
                    size={42}
                  />

                  <p
                    style={{
                      margin:
                        '0.5rem 0 0',
                      fontSize: '0.8rem'
                    }}
                  >
                    Sin imagen seleccionada
                  </p>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <label
                  style={{
                    display: 'inline-block',
                    background:
                      'var(--accent)',
                    color: '#fff',
                    padding:
                      '0.6rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Seleccionar imagen

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    style={{
                      display: 'none'
                    }}
                  />
                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={
                      removeSelectedImage
                    }
                    style={{
                      background:
                        'transparent',
                      border:
                        '1.5px solid #c62828',
                      color: '#c62828',
                      padding:
                        '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Quitar imagen
                  </button>
                )}
              </div>

              <p
                style={{
                  margin:
                    '0.75rem 0 0',
                  color: '#9ca3af',
                  fontSize: '0.72rem'
                }}
              >
                Formatos permitidos:
                JPG, PNG y WEBP. Máximo
                5 MB.
              </p>
            </div>
          </div>

          {/* BOTONES */}

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.5rem'
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                flex: 1,
                background:
                  'var(--accent)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
                opacity: saving
                  ? 0.7
                  : 1
              }}
            >
              {saving
                ? 'Guardando...'
                : editProduct
                  ? 'Guardar cambios'
                  : 'Agregar'}
            </button>

            <button
              onClick={cerrarFormulario}
              disabled={saving}
              style={{
                flex: 1,
                background:
                  'var(--secondary)',
                color: 'var(--fg)',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '1.25rem',
  marginBottom: '1.5rem'
}

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--muted-fg)',
  display: 'block',
  marginBottom: '0.3rem'
}

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  border:
    '1.5px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
}

const selectStyle = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  border:
    '1.5px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.875rem',
  outline: 'none',
  background: '#fff',
  fontFamily: 'inherit'
}

function ProductAdminCard({
  product: product,
  onEdit,
  onDelete
}) {
  const price = Number(
    product.precio ||
    product.precio_venta ||
    0
  )

  const stockOk =
    Number(product.stock) > 0

  const imageUrl =
    getImageUrl(product.imagen)

  const activo =
    product.activo !== false &&
    product.estado !== 'INACTIVO'

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border:
          '1.5px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow:
          '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          background:
            'var(--secondary)',
          overflow: 'hidden'
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nombre}
            loading="lazy"
            onError={event => {
              event.currentTarget.style.display =
                'none'
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',
              color: '#ccc'
            }}
          >
            <Icons.Package
              size={40}
            />
          </div>
        )}

        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: activo
              ? '#2E7D32'
              : '#c62828',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px'
          }}
        >
          {activo
            ? 'ACTIVO'
            : 'INACTIVO'}
        </span>
      </div>

      <div
        style={{
          padding: '0.875rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap'
          }}
        >
          {product.marca && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color:
                  'var(--accent)',
                textTransform:
                  'uppercase'
              }}
            >
              {product.marca}
            </span>
          )}

          {product.categorias?.nombre && (
            <span
              style={{
                fontSize: '0.7rem',
                color:
                  'var(--subtle)',
                background:
                  'var(--secondary)',
                padding: '1px 6px',
                borderRadius: '4px'
              }}
            >
              {
                product.categorias
                  .nombre
              }
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 1.35,
            flex: 1
          }}
        >
          {product.nombre}
        </p>

        {product.codigo && (
          <p
            style={{
              fontSize: '0.7rem',
              color: 'var(--subtle)',
              fontFamily:
                'monospace'
            }}
          >
            {product.codigo}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.4rem',
            marginTop: '0.25rem'
          }}
        >
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--fg)'
            }}
          >
            ${price.toFixed(2)}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.25rem'
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '20px',
              background: stockOk
                ? '#e8f5e9'
                : '#ffebee',
              color: stockOk
                ? '#2E7D32'
                : '#c62828'
            }}
          >
            {product.stock} uds
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.8rem'
          }}
        >
          <button
            onClick={() =>
              onEdit(product)
            }
            style={{
              flex: 1,
              padding: '0.45rem 0',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border:
                '1.5px solid var(--accent)',
              color:
                'var(--accent)',
              background:
                'transparent'
            }}
          >
            Editar
          </button>

          <button
            onClick={() =>
              onDelete(product.id)
            }
            style={{
              flex: 1,
              padding: '0.45rem 0',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border:
                '1.5px solid #c62828',
              color: '#c62828',
              background:
                'transparent'
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProductos