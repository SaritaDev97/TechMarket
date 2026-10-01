import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getProductos,
  getCategorias,
  getTipoCambio
} from '../../services/api'

import { toArr, toTotal } from '../../utils/parseResponse'
import { useCart } from '../../context/CartContext'
import { useCompare } from '../../context/CompareContext'

import Pagination from '../admin/shared/Pagination'
import * as Icons from '../admin/shared/Icons'

const limit = 12

// ─────────────────────────────────────────────────────────────
// COMPONENTES COMPARTIDOS
// ─────────────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Input({ icon: Icon, ...props }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {Icon && (
        <span
          style={{
            position: 'absolute',
            left: '0.75rem',
            color: '#9ca3af',
            display: 'flex',
            pointerEvents: 'none',
          }}
        >
          <Icon size={15} />
        </span>
      )}

      <input
        {...props}
        style={{
          padding: `0.6rem ${
            Icon ? '1rem 0.6rem 2.25rem' : '0.875rem'
          }`,
          border: '1.5px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '0.875rem',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          width: '100%',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...props.style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow =
            '0 0 0 3px rgba(255,107,53,0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

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
          height: '160px',
          background:
            'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />

      <div
        style={{
          padding: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            height: '10px',
            width: '60%',
            background: '#f0f0f0',
            borderRadius: '4px',
          }}
        />

        <div
          style={{
            height: '14px',
            width: '85%',
            background: '#f0f0f0',
            borderRadius: '4px',
          }}
        />

        <div
          style={{
            height: '10px',
            width: '40%',
            background: '#f0f0f0',
            borderRadius: '4px',
          }}
        />

        <div
          style={{
            height: '32px',
            background: '#f0f0f0',
            borderRadius: '8px',
            marginTop: '0.5rem',
          }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function ClienteTienda() {

  const {
    addToCart,
    cartLoading,
    toggleWishlist,
    isInWishlist,
  } = useCart()

  const {
    toggleCompare,
    isInCompare,
    compareTotal,
    maxCompare,
  } = useCompare()

  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categorias, setCategorias] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(null)
  const [moneda, setMoneda] = useState('USD')
const [tasaCambio, setTasaCambio] = useState(1)
const [cargandoMoneda, setCargandoMoneda] = useState(false)
const [errorMoneda, setErrorMoneda] = useState('')

  // ───────────────────────────────────────────────────────────
  // CARGAR CATEGORÍAS
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    getCategorias()
      .then((r) => setCategorias(toArr(r.data)))
      .catch(() => {})
  }, [])


  async function handleMonedaChange(e) {
  const nuevaMoneda = e.target.value

  setMoneda(nuevaMoneda)
  setErrorMoneda('')

  // USD es la moneda original del sistema
  if (nuevaMoneda === 'USD') {
    setTasaCambio(1)
    return
  }

  try {
    setCargandoMoneda(true)

    const response = await getTipoCambio(nuevaMoneda)

    const tasa = Number(response.data?.data?.tasa)

    if (!tasa || Number.isNaN(tasa)) {
      throw new Error('Tasa de cambio inválida')
    }

    setTasaCambio(tasa)
  } catch (error) {
    console.error('Error al consultar tipo de cambio:', error)

    // Si la API falla, regresamos de forma segura a USD.
    setMoneda('USD')
    setTasaCambio(1)
    setErrorMoneda(
      'No se pudo consultar el tipo de cambio. Se mantienen los precios en USD.'
    )
  } finally {
    setCargandoMoneda(false)
  }
}



  // ───────────────────────────────────────────────────────────
  // CARGAR PRODUCTOS
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = {
      page,
      limit,
    }

    if (search) {
      params.buscar = search
    }

    if (catFilter) {
      params.categoria_id = catFilter
    }

    getProductos(params)
      .then((r) => {
        setProducts(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => {
        setError(
          'No se pudieron cargar los productos. Intenta de nuevo.'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page, search, catFilter])

  // ───────────────────────────────────────────────────────────
  // AGREGAR AL CARRITO
  // ───────────────────────────────────────────────────────────

  async function handleAdd(product) {
    setAdding(product.id)

    await addToCart(product)

    setAdding(null)
  }

  // ───────────────────────────────────────────────────────────
  // ABRIR DETALLE DEL PRODUCTO
  // ───────────────────────────────────────────────────────────

  function handleView(product) {
    navigate(`/cliente/producto/${product.id}`)
  }

  // ───────────────────────────────────────────────────────────
  // AGREGAR / QUITAR FAVORITO
  // ───────────────────────────────────────────────────────────

  async function handleFavorite(product) {
    await toggleWishlist(product)
  }

  // ───────────────────────────────────────────────────────────
  // AGREGAR / QUITAR DE COMPARACIÓN
  // ───────────────────────────────────────────────────────────

  function handleCompare(product) {
    toggleCompare(product)
  }

  const totalPages = Math.max(
    1,
    Math.ceil(total / limit)
  )

  return (
    <div>
      {/* ───────────────── FILTROS ───────────────── */}

      <Card
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 220px' }}>
            <Input
              icon={Icons.Search}
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value)
                setPage(1)
              }}
              style={{
                width: '100%',
                padding: '0.6rem 0.875rem',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                background: '#fff',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
              }}
            >
              <option value="">
                Todas las categorías
              </option>

              {categorias.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {(search || catFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setCatFilter('')
                setPage(1)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 0.875rem',
                background: 'transparent',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: '#6b7280',
              }}
            >
              <Icons.X size={13} />
              Limpiar
            </button>
          )}

          {!loading && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.8rem',
                color: '#9ca3af',
                whiteSpace: 'nowrap',
              }}
            >
              {total} producto
              {total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Card>

      {/* ───────────────── SELECTOR DE MONEDA / API EXTERNA ───────────────── */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <label
          htmlFor="selector-moneda"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
          }}
        >
          Moneda:
        </label>

        <select
          id="selector-moneda"
          value={moneda}
          onChange={handleMonedaChange}
          disabled={cargandoMoneda}
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#374151',
            cursor: cargandoMoneda ? 'wait' : 'pointer',
          }}
        >
          <option value="USD">USD - Dólar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="MXN">MXN - Peso mexicano</option>
          <option value="GTQ">GTQ - Quetzal</option>
        </select>

        {cargandoMoneda && (
          <span
            style={{
              fontSize: '0.8rem',
              color: '#6b7280',
            }}
          >
            Consultando API...
          </span>
        )}
      </div>

      {errorMoneda && (
        <div
          style={{
            background: '#fff7ed',
            color: '#c2410c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}
        >
          {errorMoneda}
        </div>
      )}




      {/* ───────────────── COMPARADOR ACTIVO ───────────────── */}

      {compareTotal > 0 && (
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '10px',
            padding: '0.8rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              
            </span>

            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#111827',
                }}
              >
                {compareTotal} producto
                {compareTotal !== 1 ? 's' : ''} seleccionado
                {compareTotal !== 1 ? 's' : ''}
              </p>

              <p
                style={{
                  margin: '0.15rem 0 0',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                }}
              >
                Puedes seleccionar hasta {maxCompare} productos para comparar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────── ERROR ───────────────── */}

      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#dc2626',
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Icons.AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* ───────────────── PRODUCTOS ───────────────── */}

      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {Array.from({ length: 8 }).map(
            (_, i) => (
              <ProductSkeleton key={i} />
            )
          )}
        </div>
      ) : products.length === 0 ? (
        <Card
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <Icons.Package
            size={48}
            color="#d1d5db"
            style={{
              margin: '0 auto 1rem',
            }}
          />

          <p
            style={{
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.25rem',
            }}
          >
            No se encontraron productos
          </p>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
            }}
          >
            Prueba con otros filtros o términos de búsqueda
          </p>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              adding={adding}
              cartLoading={cartLoading}
              onAdd={handleAdd}
              onView={handleView}
              onFavorite={handleFavorite}
              favorite={isInWishlist(p.id)}
              onCompare={handleCompare}
              comparing={isInCompare(p.id)}
              compareTotal={compareTotal}
              maxCompare={maxCompare}
              moneda={moneda}
              tasaCambio={tasaCambio}
            />
          ))}
        </div>
      )}

      {/* ───────────────── PAGINACIÓN ───────────────── */}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => {
          setPage(p)
          window.scrollTo(0, 0)
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TARJETA INDIVIDUAL DE PRODUCTO
// ─────────────────────────────────────────────────────────────

function ProductCard({
  p,
  adding,
  cartLoading,
  onAdd,
  onView,
  onFavorite,
  favorite,
  onCompare,
  comparing,
  compareTotal,
  maxCompare,
   moneda,
  tasaCambio,
}) {
  const sinStock = Number(p.stock) <= 0

  const compareDisabled =
    !comparing && compareTotal >= maxCompare

    const simbolosMoneda = {
  USD: '$',
  EUR: '€',
  MXN: 'MX$',
  GTQ: 'Q',
}

const simboloMoneda = simbolosMoneda[moneda] || moneda

const convertirPrecio = (precio) =>
  (Number(precio || 0) * tasaCambio).toFixed(2)

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: comparing
          ? '0 0 0 2px var(--accent), 0 4px 14px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition:
          'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!comparing) {
          e.currentTarget.style.boxShadow =
            '0 8px 24px rgba(0,0,0,0.12)'
        }

        e.currentTarget.style.transform =
          'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = comparing
          ? '0 0 0 2px var(--accent), 0 4px 14px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06)'

        e.currentTarget.style.transform =
          'translateY(0)'
      }}
    >
      {/* ───────────────── IMAGEN ───────────────── */}

      <div
        style={{
          height: '160px',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {p.imagen ? (
          <img
            src={p.imagen}
            alt={p.nombre}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Icons.Package
            size={40}
            color="#d1d5db"
          />
        )}

        {/* ───────────────── BOTÓN FAVORITO ───────────────── */}

        <button
          type="button"
          title={
            favorite
              ? 'Quitar de favoritos'
              : 'Agregar a favoritos'
          }
          aria-label={
            favorite
              ? 'Quitar de favoritos'
              : 'Agregar a favoritos'
          }
          onClick={(e) => {
            e.stopPropagation()
            onFavorite(p)
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: favorite
              ? '1px solid #ff6b35'
              : '1px solid #e5e7eb',
            background: '#fff',
            color: favorite
              ? '#ff6b35'
              : '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 3,
            transition:
              'transform 0.15s, color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              'scale(1.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              'scale(1)'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill={favorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* ───────────────── BADGE ───────────────── */}

        {p.badge && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            {p.badge}
          </span>
        )}

        {/* ───────────────── SIN STOCK ───────────────── */}

        {sinStock && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <span
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
              }}
            >
              Sin stock
            </span>
          </div>
        )}

        {/* ───────────────── SELECCIONADO PARA COMPARAR ───────────────── */}

        {comparing && (
          <div
            style={{
              position: 'absolute',
              left: '8px',
              bottom: '8px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: '6px',
              padding: '0.3rem 0.55rem',
              fontSize: '0.65rem',
              fontWeight: 700,
              zIndex: 3,
              boxShadow:
                '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            ✓ Comparando
          </div>
        )}
      </div>

      {/* ───────────────── INFORMACIÓN ───────────────── */}

      <div
        style={{
          padding: '0.875rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
        }}
      >
        {p.categorias?.nombre && (
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--accent)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {p.categorias.nombre}
          </span>
        )}

        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 1.35,
            margin: 0,
            color: '#111827',
          }}
        >
          {p.nombre}
        </p>

        {p.marca && (
          <p
            style={{
              fontSize: '0.73rem',
              color: '#9ca3af',
              margin: 0,
            }}
          >
            {p.marca}
          </p>
        )}

        {/* ───────────────── PRECIO ───────────────── */}

<div
  style={{
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginTop: 'auto',
    paddingTop: '0.5rem',
  }}
>
  <span
    style={{
      fontSize: '1.05rem',
      fontWeight: 700,
      color: 'var(--accent)',
    }}
  >
    {simboloMoneda}
    {convertirPrecio(p.precio_venta)}
  </span>

  {p.precio_anterior && (
    <span
      style={{
        fontSize: '0.73rem',
        color: '#d1d5db',
        textDecoration: 'line-through',
      }}
    >
      {simboloMoneda}
      {convertirPrecio(p.precio_anterior)}
    </span>
  )}
</div>

        {/* ───────────────── VER DETALLE ───────────────── */}

        <button
          type="button"
          onClick={() => onView(p)}
          style={{
            marginTop: '0.5rem',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border:
              '1.5px solid var(--accent)',
            background: '#fff',
            color: 'var(--accent)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            transition:
              'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'var(--accent)'

            e.currentTarget.style.color =
              '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              '#fff'

            e.currentTarget.style.color =
              'var(--accent)'
          }}
        >
          <Icons.Search size={13} />
          Ver detalle
        </button>

                {/* ───────────────── COMPARAR ───────────────── */}

        <button
          type="button"
          onClick={() => {
            if (!compareDisabled) {
              onCompare(p)
            }
          }}
          disabled={compareDisabled}
          title={
            comparing
              ? 'Quitar de comparación'
              : compareDisabled
                ? `Solo puedes comparar ${maxCompare} productos`
                : 'Agregar a comparación'
          }
          style={{
            marginTop: '0.35rem',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',

            border: comparing
              ? '1.5px solid var(--accent)'
              : '1.5px solid #d1d5db',

            background: comparing
              ? 'var(--accent)'
              : '#fff',

            color: comparing
              ? '#fff'
              : '#4b5563',

            fontWeight: 600,
            fontSize: '0.8rem',

            cursor: compareDisabled
              ? 'not-allowed'
              : 'pointer',

            opacity: compareDisabled
              ? 0.5
              : 1,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            transition:
              'background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s',
          }}
        >
          {comparing
            ? 'Seleccionado para comparar'
            : 'Comparar'}
        </button>

        {/* ───────────────── AGREGAR AL CARRITO ───────────────── */}

        <button
          type="button"
          onClick={() => {
            if (!sinStock) {
              onAdd(p)
            }
          }}
          disabled={
            sinStock ||
            adding === p.id ||
            cartLoading
          }
          style={{
            marginTop: '0.35rem',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: 'none',
            background: sinStock
              ? '#f3f4f6'
              : 'var(--accent)',
            color: sinStock
              ? '#9ca3af'
              : '#fff',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: sinStock
              ? 'not-allowed'
              : 'pointer',
            transition:
              'opacity 0.15s, background 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
          }}
          onMouseEnter={(e) => {
            if (!sinStock) {
              e.currentTarget.style.opacity =
                '0.85'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          {adding === p.id ? (
            'Agregando...'
          ) : sinStock ? (
            'Sin stock'
          ) : (
            <>
              <Icons.Plus size={13} />
              Agregar al carrito
            </>
          )}
        </button>

        {/* ───────────────── ESTADO FAVORITO ───────────────── */}

        {favorite && (
          <div
            style={{
              marginTop: '0.35rem',
              fontSize: '0.72rem',
              color: '#ff6b35',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            ♥ Guardado en favoritos
          </div>
        )}

        {/* ───────────────── ESTADO COMPARACIÓN ───────────────── */}

        {comparing && (
          <div
            style={{
              marginTop: '0.15rem',
              fontSize: '0.72rem',
              color: 'var(--accent)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            ✓ Producto seleccionado para comparar
          </div>
        )}
      </div>
    </div>
  )
}