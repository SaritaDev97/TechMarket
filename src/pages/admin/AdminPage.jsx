import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminDashboard from '../../components/admin/AdminDashboard'
import AdminProductos from '../../components/admin/AdminProductos'
import AdminCategorias from '../../components/admin/AdminCategorias'
import AdminClientes from '../../components/admin/AdminClientes'
import AdminPedidos from '../../components/admin/AdminPedidos'
import AdminInventario from '../../components/admin/AdminInventario'

function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')

  function renderSection() {
    switch (activeSection) {
      case 'dashboard':      return <AdminDashboard />
      case 'productos':      return <AdminProductos />
      case 'categorias':     return <AdminCategorias />
      case 'inventario':     return <AdminInventario />
      case 'clientes':       return <AdminClientes />
      case 'pedidos':        return <AdminPedidos />
      case 'estadisticas':   return (
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#666' }}>
          <h2>Estadísticas de Ventas</h2>
          <p>Módulo en adaptación...</p>
        </div>
      )
      default:               return <AdminDashboard />
    }
  }

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </AdminLayout>
  )
}

export default AdminPage