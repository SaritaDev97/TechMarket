import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
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
import ClientePage from './pages/cliente/ClientePage'
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
        <BrowserRouter>
          <Routes>
            {/* Rutas de panel interno sin header/footer */}
            <Route path="/admin"    element={<AdminPage />} />
            <Route path="/cliente"  element={<ClientePage />} />

            {/* Rutas normales con header/footer */}
            <Route path="/*" element={
              <>
                <PromoBanner />
                <TopBar />
                <Header />
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/promociones" element={<PromocionesPage />} />
                  <Route path="/marcas" element={<MarcasPage />} />
                  <Route path="/marca/:nombre" element={<MarcaPage />} />
                  <Route path="/ideas" element={<IdeasPage />} />
                  <Route path="/categoria/:nombre" element={<CategoriaPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <Footer />
                <CartSidebar />
                <WishlistSidebar />
                <AuthModal />
                <ToastContainer />
              </>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App