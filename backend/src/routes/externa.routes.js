import { Router } from 'express'

import {
  getTipoCambio,
  getProductosExternos
} from '../controllers/externa.controller.js'

const router = Router()

router.get('/tipo-cambio', getTipoCambio)

// Catálogo externo únicamente para visualización
router.get('/productos', getProductosExternos)

export default router