import { Router } from 'express'

import {
  getMisPedidos,
  getPedidos,
  getPedidoById,
  createPedido,
  actualizarEstadoPedido,
  confirmarPedido,
  cancelarPedido
} from '../controllers/pedidos.controller.js'

import {
  verificarToken
} from '../middlewares/middleware.js'

const router = Router()

// Pedidos del cliente autenticado
router.get('/mis-pedidos', verificarToken, getMisPedidos)

// Obtener todos los pedidos
router.get('/', verificarToken, getPedidos)

// Crear pedido
router.post('/', verificarToken, createPedido)

// Obtener detalle
router.get('/:id', verificarToken, getPedidoById)

// Cambiar estado
router.patch('/:id/estado', verificarToken, actualizarEstadoPedido)

// Confirmar
router.patch('/:id/confirmar', verificarToken, confirmarPedido)

// Cancelar
router.patch('/:id/cancelar', verificarToken, cancelarPedido)

export default router