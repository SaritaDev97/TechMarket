import {
  useState,
  useEffect,
} from 'react'

import {
  Navigate,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

import ClienteLayout from '../../components/cliente/ClienteLayout'
import ClienteTienda from '../../components/cliente/ClienteTienda'
import ClienteCarrito from '../../components/cliente/ClienteCarrito'
import ClientePedidos from '../../components/cliente/ClientePedidos'
import ClienteComparar from '../../components/cliente/ClienteComparar'
import ClienteCatalogoExterno from '../../components/cliente/ClienteCatalogoExterno'
import ClientePerfil from '../../components/cliente/ClientePerfil'

export default function ClientePage() {
  const {
    user,
    isAdmin,
    isOperador,
  } = useAuth()

  const location = useLocation()

  const [
    section,
    setSection,
  ] = useState(
    location.state?.section ||
    'tienda'
  )

  const [
    pedidosRefresh,
    setPedidosRefresh,
  ] = useState(0)

  // Cambiar de sección cuando
  // otra pantalla envía location.state

  useEffect(() => {
    if (location.state?.section) {
      setSection(
        location.state.section
      )
    }
  }, [location.state?.section])

  // Protección de rutas

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  if (isAdmin) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  if (isOperador) {
    return (
      <Navigate
        to="/operador"
        replace
      />
    )
  }

  // Pedido creado

  function handlePedidoCreado() {
    setPedidosRefresh(
      (n) => n + 1
    )

    setSection('pedidos')
  }

  // Renderizar sección

  function renderSection() {
    switch (section) {
      case 'tienda':
        return (
          <ClienteTienda />
        )

      case 'carrito':
        return (
          <ClienteCarrito
            onPedidoCreado={
              handlePedidoCreado
            }
          />
        )

      case 'pedidos':
        return (
          <ClientePedidos
            refresh={
              pedidosRefresh
            }
          />
        )

      case 'comparar':
        return (
          <ClienteComparar />
        )

        case 'catalogoExterno':
  return (
    <ClienteCatalogoExterno />
  )

      case 'perfil':
        return (
          <ClientePerfil />
        )

      default:
        return (
          <ClienteTienda />
        )
    }
  }

  return (
  <ClienteLayout
    section={section}
    onSection={setSection}
  >
    {renderSection()}
  </ClienteLayout>
)
}