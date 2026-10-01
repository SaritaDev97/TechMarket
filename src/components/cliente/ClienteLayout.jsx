import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useCompare } from '../../context/CompareContext'
import { useNavigate } from 'react-router-dom'
import * as Icons from '../admin/shared/Icons'

const NAV = [
  {
    key: 'tienda',
    label: 'Tienda',
    Icon: Icons.Package,
  },
  {
    key: 'carrito',
    label: 'Mi carrito',
    Icon: Icons.ShoppingCart,
  },
  {
    key: 'pedidos',
    label: 'Mis pedidos',
    Icon: Icons.ClipboardList,
  },
  {
    key: 'comparar',
    label: 'Comparar',
    Icon: Icons.Search,
  },

  {
    key: 'catalogoExterno',
    label: 'Catálogo externo',
    Icon: Icons.Package,
  },
  {
    key: 'perfil',
    label: 'Mi perfil',
    Icon: Icons.User,
  },
]

export default function ClienteLayout({
  section,
  onSection,
  children,
}) {
  const { user, logout } = useAuth()

  const {
    cartTotal,
  } = useCart()

  const {
    compareTotal,
  } = useCompare()

  const navigate = useNavigate()

  const [collapsed, setCollapsed] =
    useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  const activeItem =
    NAV.find((n) => n.key === section)

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f0f2f5',
        fontFamily:
          'var(--font-body, sans-serif)',
      }}
    >
      {/* SIDEBAR */}

      <aside
        style={{
          width: collapsed
            ? '64px'
            : '240px',

          background: '#1a1a2e',
          color: '#fff',

          display: 'flex',
          flexDirection: 'column',

          transition: 'width 0.25s ease',

          flexShrink: 0,

          position: 'sticky',
          top: 0,

          height: '100vh',

          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* LOGO */}

        <div
          style={{
            padding: '1.25rem',

            borderBottom:
              '1px solid rgba(255,255,255,0.08)',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            flexShrink: 0,
            minHeight: '64px',
          }}
        >
          {!collapsed && (
            <div
              style={{
                fontFamily:
                  'var(--font-display)',

                fontSize: '0.95rem',
                fontWeight: 700,

                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              Tech{' '}
              <span
                style={{
                  color: 'var(--accent)',
                }}
              >
                Market
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setCollapsed((c) => !c)
            }
            style={{
              color: '#aaa',

              background:
                'rgba(255,255,255,0.07)',

              border: 'none',
              borderRadius: '6px',

              width: '30px',
              height: '30px',

              cursor: 'pointer',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              flexShrink: 0,
            }}
          >
            {collapsed ? (
              <Icons.ChevronRight
                size={15}
              />
            ) : (
              <Icons.ChevronLeft
                size={15}
              />
            )}
          </button>
        </div>

        {/* NAVEGACIÓN */}

        <nav
          style={{
            flex: 1,
            padding: '0.5rem 0',
          }}
        >
          {NAV.map((item) => {
            const active =
              section === item.key

            let badge = null

            if (
              item.key === 'carrito' &&
              cartTotal > 0
            ) {
              badge = cartTotal
            }

            if (
              item.key === 'comparar' &&
              compareTotal > 0
            ) {
              badge = compareTotal
            }

            return (
              <button
                type="button"
                key={item.key}
                onClick={() =>
                  onSection(item.key)
                }
                title={
                  collapsed
                    ? item.label
                    : ''
                }
                style={{
                  width: '100%',

                  display: 'flex',
                  alignItems: 'center',

                  gap: '0.75rem',

                  padding: collapsed
                    ? '0.75rem'
                    : '0.75rem 1.25rem',

                  background: active
                    ? 'rgba(255,107,53,0.15)'
                    : 'transparent',

                  borderLeft: active
                    ? '3px solid var(--accent)'
                    : '3px solid transparent',

                  color: active
                    ? 'var(--accent)'
                    : '#9ca3af',

                  border: 'none',

                  cursor: 'pointer',

                  fontSize: '0.845rem',

                  fontWeight: active
                    ? 600
                    : 400,

                  transition:
                    'background 0.15s, color 0.15s',

                  textAlign: 'left',

                  justifyContent: collapsed
                    ? 'center'
                    : 'flex-start',

                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background =
                      'rgba(255,255,255,0.05)'

                    e.currentTarget.style.color =
                      '#fff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background =
                      'transparent'

                    e.currentTarget.style.color =
                      '#9ca3af'
                  }
                }}
              >
                <item.Icon size={17} />

                {!collapsed && (
                  <span
                    style={{
                      whiteSpace:
                        'nowrap',

                      overflow:
                        'hidden',

                      textOverflow:
                        'ellipsis',
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {badge !== null && (
                  <span
                    style={{
                      position:
                        'absolute',

                      top:
                        '0.35rem',

                      right: collapsed
                        ? '0.3rem'
                        : '0.75rem',

                      background:
                        'var(--accent)',

                      color: '#fff',

                      borderRadius:
                        '10px',

                      fontSize:
                        '0.6rem',

                      fontWeight:
                        700,

                      padding:
                        '0.1rem 0.35rem',

                      minWidth:
                        '16px',

                      textAlign:
                        'center',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* FOOTER */}

        <div
          style={{
            padding: '0.875rem',

            borderTop:
              '1px solid rgba(255,255,255,0.08)',

            flexShrink: 0,

            display: 'flex',
            flexDirection: 'column',

            gap: '0.4rem',
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate('/')
            }
            title={
              collapsed
                ? 'Ir a la tienda'
                : ''
            }
            style={{
              width: '100%',

              display: 'flex',
              alignItems: 'center',

              gap: '0.75rem',

              padding: '0.6rem',

              background:
                'rgba(255,255,255,0.05)',

              border: 'none',
              borderRadius: '8px',

              color: '#9ca3af',

              cursor: 'pointer',

              fontSize: '0.8rem',

              justifyContent: collapsed
                ? 'center'
                : 'flex-start',
            }}
          >
            <Icons.Home size={16} />

            {!collapsed && (
              <span>
                Ir a la tienda
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed
                ? 'Cerrar sesión'
                : ''
            }
            style={{
              width: '100%',

              display: 'flex',
              alignItems: 'center',

              gap: '0.75rem',

              padding: '0.6rem',

              background:
                'rgba(198,40,40,0.12)',

              border: 'none',
              borderRadius: '8px',

              color: '#f87171',

              cursor: 'pointer',

              fontSize: '0.8rem',

              justifyContent: collapsed
                ? 'center'
                : 'flex-start',
            }}
          >
            <Icons.LogOut size={16} />

            {!collapsed && (
              <span>
                Cerrar sesión
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {/* TOPBAR */}

        <div
          style={{
            background: '#fff',

            padding:
              '0.875rem 2rem',

            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',

            boxShadow:
              '0 1px 4px rgba(0,0,0,0.07)',

            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {activeItem && (
              <activeItem.Icon
                size={20}
                color="var(--accent)"
              />
            )}

            <h1
              style={{
                fontFamily:
                  'var(--font-display)',

                fontSize:
                  '1.3rem',

                fontWeight:
                  700,

                margin: 0,
              }}
            >
              {activeItem?.label ||
                'Portal cliente'}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
            }}
          >
            <span
              style={{
                fontSize:
                  '0.85rem',

                color:
                  '#6b7280',
              }}
            >
              {user?.nombre ||
                user?.email ||
                'Cliente'}
            </span>

            <div
              style={{
                width: '34px',
                height: '34px',

                borderRadius:
                  '50%',

                background:
                  'var(--accent)',

                color: '#fff',

                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',

                fontWeight:
                  700,

                fontSize:
                  '0.875rem',

                flexShrink: 0,
              }}
            >
              {(
                user?.nombre ||
                user?.email ||
                'C'
              )[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* CONTENIDO */}

        <div
          style={{
            padding: '2rem',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}