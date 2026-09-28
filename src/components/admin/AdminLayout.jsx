import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as Icons from './shared/Icons'

const navItems = [
  { id: 'dashboard',      label: 'Dashboard',       Icon: Icons.BarChart2 },
  { id: 'productos',      label: 'Productos',       Icon: Icons.Package },
  { id: 'categorias',     label: 'Categorías',      Icon: Icons.Tag },
  { id: 'inventario',     label: 'Inventario',      Icon: Icons.AlertTriangle },
  { id: 'clientes',       label: 'Clientes',        Icon: Icons.Users },
  { id: 'pedidos',        label: 'Pedidos',         Icon: Icons.ShoppingCart },
  { id: 'estadisticas',   label: 'Estadísticas',    Icon: Icons.TrendingUp },
]

function AdminLayout({ children, activeSection, onSectionChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const activeItem = navItems.find(i => i.id === activeSection)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '64px' : '256px',
        background: '#1a1a2e', color: '#fff',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, minHeight: '64px',
        }}>
          {!collapsed && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden' }}>
              TechMarket <span style={{ color: 'var(--accent)' }}>Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            color: '#aaa', background: 'rgba(255,255,255,0.07)',
            border: 'none', borderRadius: '6px', width: '30px', height: '30px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.2s',
          }}>
            {collapsed
              ? <Icons.ChevronRight size={15} />
              : <Icons.ChevronLeft size={15} />
            }
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {navItems.map(item => {
            const active = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                title={collapsed ? item.label : ''}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '0.75rem', padding: collapsed ? '0.75rem' : '0.75rem 1.25rem',
                  background: active ? 'rgba(255,107,53,0.15)' : 'transparent',
                  borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                  color: active ? 'var(--accent)' : '#9ca3af',
                  border: 'none', cursor: 'pointer', fontSize: '0.845rem',
                  fontWeight: active ? 600 : 400,
                  transition: 'background 0.15s, color 0.15s',
                  textAlign: 'left',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = '#fff'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#9ca3af'
                  }
                }}
              >
                <item.Icon size={17} />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={() => navigate('/')}
            title={collapsed ? 'Ir a la tienda' : ''}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: '0.6rem',
              background: 'rgba(255,255,255,0.05)', border: 'none',
              borderRadius: '8px', color: '#9ca3af', cursor: 'pointer',
              fontSize: '0.8rem', justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            <Icons.Home size={16} />
            {!collapsed && <span>Ir a la tienda</span>}
          </button>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Cerrar sesión' : ''}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: '0.6rem',
              background: 'rgba(198,40,40,0.12)', border: 'none',
              borderRadius: '8px', color: '#f87171', cursor: 'pointer',
              fontSize: '0.8rem', justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(198,40,40,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(198,40,40,0.12)' }}
          >
            <Icons.LogOut size={16} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{
          background: '#fff', padding: '0.875rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activeItem && <activeItem.Icon size={20} color="var(--accent)" />}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>
              {activeItem?.label}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--subtle)' }}>
              {user?.nombre || user?.name || user?.email || 'Admin'}
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
            }}>
              {(user?.nombre || user?.name || 'A')[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout