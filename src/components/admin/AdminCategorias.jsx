import { useState, useEffect } from 'react'
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../../services/api'
import { toArr } from '../../utils/parseResponse'
import Modal from './shared/Modal'
import * as Icons from './shared/Icons'

const API_URL = 'http://localhost:3000'

const emptyForm = {
  nombre: '',
  descripcion: ''
}

// Imágenes antiguas de respaldo.
// Las categorías existentes seguirán mostrando estas imágenes
// mientras no tengan una imagen propia guardada en PostgreSQL.
const CAT_IMAGES = {
  Computadoras:
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400',

  Celulares:
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400',

  Audio:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400',

  Accesorios:
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400',

  Videojuegos:
    'https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=400',

  Monitores:
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400'
}

function getCatImage(nombre) {
  if (!nombre) return null

  if (CAT_IMAGES[nombre]) {
    return CAT_IMAGES[nombre]
  }

  const key = Object.keys(CAT_IMAGES).find(k =>
    nombre
      .toLowerCase()
      .includes(k.toLowerCase())
  )

  return key ? CAT_IMAGES[key] : null
}

// Determina de dónde debe cargarse una imagen.
// Las imágenes nuevas de /uploads se sirven desde el backend.
// Las URLs externas siguen funcionando normalmente.
function getImageUrl(imagen) {
  if (!imagen) return ''

  if (
    imagen.startsWith('http://') ||
    imagen.startsWith('https://') ||
    imagen.startsWith('data:') ||
    imagen.startsWith('blob:')
  ) {
    return imagen
  }

  if (imagen.startsWith('/uploads/')) {
    return `${API_URL}${imagen}`
  }

  return imagen
}

function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const [form, setForm] = useState(emptyForm)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCategorias()
      .then(r =>
        setCategorias(
          toArr(r.data).map(c => ({
            ...c,
            activo: c.activo ?? true
          }))
        )
      )
      .catch(() =>
        setError('Error al cargar categorías')
      )
      .finally(() =>
        setLoading(false)
      )
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  function limpiarFormulario() {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setForm(emptyForm)
    setEditItem(null)
    setImageFile(null)
    setImagePreview('')
    setError(null)
  }

  function abrirNuevaCategoria() {
    limpiarFormulario()
    setShowForm(true)
  }

  function cerrarFormulario() {
    limpiarFormulario()
    setShowForm(false)
  }

  function handleEdit(cat) {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setEditItem(cat)

    setForm({
      nombre: cat.nombre || '',
      descripcion: cat.descripcion || ''
    })

    setImageFile(null)

    if (cat.imagen) {
      setImagePreview(
        getImageUrl(cat.imagen)
      )
    } else {
      setImagePreview(
        getCatImage(cat.nombre) || ''
      )
    }

    setError(null)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Desactivar esta categoría?')) {
      return
    }

    try {
      await deleteCategoria(id)

      setCategorias(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, activo: false }
            : c
        )
      )
    } catch {
      alert('No se pudo desactivar')
    }
  }

  async function handleReactivar(cat) {
    try {
      const payload = new FormData()

      payload.append(
        'nombre',
        cat.nombre
      )

      payload.append(
        'descripcion',
        cat.descripcion || ''
      )

      payload.append(
        'activo',
        'true'
      )

      if (cat.imagen) {
        payload.append(
          'imagen',
          cat.imagen
        )
      }

      const { data } =
        await updateCategoria(
          cat.id,
          payload
        )

      setCategorias(prev =>
        prev.map(c =>
          c.id === cat.id
            ? {
                ...(data?.data || data),
                activo: true
              }
            : c
        )
      )
    } catch (err) {
      console.error(
        'Error al reactivar categoría:',
        err
      )

      alert('No se pudo reactivar')
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

    const maxSize =
      5 * 1024 * 1024

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
    setImagePreview(
      URL.createObjectURL(file)
    )

    setError(null)
  }

  function quitarImagen() {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(null)
    setImagePreview('')
  }

  async function handleSubmit() {
    if (!form.nombre.trim()) {
      return setError(
        'El nombre es requerido'
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
        'descripcion',
        form.descripcion.trim()
      )

      if (imageFile) {
        payload.append(
          'imagen',
          imageFile
        )
      } else if (
        editItem?.imagen &&
        imagePreview
      ) {
        // Conserva la imagen existente si
        // estamos editando y no se seleccionó otra.
        payload.append(
          'imagen',
          editItem.imagen
        )
      } else if (
        editItem?.imagen &&
        !imagePreview
      ) {
        // Si el usuario presionó "Quitar imagen".
        payload.append(
          'imagen',
          ''
        )
      }

      if (editItem) {
        payload.append(
          'activo',
          'true'
        )

        const { data } =
          await updateCategoria(
            editItem.id,
            payload
          )

        setCategorias(prev =>
          prev.map(c =>
            c.id === editItem.id
              ? {
                  ...(data?.data || data),
                  activo: true
                }
              : c
          )
        )
      } else {
        const { data } =
          await createCategoria(
            payload
          )

        setCategorias(prev => [
          ...prev,
          {
            ...(data?.data || data),
            activo: true
          }
        ])
      }

      cerrarFormulario()
    } catch (err) {
      console.error(
        'Error al guardar categoría:',
        err
      )

      const msg =
        err.response?.data?.message ||
        'Error al guardar'

      const yaExiste =
        msg
          .toLowerCase()
          .includes('exist') ||
        msg
          .toLowerCase()
          .includes('duplicad')

      setError(
        yaExiste
          ? `${msg} Si fue desactivada, búscala abajo y usa "Reactivar".`
          : msg
      )
    } finally {
      setSaving(false)
    }
  }

  const activas =
    categorias.filter(
      c => c.activo !== false
    )

  const inactivas =
    categorias.filter(
      c => c.activo === false
    )

  return (
    <div>
      {/* BARRA SUPERIOR */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--subtle)'
            }}
          >
            <strong
              style={{
                color: 'var(--fg)'
              }}
            >
              {activas.length}
            </strong>{' '}
            activas

            {inactivas.length > 0 && (
              <>
                {' • '}
                <strong
                  style={{
                    color: '#888'
                  }}
                >
                  {inactivas.length}
                </strong>{' '}
                inactivas
              </>
            )}
          </p>
        </div>

        <button
          onClick={abrirNuevaCategoria}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          + Nueva categoría
        </button>
      </div>

      {/* CATEGORÍAS ACTIVAS */}

      {loading ? (
        <div style={gridStyle}>
          {Array.from({
            length: 6
          }).map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: '12px',
                height: '200px',
                background: '#f0f0f0',
                animation:
                  'pulse 1.4s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      ) : activas.length === 0 ? (
        <p
          style={{
            color: 'var(--subtle)',
            padding: '2rem'
          }}
        >
          No hay categorías activas.
        </p>
      ) : (
        <div style={gridStyle}>
          {activas.map(cat => (
            <CatCard
              key={cat.id}
              cat={cat}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* CATEGORÍAS INACTIVAS */}

      {inactivas.length > 0 && (
        <>
          <p
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin:
                '1.5rem 0 0.75rem'
            }}
          >
            Categorías inactivas
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem'
            }}
          >
            {inactivas.map(cat => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: '#f5f5f5',
                  border:
                    '1px solid var(--border)',
                  borderRadius: '8px',
                  padding:
                    '0.5rem 0.875rem',
                  opacity: 0.75
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#888',
                    textDecoration:
                      'line-through'
                  }}
                >
                  {cat.nombre}
                </span>

                <button
                  onClick={() =>
                    handleReactivar(cat)
                  }
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#2E7D32',
                    background: '#e8f5e9',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '2px 8px',
                    cursor: 'pointer'
                  }}
                >
                  Reactivar
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL */}

      {showForm && (
        <Modal
          onClose={cerrarFormulario}
          maxWidth="500px"
        >
          <h3
            style={{
              fontFamily:
                'var(--font-display)',
              fontSize: '1.3rem',
              marginBottom: '1.5rem'
            }}
          >
            {editItem
              ? 'Editar categoría'
              : 'Nueva categoría'}
          </h3>

          {error && (
            <p
              style={{
                color: '#c62828',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                background: '#ffebee',
                padding: '0.6rem',
                borderRadius: '6px'
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* NOMBRE */}

            <div>
              <label style={labelStyle}>
                Nombre *
              </label>

              <input
                type="text"
                value={form.nombre}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    nombre:
                      e.target.value
                  }))
                }
                style={inputStyle}
              />
            </div>

            {/* DESCRIPCIÓN */}

            <div>
              <label style={labelStyle}>
                Descripción
              </label>

              <textarea
                value={form.descripcion}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    descripcion:
                      e.target.value
                  }))
                }
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* IMAGEN */}

            <div>
              <label style={labelStyle}>
                Imagen de la categoría
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
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border:
                        '1px solid var(--border)',
                      marginBottom: '1rem'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '130px',
                      display: 'flex',
                      flexDirection:
                        'column',
                      alignItems: 'center',
                      justifyContent:
                        'center',
                      color: '#9ca3af',
                      marginBottom: '1rem'
                    }}
                  >
                    <Icons.Tag size={42} />

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
                      display:
                        'inline-block',
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
                      onClick={quitarImagen}
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
                  Formatos permitidos: JPG,
                  PNG y WEBP. Máximo 5 MB.
                </p>
              </div>
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
                : editItem
                  ? 'Guardar'
                  : 'Crear'}
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
  marginBottom: '1rem'
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.35rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--muted-fg)'
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.875rem',
  border:
    '1.5px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box'
}

function CatCard({
  cat,
  onEdit,
  onDelete
}) {
  // Primero utiliza la imagen guardada en PostgreSQL.
  // Si no existe, utiliza la antigua de CAT_IMAGES.
  const img = cat.imagen
    ? getImageUrl(cat.imagen)
    : getCatImage(cat.nombre)

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border:
          '1.5px solid var(--border)',
        overflow: 'hidden',
        boxShadow:
          '0 2px 8px rgba(0,0,0,0.05)',
        transition:
          'box-shadow 0.2s, transform 0.2s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow =
          '0 6px 24px rgba(0,0,0,0.1)'

        e.currentTarget.style.transform =
          'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow =
          '0 2px 8px rgba(0,0,0,0.05)'

        e.currentTarget.style.transform =
          'none'
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '110px',
          overflow: 'hidden',
          background: '#1a1a2e'
        }}
      >
        {img ? (
          <img
            src={img}
            alt={cat.nombre}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.85
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
            <Icons.Tag size={40} />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
          }}
        />

        <span
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#fff',
            textShadow:
              '0 1px 4px rgba(0,0,0,0.5)'
          }}
        >
          {cat.nombre}
        </span>

        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '20px',
            background: '#e8f5e9',
            color: '#2E7D32'
          }}
        >
          Activa
        </span>
      </div>

      <div
        style={{
          padding: '0.75rem'
        }}
      >
        {cat.descripcion && (
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--subtle)',
              marginBottom: '0.75rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient:
                'vertical',
              overflow: 'hidden'
            }}
          >
            {cat.descripcion}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: '0.5rem'
          }}
        >
          <button
            onClick={() =>
              onEdit(cat)
            }
            style={{
              flex: 1,
              padding: '0.4rem 0',
              borderRadius: '7px',
              fontSize: '0.75rem',
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
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                gap: '0.3rem'
              }}
            >
              <Icons.Edit size={13} />
              Editar
            </span>
          </button>

          <button
            onClick={() =>
              onDelete(cat.id)
            }
            style={{
              flex: 1,
              padding: '0.4rem 0',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border:
                '1.5px solid #c62828',
              color: '#c62828',
              background:
                'transparent'
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                gap: '0.3rem'
              }}
            >
              <Icons.Trash2 size={13} />
              Desactivar
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminCategorias