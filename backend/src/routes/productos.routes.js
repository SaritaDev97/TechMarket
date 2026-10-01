import { Router } from 'express'
import uploadProducto from '../middlewares/uploadProducto.js'

import {
  getProductos,
  getProductoById,
  getMarcas,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/productos.controller.js'

const router = Router()

// Obtener productos
router.get('/', getProductos)

// IMPORTANTE:
// /marcas debe ir antes de /:id
router.get('/marcas', getMarcas)

// Crear producto
router.post(
  '/',
  uploadProducto.single('imagen'),
  createProducto
)

// Obtener producto por ID
router.get('/:id', getProductoById)

// Editar producto
router.put(
  '/:id',
  uploadProducto.single('imagen'),
  updateProducto
)

// Eliminar producto
router.delete('/:id', deleteProducto)

export default router