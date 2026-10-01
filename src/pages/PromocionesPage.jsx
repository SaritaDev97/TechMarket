
import { useState, useEffect } from 'react'
import Breadcrumb from '../components/ui/Breadcrumb'
import ProductCard from '../components/ui/ProductCard'
import { getProductos } from '../services/api'
import { toArr } from '../utils/parseResponse'

/* ── Skeleton de productos ─────────────────────────────── */
function ProductSkeleton() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          height: '180px',
          background: '#f3f4f6',
        }}
      />

      <div style={{ padding: '1rem' }}>
        <div
          style={{
            height: '12px',
            width: '45%',
            background: '#f3f4f6',
            borderRadius: '4px',
            marginBottom: '0.4rem',
          }}
        />

        <div
          style={{
            height: '14px',
            width: '80%',
            background: '#f3f4f6',
            borderRadius: '4px',
            marginBottom: '0.75rem',
          }}
        />

        <div
          style={{
            height: '18px',
            width: '40%',
            background: '#f3f4f6',
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  )
}

/* ── Página principal ──────────────────────────────────── */
function PromocionesPage() {
  const [productos, setProductos] = useState([])
  const [loadingP, setLoadingP] = useState(true)
  const [tab, setTab] = useState('descuentos')

  /* ── Cargar productos ───────────────────────────────── */
  useEffect(() => {
    setLoadingP(true)

    getProductos({ limit: 100 })
      .then(r => {
        setProductos(toArr(r.data?.data || r.data))
      })
      .catch(error => {
        console.error('Error al cargar productos:', error)
        setProductos([])
      })
      .finally(() => {
        setLoadingP(false)
      })
  }, [])

  /* ── Detectar productos que están en oferta ─────────── */
  const productosEnOferta = productos.filter(producto => {
    const precioActual = Number(producto.precio_venta || 0)
    const precioAnterior = Number(producto.precio_anterior || 0)

    return precioAnterior > precioActual && precioActual > 0
  })

  return (
    <main>
      <Breadcrumb current="Promociones" />

      {/* ── Banner principal ────────────────────────────── */}
      <section
        style={{
          background:
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '4rem 1rem',
          marginBottom: 0,
        }}
      >
        <div
          className="container"
          style={{
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,107,53,0.2)',
              border: '1px solid rgba(255,107,53,0.4)',
              borderRadius: '20px',
              padding: '0.3rem 0.875rem',
              marginBottom: '1rem',
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent)',
                letterSpacing: '0.08em',
              }}
            >
              PROMOCIONES TECHMARKET
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '0.75rem',
            }}
          >
            Ofertas y descuentos
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '1.05rem',
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            Encuentra promociones especiales en computadoras, celulares,
            accesorios y tecnología. Aprovecha nuestros descuentos y encuentra
            el producto ideal para ti.
          </p>
        </div>
      </section>

      {/* ── Contenido ──────────────────────────────────── */}
      <section className="section section--gray">
        <div className="container">

          {/* ── Pestañas ───────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '2rem',
              background: '#fff',
              padding: '0.35rem',
              borderRadius: '10px',
              width: 'fit-content',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {[
              {
                id: 'descuentos',
                label: 'Ofertas y descuentos',
              },
              {
                id: 'productos',
                label: 'Explorar productos',
              },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  background:
                    tab === t.id
                      ? 'var(--accent)'
                      : 'transparent',
                  color:
                    tab === t.id
                      ? '#fff'
                      : 'var(--subtle)',
                  transition:
                    'background 0.2s, color 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ─────────────────────────────────────────────
              TAB: OFERTAS Y DESCUENTOS
          ───────────────────────────────────────────── */}
          {tab === 'descuentos' && (
            <>
              {loadingP ? (
                <div className="products-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : productosEnOferta.length === 0 ? (
                /* ── Sin ofertas ─────────────────────── */
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '5rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    style={{
                      margin: '0 auto 1.25rem',
                      display: 'block',
                    }}
                  >
                    <line
                      x1="19"
                      y1="5"
                      x2="5"
                      y2="19"
                    />

                    <circle
                      cx="6.5"
                      cy="6.5"
                      r="2.5"
                    />

                    <circle
                      cx="17.5"
                      cy="17.5"
                      r="2.5"
                    />
                  </svg>

                  <p
                    style={{
                      fontWeight: 700,
                      color: '#374151',
                      fontSize: '1rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Sin productos en oferta actualmente
                  </p>

                  <p
                    style={{
                      color: 'var(--subtle)',
                      fontSize: '0.875rem',
                    }}
                  >
                    Próximamente tendremos nuevas promociones.
                  </p>
                </div>
              ) : (
                /* ── Productos en oferta ─────────────── */
                <>
                  <div
                    style={{
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.5rem',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Productos en oferta
                    </h2>

                    <p
                      style={{
                        color: 'var(--subtle)',
                        fontSize: '0.9rem',
                      }}
                    >
                      Aprovecha nuestros precios especiales por tiempo
                      limitado.
                    </p>
                  </div>

                  <div className="products-grid">
                    {productosEnOferta.map(producto => (
                      <ProductCard
                        key={producto.id}
                        product={producto}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ─────────────────────────────────────────────
              TAB: EXPLORAR PRODUCTOS
          ───────────────────────────────────────────── */}
          {tab === 'productos' && (
            <>
              {loadingP ? (
                <div className="products-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : productos.length === 0 ? (
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <p
                    style={{
                      fontWeight: 700,
                      color: '#374151',
                    }}
                  >
                    No hay productos disponibles
                  </p>
                </div>
              ) : (
                <div className="products-grid">
                  {productos.map(producto => (
                    <ProductCard
                      key={producto.id}
                      product={producto}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </section>
    </main>
  )
}

export default PromocionesPage
