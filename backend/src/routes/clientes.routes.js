import { Router } from 'express'

import {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/clientes.controller.js'

import {
  verificarToken,
  soloAdmin
} from '../middlewares/auth.middleware.js'

const router = Router()

// Todas las operaciones de administración de clientes
// requieren autenticación y rol ADMIN.
router.use(verificarToken, soloAdmin)

router.get('/', getClientes)
router.get('/:id', getCliente)
router.post('/', createCliente)
router.put('/:id', updateCliente)
router.delete('/:id', deleteCliente)

export default router