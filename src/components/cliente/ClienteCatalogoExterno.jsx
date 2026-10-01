import { useEffect, useState } from 'react'
import { getProductosExternos } from '../../services/api'

function ClienteCatalogoExterno() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    try {
      setLoading(true)
      setError('')

      const response = await getProductosExternos()

      const data = response.data?.data || []

      setProductos(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (err) {
      console.error(
        'Error al cargar catálogo externo:',
        err
      )

      setError(
        'No se pudo cargar el catálogo externo. Intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h2
          style={{
            marginBottom: '0.5rem'
          }}
        >
          Catálogo externo
        </h2>

        <p
          style={{
            color: '#6b7280'
          }}
        >
          Consultando productos tecnológicos externos...
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginTop: '2rem'
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              style={{
                height: '390px',
                background: '#fff',
                borderRadius: '14px',
                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.06)'
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <h2>Catálogo externo</h2>

        <p
          style={{
            color: '#dc2626',
            margin: '1rem 0'
          }}
        >
          {error}
        </p>

        <button
          type="button"
          onClick={cargarProductos}
          style={{
            padding: '0.7rem 1.2rem',
            border: 'none',
            borderRadius: '8px',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* ENCABEZADO */}
      <div
        style={{
          marginBottom: '2rem'
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            marginBottom: '0.5rem'
          }}
        >
          Catálogo tecnológico externo
        </h2>

        <p
          style={{
            color: '#6b7280',
            lineHeight: 1.6,
            maxWidth: '800px'
          }}
        >
          Explora productos tecnológicos relevantes
          . Estos productos son únicamente
          informativos y no forman parte del inventario de
          TechMarket.
        </p>
      </div>

      {/* AVISO */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}
      >


        <div>
          <strong
            style={{
              color: '#1e40af'
            }}
          >
            Productos informativos
          </strong>

          <p
            style={{
              margin: '0.25rem 0 0',
              color: '#475569',
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}
          >
            Este catálogo es únicamente para visualización.
            Los productos mostrados aquí no pueden agregarse
            al carrito ni comprarse desde TechMarket.
          </p>
        </div>
      </div>

      {/* TOTAL */}
      <p
        style={{
          color: '#6b7280',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}
      >
        {productos.length}{' '}
        {productos.length === 1
          ? 'producto externo disponible'
          : 'productos externos disponibles'}
      </p>

      {/* PRODUCTOS */}
      {productos.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: '4rem 2rem',
            borderRadius: '14px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}
          >
            
          </div>

          <h3>
            No hay productos externos disponibles
          </h3>

          <p
            style={{
              color: '#6b7280',
              marginTop: '0.5rem'
            }}
          >
            Intenta nuevamente más tarde.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {productos.map((producto) => (
            <div
              key={`externo-${producto.id}`}
              style={{
                background: '#fff',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.07)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* IMAGEN */}
              <div
                style={{
                  height: '210px',
                  background: '#f8fafc',
                  position: 'relative',
                  padding: '1rem'
                }}
              >
                {producto.imagen ? (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem'
                    }}
                  >
                    📦
                  </div>
                )}

                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '20px',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}
                >
                   EXTERNO
                </span>
              </div>

              {/* INFORMACIÓN */}
              <div
                style={{
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}
              >
                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem'
                  }}
                >
                  {producto.marca || 'Sin marca'}
                </p>

                <h3
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.35,
                    color: '#111827',
                    marginBottom: '0.65rem'
                  }}
                >
                  {producto.nombre}
                </h3>

                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    flex: 1
                  }}
                >
                  {producto.descripcion ||
                    'Producto tecnológico disponible para consulta.'}
                </p>

                <div
                  style={{
                    marginBottom: '1rem'
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: '#9ca3af',
                      fontSize: '0.7rem',
                      marginBottom: '0.15rem'
                    }}
                  >
                    Precio de referencia
                  </span>

                  <strong
                    style={{
                      fontSize: '1.25rem',
                      color: '#111827'
                    }}
                  >
                    $
                    {Number(
                      producto.precio || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setProductoSeleccionado(producto)
                  }
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border:
                      '1.5px solid var(--accent)',
                    background: 'transparent',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Ver información
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE INFORMACIÓN */}
      {productoSeleccionado && (
        <div
          onClick={() =>
            setProductoSeleccionado(null)
          }
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: '100%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '16px',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() =>
                setProductoSeleccionado(null)
              }
              aria-label="Cerrar"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                background:
                  'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                zIndex: 2
              }}
            >
              ×
            </button>

            <div
              style={{
                height: '300px',
                background: '#f8fafc',
                padding: '1.5rem'
              }}
            >
              <img
                src={productoSeleccionado.imagen}
                alt={productoSeleccionado.nombre}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            <div
              style={{
                padding: '1.5rem'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem'
                }}
              >
                 PRODUCTO EXTERNO
              </span>

              <h2
                style={{
                  marginBottom: '0.4rem'
                }}
              >
                {productoSeleccionado.nombre}
              </h2>

              <p
                style={{
                  color: '#6b7280',
                  marginBottom: '1rem'
                }}
              >
                {productoSeleccionado.marca ||
                  'Sin marca'}
              </p>

              <p
                style={{
                  lineHeight: 1.7,
                  color: '#4b5563',
                  marginBottom: '1.25rem'
                }}
              >
                {productoSeleccionado.descripcion}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '2rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.25rem'
                }}
              >
                <div>
                  <small
                    style={{
                      color: '#9ca3af'
                    }}
                  >
                    Precio de referencia
                  </small>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '1.3rem'
                    }}
                  >
                    $
                    {Number(
                      productoSeleccionado.precio || 0
                    ).toFixed(2)}
                  </div>
                </div>

                {productoSeleccionado.rating && (
                  <div>
                    <small
                      style={{
                        color: '#9ca3af'
                      }}
                    >
                      Valoración externa
                    </small>

                    <div
                      style={{
                        fontWeight: 700
                      }}
                    >
                      ⭐ {productoSeleccionado.rating}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  lineHeight: 1.5
                }}
              >
                Este producto es externo y
                se muestra exclusivamente con fines
                informativos. No puede comprarse ni
                agregarse al carrito de TechMarket.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClienteCatalogoExterno