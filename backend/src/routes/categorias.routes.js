import { Router } from 'express'
import uploadCategoria from '../middlewares/uploadCategoria.js'

import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../controllers/categorias.controller.js'

const router = Router()

// Obtener categorías
router.get('/', getCategorias)

// Crear categoría con imagen
router.post(
  '/',
  uploadCategoria.single('imagen'),
  createCategoria
)

// Obtener una categoría
router.get('/:id', getCategoriaById)

// Editar / reactivar categoría con imagen
router.put(
  '/:id',
  uploadCategoria.single('imagen'),
  updateCategoria
)

// Desactivar categoría
router.delete('/:id', deleteCategoria)

export default router