import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPerfilMe, updatePerfil } from '../../services/api'

function Card({ children }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '1rem'
      }}
    >
      {children}
    </div>
  )
}

function FieldRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.7rem 0.875rem',
        background: '#f8fafc',
        borderRadius: '8px',
        fontSize: '0.875rem'
      }}
    >
      <span
        style={{
          color: '#9ca3af',
          fontWeight: 500
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontWeight: 600,
          color: '#111827',
          textAlign: 'right',
          marginLeft: '1rem'
        }}
      >
        {value || '—'}
      </span>
    </div>
  )
}

function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder
}) {
  return (
    <div>
      <label
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#374151',
          display: 'block',
          marginBottom: '0.3rem'
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.65rem 0.875rem',
          border: '1.5px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '0.875rem',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'var(--font-body)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb'
        }}
      />
    </div>
  )
}

export default function ClientePerfil() {
  const { user, logout } = useAuth()

  const [perfil, setPerfil] = useState(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  })

  const [telefonoError, setTelefonoError] = useState('')

  const [pwForm, setPwForm] = useState({
    password_actual: '',
    password: ''
  })

  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [msg, setMsg] = useState(null)

  function cargarPerfil() {
    setLoadError(null)

    getPerfilMe()
      .then((r) => {
        const d = r.data?.data || r.data

        setPerfil(d)

        setForm({
          nombre: d?.nombre || user?.nombre || '',
          telefono: d?.telefono || '',
          direccion: d?.direccion || ''
        })
      })
      .catch((error) => {
        console.error('Error al cargar perfil:', error)

        setLoadError(
          'No se pudo cargar tu perfil. Intenta de nuevo.'
        )

        setForm({
          nombre: user?.nombre || '',
          telefono: user?.telefono || '',
          direccion: user?.direccion || ''
        })
      })
  }

  useEffect(() => {
    cargarPerfil()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGuardar(e) {
    e.preventDefault()

    setSaving(true)
    setMsg(null)

    try {
      const payload = {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim()
      }

      // Solo enviamos contraseña cuando el usuario
      // realmente quiere cambiarla.
      if (pwForm.password) {
        if (!pwForm.password_actual) {
          setMsg({
            type: 'error',
            text: 'Debes escribir tu contraseña actual.'
          })

          setSaving(false)
          return
        }

        payload.password_actual = pwForm.password_actual
        payload.password = pwForm.password
      }

      await updatePerfil(payload)

      // Volver a consultar PostgreSQL para mostrar
      // exactamente los datos que fueron guardados.
      const refreshed = await getPerfilMe()

      const d =
        refreshed.data?.data ||
        refreshed.data

      setPerfil(d)

      setForm({
        nombre: d?.nombre || '',
        telefono: d?.telefono || '',
        direccion: d?.direccion || ''
      })

      // Actualizar también la información almacenada
      // localmente en el navegador.
      const usuarioGuardado = JSON.parse(
        localStorage.getItem('user') || '{}'
      )

      const usuarioActualizado = {
        ...usuarioGuardado,
        nombre:
          d?.nombre ||
          usuarioGuardado.nombre,

        telefono:
          d?.telefono ||
          null,

        direccion:
          d?.direccion ||
          null
      }

      localStorage.setItem(
        'user',
        JSON.stringify(usuarioActualizado)
      )

      setMsg({
        type: 'ok',
        text: 'Perfil actualizado correctamente'
      })

      setEditing(false)

      setPwForm({
        password_actual: '',
        password: ''
      })

    } catch (err) {
      console.error(
        'Error al actualizar perfil:',
        err
      )

      setMsg({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Error al guardar los cambios'
      })

    } finally {
      setSaving(false)
    }
  }

  const nombre =
    perfil?.nombre ||
    user?.nombre ||
    'Usuario'

  const email =
    perfil?.email ||
    user?.email ||
    '—'

  const telefono =
    perfil?.telefono ||
    user?.telefono ||
    '—'

  const direccion =
    perfil?.direccion ||
    user?.direccion ||
    '—'

  return (
    <div style={{ maxWidth: '560px' }}>

      {/* MENSAJE DE ÉXITO O ERROR */}
      {msg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',

            background:
              msg.type === 'ok'
                ? '#f0fdf4'
                : '#fef2f2',

            color:
              msg.type === 'ok'
                ? '#166534'
                : '#dc2626',

            border:
              msg.type === 'ok'
                ? '1px solid #bbf7d0'
                : '1px solid #fecaca'
          }}
        >
          {msg.type === 'ok' ? '✓ ' : '⚠ '}
          {msg.text}
        </div>
      )}

      {/* ERROR AL CARGAR PERFIL */}
      {loadError && (
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }}
        >
          {loadError}

          <button
            onClick={cargarPerfil}
            style={{
              marginLeft: '1rem',
              background: 'none',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              color: '#dc2626',
              cursor: 'pointer',
              padding: '0.25rem 0.6rem'
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      <Card>

        {/* CABECERA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700
            }}
          >
            {nombre.charAt(0).toUpperCase()}
          </div>

          <div>
            <p
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                margin: 0,
                color: '#111827'
              }}
            >
              {nombre}
            </p>

            <p
              style={{
                fontSize: '0.82rem',
                color: '#9ca3af',
                margin: '0.15rem 0 0'
              }}
            >
              {email}
            </p>
          </div>
        </div>

        {/* DATOS DEL PERFIL */}
        {!editing && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <FieldRow
              label="Nombre"
              value={nombre}
            />

            <FieldRow
              label="Correo electrónico"
              value={email}
            />

            <FieldRow
              label="Teléfono"
              value={telefono}
            />

            <FieldRow
              label="Dirección"
              value={direccion}
            />

            <button
              onClick={() => {
                setForm({
                  nombre:
                    perfil?.nombre ||
                    user?.nombre ||
                    '',

                  telefono:
                    perfil?.telefono ||
                    user?.telefono ||
                    '',

                  direccion:
                    perfil?.direccion ||
                    user?.direccion ||
                    ''
                })

                setEditing(true)
                setMsg(null)
              }}
              style={{
                marginTop: '0.75rem',
                padding: '0.65rem',
                border:
                  '1.5px solid var(--accent)',
                borderRadius: '8px',
                background: 'transparent',
                color: 'var(--accent)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ✎ Editar perfil
            </button>
          </div>
        )}

        {/* FORMULARIO DE EDICIÓN */}
        {editing && (
          <form
            onSubmit={handleGuardar}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem'
            }}
          >
            <FormField
              label="Nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  nombre: e.target.value
                }))
              }
              placeholder="Tu nombre"
            />
            
<FormField
  label="Teléfono"
  type="tel"
  value={form.telefono}
  onChange={e => {
    const valor = e.target.value

    if (/[^0-9]/.test(valor)) {
      setTelefonoError('Solo puede ingresar valores numéricos')
      return
    }

    setTelefonoError('')
    setForm({ ...form, telefono: valor })
  }}
  placeholder="Ej. 77778888"
/>

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

            <FormField
              label="Dirección"
              value={form.direccion}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  direccion: e.target.value
                }))
              }
              placeholder="Ejemplo: Santa Ana, El Salvador"
            />

            {/* CAMBIO DE CONTRASEÑA */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '1rem',
                border: '1px solid #e5e7eb'
              }}
            >
              <p
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#374151',
                  margin: '0 0 0.75rem'
                }}
              >
                Cambiar contraseña (opcional)
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <FormField
                  label="Contraseña actual"
                  type="password"
                  value={
                    pwForm.password_actual
                  }
                  onChange={(e) =>
                    setPwForm((p) => ({
                      ...p,
                      password_actual:
                        e.target.value
                    }))
                  }
                  placeholder="Contraseña actual"
                />

                <FormField
                  label="Nueva contraseña"
                  type="password"
                  value={pwForm.password}
                  onChange={(e) =>
                    setPwForm((p) => ({
                      ...p,
                      password:
                        e.target.value
                    }))
                  }
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            {/* BOTONES */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem'
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '0.7rem',

                  background:
                    saving
                      ? '#f3f4f6'
                      : 'var(--accent)',

                  color:
                    saving
                      ? '#9ca3af'
                      : '#fff',

                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,

                  cursor:
                    saving
                      ? 'not-allowed'
                      : 'pointer'
                }}
              >
                {saving
                  ? 'Guardando...'
                  : '✓ Guardar cambios'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setMsg(null)

                  setForm({
                    nombre:
                      perfil?.nombre ||
                      user?.nombre ||
                      '',

                    telefono:
                      perfil?.telefono ||
                      user?.telefono ||
                      '',

                    direccion:
                      perfil?.direccion ||
                      user?.direccion ||
                      ''
                  })

                  setPwForm({
                    password_actual: '',
                    password: ''
                  })
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  border:
                    '1.5px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

      </Card>

      {/* CERRAR SESIÓN */}
      <button
        onClick={logout}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1.5px solid #fecaca',
          borderRadius: '8px',
          background: '#fef2f2',
          color: '#dc2626',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        Cerrar sesión
      </button>

    </div>
  )
}