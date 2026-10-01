import express from 'express'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import productosRoutes from './routes/productos.routes.js'
import categoriasRoutes from './routes/categorias.routes.js'
import carritoRoutes from './routes/carrito.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'
import favoritosRoutes from './routes/favoritos.routes.js'
import inventarioRoutes from './routes/inventario.routes.js'
import estadisticasRoutes from './routes/estadisticas.routes.js'
import externaRoutes from './routes/externa.routes.js'
import clientesRoutes from './routes/clientes.routes.js'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Permitir conexión desde el frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}))

// Permitir recibir JSON
app.use(express.json())

// Permitir acceder públicamente a las imágenes subidas
app.use(
  '/uploads',
  express.static(path.resolve('uploads'))
)

// Ruta de prueba
app.get('/api', (req, res) => {
    
  res.json({
    ok: true,
    message: 'API TechMarket funcionando'
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'online'
  })
})

// Rutas de autenticación
app.use('/api/auth', authRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/carrito', carritoRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/favoritos', favoritosRoutes)
app.use('/api/inventario', inventarioRoutes)
app.use('/api/estadisticas', estadisticasRoutes)
app.use('/api/externa', externaRoutes)
app.use('/api/clientes', clientesRoutes)
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor TechMarket ejecutándose en http://localhost:${PORT}`)
})