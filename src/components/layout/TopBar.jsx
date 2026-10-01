import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

function TopBar() {
  const navigate = useNavigate()

  const {
    setAuthOpen,
    setCartOpen
  } = useCart()

  const { user } = useAuth()

  function handleMisPedidos() {
    // Si no ha iniciado sesión, abrir el modal de login
    if (!user) {
      setAuthOpen(true)
      return
    }

    // Si hay sesión, abrir directamente el historial
    navigate('/cliente', {
      state: {
        section: 'pedidos'
      }
    })
  }

  function handleLogin() {
    // Si ya inició sesión, llevarlo a su área de cliente
    if (user) {
      navigate('/cliente')
      return
    }

    setAuthOpen(true)
  }

  return (
    <div className="top-bar">
      <div className="container">

        <div
          className="top-bar__right"
          style={{
            marginLeft: 'auto'
          }}
        >

          {/* INICIAR SESIÓN / MI CUENTA */}
          <button
            className="top-bar__link"
            onClick={handleLogin}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>

            <span>
              {user ? 'Mi cuenta' : 'Iniciar sesión'}
            </span>
          </button>

          {/* MIS PEDIDOS */}
          <button
            className="top-bar__link"
            onClick={handleMisPedidos}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
              />
            </svg>

            <span>Mis pedidos</span>
          </button>

          {/* CARRITO */}
          <button
            className="top-bar__link"
            onClick={() => setCartOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            <span>Carrito</span>
          </button>

        </div>

      </div>
    </div>
  )
}

export default TopBar