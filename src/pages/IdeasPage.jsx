import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/ui/Breadcrumb'
import { IDEAS } from '../data/products'
import { SLUGS } from './GuiaDetallePage'

/* ── Colores de categorías ─────────────────────────────── */
const TAG_COLORS = {
  Computadoras: { bg: '#eff6ff', color: '#2563eb' },
  Celulares: { bg: '#fdf4ff', color: '#9333ea' },
  Audio: { bg: '#fffbeb', color: '#d97706' },
  Gaming: { bg: '#fff7ed', color: '#ea580c' },
  Accesorios: { bg: '#f0fdf4', color: '#16a34a' },
}

function getTagCfg(tag) {
  return TAG_COLORS[tag] || {
    bg: '#f3f4f6',
    color: '#6b7280'
  }
}

/* ── Tipo de guía según tiempo ─────────────────────────── */
const TIME_DIFFICULTY = {
  '4 min': {
    label: 'Consejo rápido',
    color: '#16a34a',
    bg: '#ecfdf5'
  },

  '5 min': {
    label: 'Guía básica',
    color: '#2563eb',
    bg: '#dbeafe'
  },

  '6 min': {
    label: 'Comparativa',
    color: '#9333ea',
    bg: '#fdf4ff'
  },

  '7 min': {
    label: 'Recomendaciones',
    color: '#d97706',
    bg: '#fffbeb'
  },
}

/* ── Tarjeta de guía ───────────────────────────────────── */
function IdeaCard({ idea }) {
  const navigate = useNavigate()

  const [hover, setHover] = useState(false)

  const tagCfg = getTagCfg(idea.tag)

  const diffCfg =
    TIME_DIFFICULTY[idea.tiempo] || {
      label: 'Básico',
      color: '#6b7280',
      bg: '#f3f4f6'
    }

  function abrirGuia() {
    const slug = SLUGS[idea.title]

    if (!slug) {
      console.error(
        `No existe una ruta configurada para la guía: ${idea.title}`
      )
      return
    }

    navigate(`/ideas/${slug}`)
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',

        boxShadow: hover
          ? '0 10px 32px rgba(0,0,0,0.13)'
          : '0 2px 8px rgba(0,0,0,0.06)',

        transform: hover
          ? 'translateY(-3px)'
          : 'none',

        transition:
          'box-shadow 0.25s, transform 0.25s',

        display: 'flex',
        flexDirection: 'column'
      }}
    >

      {/* Imagen */}
      <div
        style={{
          height: '200px',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0
        }}
      >

        <img
          src={idea.img}
          alt={idea.title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',

            transform: hover
              ? 'scale(1.05)'
              : 'scale(1)',

            transition: 'transform 0.4s ease'
          }}
        />

        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,

            background:
              'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)'
          }}
        />

        {/* Categoría */}
        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',

            padding: '0.3rem 0.7rem',
            borderRadius: '20px',

            fontSize: '0.7rem',
            fontWeight: 700,

            background: tagCfg.bg,
            color: tagCfg.color,

            backdropFilter: 'blur(4px)'
          }}
        >
          {idea.tag}
        </span>

      </div>

      {/* Contenido */}
      <div
        style={{
          padding: '1.25rem',
          flex: 1,

          display: 'flex',
          flexDirection: 'column'
        }}
      >

        {/* Título */}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,

            fontSize: '1.15rem',
            color: '#111827',
            lineHeight: 1.2,

            marginBottom: '0.5rem'
          }}
        >
          {idea.title}
        </h3>

        {/* Descripción */}
        <p
          style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            lineHeight: 1.6,

            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',

            marginBottom: '1rem',
            flex: 1
          }}
        >
          {idea.desc}
        </p>

        {/* Información */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',

            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}
        >

          {/* Tiempo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',

              fontSize: '0.75rem',
              color: '#9ca3af'
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />

              <polyline
                points="12 6 12 12 16 14"
              />
            </svg>

            {idea.tiempo}
          </div>

          {/* Tipo de guía */}
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',

              fontSize: '0.7rem',
              fontWeight: 700,

              background: diffCfg.bg,
              color: diffCfg.color
            }}
          >
            {diffCfg.label}
          </span>

        </div>

        {/* Botón */}
        <button
          onClick={abrirGuia}
          style={{
            width: '100%',
            padding: '0.7rem',

            background: hover
              ? 'var(--accent)'
              : 'transparent',

            color: hover
              ? '#fff'
              : 'var(--accent)',

            border: '1.5px solid var(--accent)',
            borderRadius: '8px',

            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.875rem',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',

            transition:
              'background 0.2s, color 0.2s'
          }}
        >

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>

          Ver guía completa

        </button>

      </div>

    </div>
  )
}

/* ── Página principal ───────────────────────────────────── */
function IdeasPage() {
  const [filter, setFilter] = useState('')

  const tags = [
    ...new Set(
      IDEAS.map(idea => idea.tag)
    )
  ]

  const filtered = filter
    ? IDEAS.filter(
        idea => idea.tag === filter
      )
    : IDEAS

  return (
    <main>

      <Breadcrumb current="Ideas y soluciones" />

      {/* Hero */}
      <section
        style={{
          background:
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',

          padding: '4rem 1rem'
        }}
      >

        <div
          className="container"
          style={{
            textAlign: 'center'
          }}
        >

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',

              background:
                'rgba(255,107,53,0.2)',

              border:
                '1px solid rgba(255,107,53,0.4)',

              borderRadius: '20px',

              padding:
                '0.3rem 0.875rem',

              marginBottom: '1rem'
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

              <line
                x1="12"
                y1="2"
                x2="12"
                y2="4"
              />

              <line
                x1="4.93"
                y1="4.93"
                x2="6.34"
                y2="6.34"
              />

              <line
                x1="2"
                y1="12"
                x2="4"
                y2="12"
              />

              <line
                x1="4.93"
                y1="19.07"
                x2="6.34"
                y2="17.66"
              />

              <line
                x1="12"
                y1="22"
                x2="12"
                y2="20"
              />

              <line
                x1="19.07"
                y1="19.07"
                x2="17.66"
                y2="17.66"
              />

              <line
                x1="22"
                y1="12"
                x2="20"
                y2="12"
              />

              <line
                x1="19.07"
                y1="4.93"
                x2="17.66"
                y2="6.34"
              />

              <circle
                cx="12"
                cy="12"
                r="4"
                fill="var(--accent)"
                stroke="var(--accent)"
              />

            </svg>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,

                color: 'var(--accent)',

                letterSpacing: '0.08em'
              }}
            >
              GUÍAS Y TUTORIALES
            </span>

          </div>

          <h1
            style={{
              fontFamily:
                'var(--font-display)',

              fontSize:
                'clamp(2.5rem, 6vw, 4rem)',

              fontWeight: 700,

              color: '#fff',
              lineHeight: 1.1,

              marginBottom: '0.75rem'
            }}
          >
            Ideas y soluciones
          </h1>

          <p
            style={{
              color:
                'rgba(255,255,255,0.65)',

              fontSize: '1.05rem',

              maxWidth: '620px',

              margin: '0 auto'
            }}
          >
            Guías, consejos y recomendaciones
            para ayudarte a elegir, cuidar y
            aprovechar mejor tus productos
            tecnológicos.
          </p>

        </div>

      </section>

      {/* Contenido */}
      <section className="section section--gray">

        <div className="container">

          {/* Filtros */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}
          >

            <button
              onClick={() => setFilter('')}
              style={{
                padding:
                  '0.5rem 1rem',

                borderRadius: '20px',

                border: '1.5px solid',

                borderColor: !filter
                  ? 'var(--accent)'
                  : 'var(--border)',

                background: !filter
                  ? 'var(--accent)'
                  : '#fff',

                color: !filter
                  ? '#fff'
                  : 'var(--subtle)',

                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.82rem',

                transition: 'all 0.15s'
              }}
            >
              Todos
            </button>

            {tags.map(tag => {
              const cfg = getTagCfg(tag)

              const active =
                filter === tag

              return (
                <button
                  key={tag}

                  onClick={() =>
                    setFilter(
                      tag === filter
                        ? ''
                        : tag
                    )
                  }

                  style={{
                    padding:
                      '0.5rem 1rem',

                    borderRadius:
                      '20px',

                    border:
                      '1.5px solid',

                    borderColor: active
                      ? cfg.color
                      : 'var(--border)',

                    background: active
                      ? cfg.bg
                      : '#fff',

                    color: active
                      ? cfg.color
                      : 'var(--subtle)',

                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.82rem',

                    transition:
                      'all 0.15s'
                  }}
                >
                  {tag}
                </button>
              )
            })}

          </div>

          {/* Grid de guías */}
          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(auto-fill, minmax(300px, 1fr))',

              gap: '1.5rem'
            }}
          >

            {filtered.map(
              (idea, index) => (
                <IdeaCard
                  key={index}
                  idea={idea}
                />
              )
            )}

          </div>

          {/* Sin resultados */}
          {filtered.length === 0 && (
            <div
              style={{
                textAlign: 'center',

                padding:
                  '4rem 2rem',

                color:
                  'var(--subtle)'
              }}
            >
              <p
                style={{
                  fontWeight: 600
                }}
              >
                Sin guías en esta categoría
              </p>
            </div>
          )}

        </div>

      </section>

    </main>
  )
}

export default IdeasPage