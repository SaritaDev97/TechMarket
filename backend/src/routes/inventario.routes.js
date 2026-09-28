import { Router } from 'express'

import {
  getInventario,
  getInventarioCriticos,
  getResumenInventario,
  actualizarStock
} from '../controllers/inventario.controller.js'
const router = Router()

router.get('/', getInventario)
router.get('/criticos', getInventarioCriticos)
router.get('/resumen', getResumenInventario)
router.patch('/:id/stock', actualizarStock)

export default router