import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CompareProvider } from './context/CompareContext'
import GuiaDetallePage from './pages/GuiaDetallePage'

import TopBar from './components/layout/TopBar'
import Header from './components/layout/Header'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import HomePage from './pages/HomePage'
import PromocionesPage from './pages/PromocionesPage'
import MarcasPage from './pages/MarcasPage'
import MarcaPage from './pages/MarcaPage'
import IdeasPage from './pages/IdeasPage'
import CategoriaPage from './pages/CategoriaPage'
import NotFoundPage from './pages/NotFoundPage'

import AdminPage from './pages/admin/AdminPage'
import OperadorPage from './pages/operador/OperadorPage'
import ClientePage from './pages/cliente/ClientePage'
import DetalleProducto from './pages/cliente/DetalleProducto'

import CartSidebar from './components/ui/CartSidebar'
import WishlistSidebar from './components/ui/WishlistSidebar'
import AuthModal from './components/ui/AuthModal'
import PromoBanner from './components/ui/PromoBanner'
import ToastContainer from './components/ui/ToastContainer'

import './index.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <BrowserRouter>
            <Routes>

              {/* Rutas de panel interno sin header/footer */}
              <Route
                path="/admin"
                element={<AdminPage />}
              />

              <Route
                path="/operador"
                element={<OperadorPage />}
              />

              <Route
                path="/cliente"
                element={<ClientePage />}
              />

              <Route
                path="/cliente/producto/:id"
                element={<DetalleProducto />}
              />

              {/* Rutas normales con header/footer */}
              <Route
                path="/*"
                element={
                  <>
                    <PromoBanner />

                    <TopBar />

                    <Header />

                    <Navbar />

                    <Routes>
                      <Route
                        path="/"
                        element={<HomePage />}
                      />

                      <Route
                        path="/promociones"
                        element={<PromocionesPage />}
                      />

                      <Route
                        path="/marcas"
                        element={<MarcasPage />}
                      />

                      <Route
                        path="/marca/:nombre"
                        element={<MarcaPage />}
                      />

                      <Route
                        path="/ideas"
                        element={<IdeasPage />}
                      />

                      <Route
                      path="/ideas/:slug"
                      element={<GuiaDetallePage />}
                      />

                      <Route
                        path="/categoria/:nombre"
                        element={<CategoriaPage />}
                      />

                      <Route
                        path="*"
                        element={<NotFoundPage />}
                      />
                    </Routes>

                    <Footer />

                    <CartSidebar />

                    <WishlistSidebar />

                    <AuthModal />

                    <ToastContainer />
                  </>
                }
              />

            </Routes>
          </BrowserRouter>
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App