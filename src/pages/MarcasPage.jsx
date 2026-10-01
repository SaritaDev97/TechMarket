import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/ui/Breadcrumb'
import { getMarcas, getProductos } from '../services/api'
import { toArr } from '../utils/parseResponse'

/* ── Configuración de marcas ─────────────────────────────── */

const BRAND_COLORS = [
  '#5B8DEF',
  '#1a1a2e',
  '#2563eb',
  '#16a34a',
  '#9333ea',
  '#0891b2',
  '#dc2626',
  '#d97706',
  '#0f766e',
  '#be185d',
  '#7c3aed',
  '#b45309',
]

/*
  Los archivos deben estar dentro de:

  public/marcas/samsung.png
  public/marcas/logitech.png
  public/marcas/hp.png
  etc.
*/
const BRAND_LOGOS = {
  samsung: '/marcas/samsung.png',
  logitech: '/marcas/logitech.png',
  hp: '/marcas/hp.png',
  redragon: '/marcas/redragon.png',
  jbl: '/marcas/jbl.png',
  sony: '/marcas/sony.png',
  xiaomi: '/marcas/xiaomi.png',
  razer: '/marcas/razer.png',
  lenovo: '/marcas/lenovo.png',
}

function getBrandLogo(marca) {
  if (!marca) return null

  const nombre = marca.trim().toLowerCase()

  return BRAND_LOGOS[nombre] || null
}

function getBrandColor(name) {
  let hash = 0

  for (let i = 0; i < name.length; i++) {
    hash =
      name.charCodeAt(i) +
      ((hash << 5) - hash)
  }

  return BRAND_COLORS[
    Math.abs(hash) % BRAND_COLORS.length
  ]
}

/* ── Skeleton ────────────────────────────────────────────── */

function BrandSkeleton() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.875rem',
      }}
    >
      <div
        style={{
          width: '100px',
          height: '70px',
          borderRadius: '12px',
          background: '#f3f4f6',
        }}
      />

      <div
        style={{
          height: '16px',
          width: '80%',
          background: '#f3f4f6',
          borderRadius: '4px',
        }}
      />

      <div
        style={{
          height: '12px',
          width: '55%',
          background: '#f3f4f6',
          borderRadius: '4px',
        }}
      />
    </div>
  )
}

/* ── Página principal ────────────────────────────────────── */

function MarcasPage() {
  const navigate = useNavigate()

  const [marcas, setMarcas] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  function cargar() {
    setLoading(true)
    setError(null)

    getMarcas()
      .then(async r => {
        const list = Array.isArray(r.data?.data)
          ? r.data.data
          : Array.isArray(r.data)
            ? r.data
            : []

        setMarcas(list)

        // Contar productos por marca
        const TOP = list.slice(0, 20)

        const results =
          await Promise.allSettled(
            TOP.map(marca =>
              getProductos({
                marca,
                limit: 1,
              }).then(res => {
                const raw = res.data

                return (
                  raw?.pagination?.total ??
                  raw?.total ??
                  toArr(
                    raw?.data || raw
                  ).length
                )
              })
            )
          )

        const map = {}

        TOP.forEach((marca, index) => {
          map[marca] =
            results[index].status === 'fulfilled'
              ? results[index].value
              : 0
        })

        setCounts(map)
      })
      .catch(() => {
        setError(
          'No se pudieron cargar las marcas. Intenta de nuevo.'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    cargar()
  }, [])

  const filtered = search
    ? marcas.filter(marca =>
        marca
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : marcas

  return (
    <main>
      <Breadcrumb current="Marcas" />

      <section className="section">
        <div className="container">

          {/* Encabezado */}
          <div
            style={{
              marginBottom: '2.5rem',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize:
                  'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 700,
                color: 'var(--fg)',
                marginBottom: '0.5rem',
              }}
            >
              Marcas disponibles
            </h1>

            <p
              style={{
                color: 'var(--subtle)',
                fontSize: '1rem',
              }}
            >
              Las mejores marcas del mercado en un
              solo lugar
            </p>

            {/* Buscador */}
            <div
              style={{
                position: 'relative',
                maxWidth: '360px',
                marginTop: '1.5rem',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--subtle)',
                  pointerEvents: 'none',
                }}
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />

                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                />
              </svg>

              <input
                type="text"
                placeholder="Buscar marca..."
                value={search}
                onChange={e =>
                  setSearch(e.target.value)
                }
                style={{
                  width: '100%',
                  padding:
                    '0.65rem 1rem 0.65rem 2.5rem',
                  border:
                    '1.5px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                  transition:
                    'border-color 0.15s',
                }}
                onFocus={e => {
                  e.target.style.borderColor =
                    'var(--accent)'
                }}
                onBlur={e => {
                  e.target.style.borderColor =
                    'var(--border)'
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '1rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.875rem',
                  color: '#dc2626',
                }}
              >
                ⚠ {error}
              </span>

              <button
                onClick={cargar}
                style={{
                  padding:
                    '0.4rem 0.875rem',
                  border:
                    '1px solid #dc2626',
                  borderRadius: '6px',
                  color: '#dc2626',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Contenido */}
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {Array.from({
                length: 12,
              }).map((_, i) => (
                <BrandSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 2rem',
              }}
            >
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  margin:
                    '0 auto 1rem',
                  display: 'block',
                }}
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />

                <line
                  x1="7"
                  y1="7"
                  x2="7.01"
                  y2="7"
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
                {search
                  ? 'Sin marcas con ese nombre'
                  : 'Sin marcas registradas'}
              </p>

              <p
                style={{
                  color: 'var(--subtle)',
                  fontSize: '0.875rem',
                }}
              >
                {search
                  ? 'Intenta con otro término'
                  : 'Las marcas aparecerán cuando se agreguen productos'}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filtered.map((marca, i) => {
                const color =
                  getBrandColor(marca)

                const initials = marca
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                const logo =
                  getBrandLogo(marca)

                const count =
                  counts[marca]

                return (
                  <BrandCard
                    key={i}
                    marca={marca}
                    color={color}
                    initials={initials}
                    logo={logo}
                    count={count}
                    onClick={() =>
                      navigate(
                        `/marca/${encodeURIComponent(
                          marca
                        )}`
                      )
                    }
                  />
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

/* ── Tarjeta de marca ────────────────────────────────────── */

function BrandCard({
  marca,
  color,
  initials,
  logo,
  count,
  onClick,
}) {
  const [hover, setHover] =
    useState(false)

  // Si un logo no existe o falla,
  // mostramos las iniciales.
  const [logoError, setLogoError] =
    useState(false)

  const mostrarLogo =
    logo && !logoError

  return (
    <div
      onClick={onClick}
      onMouseEnter={() =>
        setHover(true)
      }
      onMouseLeave={() =>
        setHover(false)
      }
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '2rem 1.5rem',
        boxShadow: hover
          ? '0 8px 28px rgba(0,0,0,0.13)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hover
          ? 'translateY(-3px)'
          : 'none',
        transition:
          'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        cursor: 'pointer',
        textAlign: 'center',
        border: hover
          ? `1.5px solid ${color}33`
          : '1.5px solid transparent',
      }}
    >

      {/* Logo */}
      <div
        style={{
          width: '120px',
          height: '75px',
          borderRadius: '12px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          padding: '10px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        {mostrarLogo ? (
          <img
            src={logo}
            alt={`Logo de ${marca}`}
            loading="lazy"
            onError={() =>
              setLogoError(true)
            }
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <span
            style={{
              fontFamily:
                'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.5rem',
              color,
              letterSpacing: '-0.5px',
            }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Nombre */}
      <h3
        style={{
          fontFamily:
            'var(--font-display)',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: 'var(--fg)',
          marginBottom: '0.35rem',
          lineHeight: 1.2,
        }}
      >
        {marca}
      </h3>

      {/* Cantidad de productos */}
      {count !== undefined ? (
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--subtle)',
            margin: '0 0 0.75rem',
          }}
        >
          {count} producto
          {count !== 1 ? 's' : ''}
        </p>
      ) : (
        <div
          style={{
            height: '14px',
            width: '60%',
            background: '#f3f4f6',
            borderRadius: '4px',
            margin:
              '0 auto 0.75rem',
          }}
        />
      )}

      {/* Ver productos */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color,
          opacity: hover ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      >
        Ver productos

        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </div>
  )
}

export default MarcasPage