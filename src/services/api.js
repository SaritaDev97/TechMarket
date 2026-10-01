import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el JWT en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Manejo de token expirado o inválido
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const msg = (err.response?.data?.message || '').toLowerCase()

    const isAuthFailure =
      status === 401 ||
      (status === 403 &&
        (msg.includes('token') || msg.includes('expirado')))

    if (isAuthFailure) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:logout'))
    }

    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (data) =>
  api.post('/auth/login', data)

export const register = (data) =>
  api.post('/auth/register', data)

export const registerCliente = (data) =>
  api.post('/auth/register-cliente', data)

export const getUsuarioById = (id) =>
  api.get(`/users/${id}`)

export const getPerfilMe = () =>
  api.get('/auth/me')

export const updatePerfil = (data) =>
  api.put('/auth/perfil', data)


// ── Usuarios ──────────────────────────────────────────────────────────────────
export const getUsuarios = (params) =>
  api.get('/users', { params })

export const getRoles = () =>
  api.get('/users/roles')

export const deleteUsuario = (id) =>
  api.delete(`/users/${id}`)


// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () =>
  api.get('/dashboard')


// ── Estadísticas ─────────────────────────────────────────────
export const getEstadisticas = () =>
  api.get('/estadisticas')


// ── Productos ─────────────────────────────────────────────────────────────────
// Estas dos rutas YA están conectadas con el backend nuevo de TechMarket.
export const getProductos = (params) =>
  api.get('/productos', { params })

export const getProducto = (id) =>
  api.get(`/productos/${id}`)

// Estas rutas se conectarán después al backend nuevo.
export const getMarcas = () =>
  api.get('/productos/marcas')

export const createProducto = (data) =>
  api.post('/productos', data)

export const updateProducto = (id, data) =>
  api.put(`/productos/${id}`, data)

export const deleteProducto = (id) =>
  api.delete(`/productos/${id}`)


// ── Categorías ────────────────────────────────────────────────────────────────
export const getCategorias = () =>
  api.get('/categorias')

export const getCategoria = (id) =>
  api.get(`/categorias/${id}`)

export const createCategoria = (data) =>
  api.post('/categorias', data)

export const updateCategoria = (id, data) =>
  api.put(`/categorias/${id}`, data)

export const deleteCategoria = (id) =>
  api.delete(`/categorias/${id}`)


// ── Clientes ──────────────────────────────────────────────────────────────────
export const getClientes = (params) =>
  api.get('/clientes', { params })

export const getCliente = (id) =>
  api.get(`/clientes/${id}`)

export const buscarCliente = (q) =>
  api.get('/clientes', {
    params: {
      buscar: q,
      limit: 50,
    },
  })

export const createCliente = (data) =>
  api.post('/clientes', data)

export const updateCliente = (id, data) =>
  api.put(`/clientes/${id}`, data)

export const deleteCliente = (id) =>
  api.delete(`/clientes/${id}`)


// ── Proveedores ───────────────────────────────────────────────────────────────
export const getProveedores = (params) =>
  api.get('/proveedores', { params })

export const getProveedor = (id) =>
  api.get(`/proveedores/${id}`)

export const createProveedor = (data) =>
  api.post('/proveedores', data)

export const updateProveedor = (id, data) =>
  api.put(`/proveedores/${id}`, data)

export const deleteProveedor = (id) =>
  api.delete(`/proveedores/${id}`)


// ── Descuentos ────────────────────────────────────────────────────────────────
export const getDescuentos = (params) =>
  api.get('/descuentos', { params })

export const getDescuento = (id) =>
  api.get(`/descuentos/${id}`)

export const createDescuento = (data) =>
  api.post('/descuentos', data)

export const updateDescuento = (id, data) =>
  api.put(`/descuentos/${id}`, data)

export const deleteDescuento = (id) =>
  api.delete(`/descuentos/${id}`)

export const verificarPrimeraCompra = (cliente_id) =>
  api.get('/descuentos/primera-compra/verificar', {
    params: { cliente_id },
  })


// ── Inventario ────────────────────────────────────────────────────────────────
export const getInventarioCriticos = () =>
  api.get('/inventario/criticos')


// ── Movimientos ───────────────────────────────────────────────────────────────
export const getMovimientos = (params) =>
  api.get('/movimientos', { params })

export const createMovimiento = (data) =>
  api.post('/movimientos', data)


// ── Órdenes de Compra ─────────────────────────────────────────────────────────
export const getOrdenesCompra = (params) =>
  api.get('/ordenes-compra', { params })

export const getOrdenCompra = (id) =>
  api.get(`/ordenes-compra/${id}`)

export const createOrdenCompra = (data) =>
  api.post('/ordenes-compra', data)

export const recibirOrdenCompra = (id, data) =>
  api.put(`/ordenes-compra/${id}/recibir`, data)


// ── Pedidos ───────────────────────────────────────────────────────────────────
export const getMisPedidos = (params) =>
  api.get('/pedidos/mis-pedidos', { params })

export const getPedidos = (params) =>
  api.get('/pedidos', { params })

export const getPedido = (id) =>
  api.get(`/pedidos/${id}`)

export const createPedido = (data) =>
  api.post('/pedidos', data)

export const actualizarEstadoPedido = (id, data) =>
  api.patch(`/pedidos/${id}/estado`, data)

export const confirmarPedido = (id) =>
  api.patch(`/pedidos/${id}/confirmar`)

export const cancelarPedido = (id) =>
  api.patch(`/pedidos/${id}/cancelar`)


// ── Favoritos ─────────────────────────────────────────────────────────────────

// Obtener los favoritos del usuario autenticado
export const getFavoritos = () =>
  api.get('/favoritos')

// Agregar un producto a favoritos
export const addFavorito = (producto_id) =>
  api.post(`/favoritos/${producto_id}`)

// Eliminar un producto de favoritos
export const removeFavorito = (producto_id) =>
  api.delete(`/favoritos/${producto_id}`)


// ── Carrito ───────────────────────────────────────────────────────────────────
export const getCarritoAPI = (session_id, cliente_id) =>
  api.get('/carrito', {
    params: {
      session_id,
      ...(cliente_id ? { cliente_id } : {}),
    },
  })

export const addCarritoItem = (
  session_id,
  producto_id,
  cantidad,
  cliente_id
) =>
  api.post('/carrito/items', {
    session_id,
    producto_id,
    cantidad,
    ...(cliente_id ? { cliente_id } : {}),
  })

export const updateCarritoItem = (
  session_id,
  producto_id,
  cantidad
) =>
  api.put(`/carrito/items/${producto_id}`, {
    session_id,
    cantidad,
  })

export const removeCarritoItem = (
  session_id,
  producto_id
) =>
  api.delete(`/carrito/items/${producto_id}`, {
    params: { session_id },
  })

export const clearCarritoAPI = (session_id) =>
  api.delete('/carrito', {
    params: { session_id },
  })

export const checkoutCarrito = (data) =>
  api.post('/carrito/checkout', data)


// ── Uploads ───────────────────────────────────────────────────────────────────
export const uploadImagen = (file) => {
  const form = new FormData()

  form.append('imagen', file)

  return api.post('/uploads/imagen', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}


// ── Ventas ────────────────────────────────────────────────────────────────────
export const getVentas = (params) =>
  api.get('/ventas', { params })

export const getVenta = (id) =>
  api.get(`/ventas/${id}`)

export const createVenta = (data) =>
  api.post('/ventas', data)

export const cancelarVenta = (id) =>
  api.put(`/ventas/${id}/cancelar`)


// ── Caja ──────────────────────────────────────────────────────────────────────
export const getEstadoCaja = () =>
  api.get('/caja/estado')

export const getHistorialCaja = () =>
  api.get('/caja/historial')

export const abrirCaja = (data) =>
  api.post('/caja/abrir', data)

export const cerrarCaja = (data) =>
  api.put('/caja/cerrar', data)


// ── WhatsApp ──────────────────────────────────────────────────────────────────
export const getWhatsAppQr = () =>
  api.get('/whatsapp/qr')

export const getWhatsAppStatus = () =>
  api.get('/whatsapp/status')

export const regenerateWhatsAppQr = () =>
  api.post('/whatsapp/qr/regenerar')


// ── Reportes ──────────────────────────────────────────────────────────────────
export const getReporteCaja = (id) =>
  api.get(`/reportes/caja/${id}`)

export const getReporteDiario = () =>
  api.get('/reportes/diario')

export const getReporteMensual = () =>
  api.get('/reportes/mensual')

export const getTopProductos = () =>
  api.get('/reportes/top-productos')

// ── API externa / Tipo de cambio ─────────────────────────────

// Obtiene desde nuestro backend el tipo de cambio
// tomando USD como moneda base.
export const getTipoCambio = (moneda) =>
  api.get('/externa/tipo-cambio', {
    params: { moneda },
  })

// ── API externa / Catálogo tecnológico ───────────────────────

// Obtiene productos tecnológicos desde la API externa.
// Estos productos son únicamente para visualización.
export const getProductosExternos = () =>
  api.get('/externa/productos')

export default api