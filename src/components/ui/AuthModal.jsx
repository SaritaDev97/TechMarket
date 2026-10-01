import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

function AuthModal() {
  const { authOpen, setAuthOpen, showToast } = useCart()
  const { login, register, loading, error } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [registerForm, setRegisterForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    password: '',
  })

  // Mensaje de validación para el número de WhatsApp
  const [telefonoError, setTelefonoError] = useState('')

  const [terms, setTerms] = useState(false)

  if (!authOpen) return null

  function redirectByRol(rol) {
    if (rol === 'admin') {
      navigate('/admin')
    } else if (rol === 'operador') {
      navigate('/operador')
    } else if (rol === 'cliente') {
      navigate('/cliente')
    } else {
      showToast('Sesión iniciada correctamente')
    }
  }

  async function handleLogin(e) {
    e.preventDefault()

    const result = await login(
      loginForm.email,
      loginForm.password
    )

    if (result.ok) {
      setAuthOpen(false)
      redirectByRol(result.rol)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()

    if (!terms) {
      return showToast(
        'Debes aceptar los términos y condiciones'
      )
    }

    const result = await register(
      registerForm.nombre,
      registerForm.telefono || undefined,
      registerForm.email,
      registerForm.password
    )

    if (result.ok) {
      showToast(
        '¡Bienvenido/a! Cuenta creada correctamente'
      )

      setAuthOpen(false)
      redirectByRol(result.rol)
    }
  }

  return (
    <>
      <div
        className="auth-overlay open"
        onClick={() => setAuthOpen(false)}
      />

      <div className="auth-modal open">
        <button
          className="auth-modal__close"
          onClick={() => setAuthOpen(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="auth-modal__logo">
          Tech <span>Market</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${
              tab === 'login' ? 'active' : ''
            }`}
            onClick={() => setTab('login')}
          >
            Iniciar sesión
          </button>

          <button
            className={`auth-tab ${
              tab === 'register' ? 'active' : ''
            }`}
            onClick={() => setTab('register')}
          >
            Crear cuenta
          </button>
        </div>

        {error && (
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
            }}
          >
            {error}
          </div>
        )}

        {/* ==================== LOGIN ==================== */}

        {tab === 'login' && (
          <form
            className="auth-form active"
            onSubmit={handleLogin}
          >
            <div className="auth-form__group">
              <label className="auth-form__label">
                Correo electrónico
              </label>

              <div className="auth-form__input-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>

                <input
                  type="email"
                  placeholder="tu@correo.com"
                  className="auth-form__input"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((p) => ({
                      ...p,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="auth-form__group">
              <label className="auth-form__label">
                Contraseña
              </label>

              <div className="auth-form__input-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="auth-form__input"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                  required
                />

                <button
                  className="auth-form__eye"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="auth-form__forgot">
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              className="auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Ingresando...'
                : 'Iniciar sesión'}
            </button>
          </form>
        )}

        {/* ==================== REGISTRO ==================== */}

        {tab === 'register' && (
          <form
            className="auth-form active"
            onSubmit={handleRegister}
          >
            {/* NOMBRE */}

            <div className="auth-form__group">
              <label className="auth-form__label">
                Nombre completo
              </label>

              <div className="auth-form__input-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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

                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  className="auth-form__input"
                  value={registerForm.nombre}
                  onChange={(e) =>
                    setRegisterForm((p) => ({
                      ...p,
                      nombre: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            {/* ==================== WHATSAPP ==================== */}

            <div className="auth-form__group">
              <label className="auth-form__label">
                WhatsApp{' '}
                <span
                  style={{
                    color: '#aaa',
                    fontWeight: 400,
                  }}
                >
                  (opcional)
                </span>
              </label>

              <div className="auth-form__input-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>

                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="50372880187"
                  className="auth-form__input"
                  value={registerForm.telefono}
                  onChange={(e) => {
                    const valor = e.target.value

                    if (/[^0-9]/.test(valor)) {
                      setTelefonoError(
                        'Solo se pueden ingresar datos numéricos'
                      )
                      return
                    }

                    setTelefonoError('')

                    setRegisterForm((p) => ({
                      ...p,
                      telefono: valor,
                    }))
                  }}
                />
              </div>

              {/* MENSAJE DE ERROR DEL WHATSAPP */}

              {telefonoError && (
                <p
                  style={{
                    color: '#dc2626',
                    fontSize: '0.78rem',
                    marginTop: '0.35rem',
                    marginBottom: 0,
                    fontWeight: 500,
                  }}
                >
                  {telefonoError}
                </p>
              )}
            </div>

            {/* CORREO */}

            <div className="auth-form__group">
              <label className="auth-form__label">
                Correo electrónico
              </label>

              <div className="auth-form__input-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>

                <input
                  type="email"
                  placeholder="tu@correo.com"
                  className="auth-form__input"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm((p) => ({
                      ...p,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            {/* CONTRASEÑA */}

            <div className="auth-form__group">
              <label className="auth-form__label">
                Contraseña
              </label>

              <div className="auth-form__input-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  />

                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  className="auth-form__input"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                  required
                />

                <button
                  className="auth-form__eye"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* TÉRMINOS Y CONDICIONES */}

            <label className="auth-form__check">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) =>
                  setTerms(e.target.checked)
                }
              />

              <span>
                Acepto los{' '}
                <a href="#">
                  términos y condiciones
                </a>
              </span>
            </label>

            <button
              className="auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Creando cuenta...'
                : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}

export default AuthModal