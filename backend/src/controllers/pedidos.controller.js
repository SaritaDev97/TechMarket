import prisma from '../utils/prisma.js'

// ─────────────────────────────────────────────
// TIEMPO DE CONFIRMACIÓN AUTOMÁTICA
// ─────────────────────────────────────────────
// Para pruebas utilizamos 2 minutos.
const MINUTOS_CONFIRMACION_AUTOMATICA = 2

// ─────────────────────────────────────────────
// CONFIRMAR AUTOMÁTICAMENTE PEDIDOS VENCIDOS
// ─────────────────────────────────────────────
async function confirmarPedidosAutomaticamente(usuarioId) {
  const fechaLimite = new Date(
    Date.now() - MINUTOS_CONFIRMACION_AUTOMATICA * 60 * 1000
  )

  const resultado = await prisma.pedido.updateMany({
    where: {
      usuario_id: usuarioId,
      estado: 'PENDIENTE_CONFIRMACION',
      created_at: {
        lte: fechaLimite
      }
    },

    data: {
      estado: 'CONFIRMADO'
    }
  })

  return resultado.count
}


// ─────────────────────────────────────────────
// OBTENER LOS PEDIDOS DEL USUARIO AUTENTICADO
// GET /api/pedidos/mis-pedidos
// ─────────────────────────────────────────────
export async function getMisPedidos(req, res) {
  try {
    const usuarioId = Number(req.usuario?.id)

    if (!usuarioId) {
      return res.status(401).json({
        message: 'Usuario no autenticado'
      })
    }

    // Antes de devolver los pedidos revisamos si alguno
    // lleva 2 minutos pendiente de confirmación.
    await confirmarPedidosAutomaticamente(usuarioId)

    const pedidos = await prisma.pedido.findMany({
      where: {
        usuario_id: usuarioId
      },

      include: {
        detalle_pedido: {
          include: {
            producto: true
          }
        }
      },

      orderBy: {
        created_at: 'desc'
      }
    })

    const pedidosFormateados = pedidos.map((pedido) => ({
      id: pedido.id,
      usuario_id: pedido.usuario_id,
      direccion_entrega: pedido.direccion_entrega,
      observaciones: pedido.observaciones,
      total: Number(pedido.total),
      estado: pedido.estado,
      created_at: pedido.created_at,
      updated_at: pedido.updated_at,

      detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
        id: detalle.id,
        pedido_id: detalle.pedido_id,
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        precio_unitario: Number(detalle.precio_unitario),
        subtotal: Number(detalle.subtotal),

        // Se llama "productos" porque así lo espera
        // actualmente ClientePedidos.jsx
        productos: {
          id: detalle.producto.id,
          nombre: detalle.producto.nombre,
          imagen: detalle.producto.imagen,
          marca: detalle.producto.marca
        }
      }))
    }))

    return res.json({
      data: pedidosFormateados
    })

  } catch (error) {
    console.error('Error al obtener mis pedidos:', error)

    return res.status(500).json({
      message: 'Error al obtener los pedidos'
    })
  }
}

// ============================================================
// OBTENER TODOS LOS PEDIDOS - ADMIN
// GET /api/pedidos
// ============================================================
export async function getPedidos(req, res) {
  try {
    const {
      estado,
      page = 1,
      limit = 10
    } = req.query

    const pagina = Math.max(1, Number(page) || 1)
    const limite = Math.max(1, Number(limit) || 10)

    const where = {}

    if (estado && estado !== 'TODOS') {
      where.estado = estado
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,

        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              telefono: true
            }
          },

          detalle_pedido: {
            include: {
              producto: true
            }
          }
        },

        orderBy: {
          created_at: 'desc'
        },

        skip: (pagina - 1) * limite,
        take: limite
      }),

      prisma.pedido.count({
        where
      })
    ])

    const data = pedidos.map((pedido) => ({
      id: pedido.id,
      usuario_id: pedido.usuario_id,
      direccion_entrega: pedido.direccion_entrega,
      observaciones: pedido.observaciones,
      total: Number(pedido.total),
      estado: pedido.estado,
      created_at: pedido.created_at,
      updated_at: pedido.updated_at,

      // AdminPedidos.jsx acepta "cliente"
      cliente: pedido.usuario,

      detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
        id: detalle.id,
        pedido_id: detalle.pedido_id,
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        precio_unitario: Number(detalle.precio_unitario),
        subtotal: Number(detalle.subtotal),

        producto: {
          id: detalle.producto.id,
          nombre: detalle.producto.nombre,
          imagen: detalle.producto.imagen,
          marca: detalle.producto.marca
        }
      }))
    }))

    return res.json({
      data,
      total,
      page: pagina,
      limit: limite,
      totalPages: Math.ceil(total / limite)
    })
  } catch (error) {
    console.error('Error al obtener pedidos:', error)

    return res.status(500).json({
      message: 'Error al obtener los pedidos'
    })
  }
}


// ============================================================
// OBTENER DETALLE DE UN PEDIDO
// GET /api/pedidos/:id
// ============================================================
export async function getPedidoById(req, res) {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: 'ID de pedido inválido'
      })
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id },

      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true
          }
        },

        detalle_pedido: {
          include: {
            producto: true
          }
        }
      }
    })

    if (!pedido) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      })
    }

    const data = {
      id: pedido.id,
      usuario_id: pedido.usuario_id,
      direccion_entrega: pedido.direccion_entrega,
      observaciones: pedido.observaciones,
      total: Number(pedido.total),
      estado: pedido.estado,
      created_at: pedido.created_at,
      updated_at: pedido.updated_at,

      cliente: pedido.usuario,

      detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
        id: detalle.id,
        pedido_id: detalle.pedido_id,
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        precio_unitario: Number(detalle.precio_unitario),
        subtotal: Number(detalle.subtotal),

        producto: {
          id: detalle.producto.id,
          nombre: detalle.producto.nombre,
          imagen: detalle.producto.imagen,
          marca: detalle.producto.marca
        }
      }))
    }

    return res.json({
      data
    })
  } catch (error) {
    console.error('Error al obtener pedido:', error)

    return res.status(500).json({
      message: 'Error al obtener el pedido'
    })
  }
}


// ============================================================
// CREAR PEDIDO - CLIENTE
// POST /api/pedidos
// ============================================================
export async function createPedido(req, res) {
  try {
    const usuarioId = Number(req.usuario?.id)

    if (!usuarioId) {
      return res.status(401).json({
        message: 'Usuario no autenticado'
      })
    }

    const {
      direccion_entrega,
      observaciones,
      productos
    } = req.body

    if (!direccion_entrega?.trim()) {
      return res.status(400).json({
        message: 'La dirección de entrega es requerida'
      })
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        message: 'El pedido debe contener al menos un producto'
      })
    }

    const productoIds = productos.map((item) =>
      Number(item.producto_id)
    )

    const productosBD = await prisma.producto.findMany({
      where: {
        id: {
          in: productoIds
        },
        activo: true
      }
    })

    if (productosBD.length !== productoIds.length) {
      return res.status(400).json({
        message: 'Uno o más productos no existen o están inactivos'
      })
    }

    let total = 0
    const detalles = []

    for (const item of productos) {
      const producto = productosBD.find(
        (p) => p.id === Number(item.producto_id)
      )

      const cantidad = Number(item.cantidad)

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({
          message: 'Cantidad de producto inválida'
        })
      }

      if (producto.stock < cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente para ${producto.nombre}`
        })
      }

      const precio = Number(producto.precio_venta)
      const subtotal = precio * cantidad

      total += subtotal

      detalles.push({
        producto_id: producto.id,
        cantidad,
        precio_unitario: precio,
        subtotal
      })
    }

    const pedido = await prisma.$transaction(async (tx) => {
      // Crear pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          usuario_id: usuarioId,
          direccion_entrega: direccion_entrega.trim(),
          observaciones: observaciones?.trim() || null,
          total,
          estado: 'PENDIENTE_CONFIRMACION',

          detalle_pedido: {
            create: detalles
          }
        },

        include: {
          detalle_pedido: {
            include: {
              producto: true
            }
          }
        }
      })

      // Descontar inventario
      for (const detalle of detalles) {
        await tx.producto.update({
          where: {
            id: detalle.producto_id
          },

          data: {
            stock: {
              decrement: detalle.cantidad
            }
          }
        })
      }

      return nuevoPedido
    })

    return res.status(201).json({
      message: 'Pedido creado correctamente',
      data: {
        ...pedido,
        total: Number(pedido.total)
      }
    })
  } catch (error) {
    console.error('Error al crear pedido:', error)

    return res.status(500).json({
      message: 'Error al crear el pedido'
    })
  }
}


// ============================================================
// ACTUALIZAR ESTADO
// PATCH /api/pedidos/:id/estado
// ============================================================
export async function actualizarEstadoPedido(req, res) {
  try {
    const id = Number(req.params.id)
    const { estado } = req.body

    const estadosPermitidos = [
      'PENDIENTE_CONFIRMACION',
      'CONFIRMADO',
      'EN_RUTA',
      'ENTREGADO',
      'CANCELADO'
    ]

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: 'ID de pedido inválido'
      })
    }

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        message: 'Estado de pedido inválido'
      })
    }

    const existente = await prisma.pedido.findUnique({
      where: { id }
    })

    if (!existente) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      })
    }

    if (['ENTREGADO', 'CANCELADO'].includes(existente.estado)) {
      return res.status(400).json({
        message: 'Este pedido ya no puede cambiar de estado'
      })
    }

    const pedido = await prisma.pedido.update({
      where: { id },
      data: { estado }
    })

    return res.json({
      message: 'Estado actualizado correctamente',
      data: {
        ...pedido,
        total: Number(pedido.total)
      }
    })
  } catch (error) {
    console.error('Error al actualizar estado:', error)

    return res.status(500).json({
      message: 'Error al actualizar el estado'
    })
  }
}


// ============================================================
// CONFIRMAR PEDIDO
// PATCH /api/pedidos/:id/confirmar
// ============================================================
export async function confirmarPedido(req, res) {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: 'ID de pedido inválido'
      })
    }

    const pedidoActual = await prisma.pedido.findUnique({
      where: { id }
    })

    if (!pedidoActual) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      })
    }

    if (pedidoActual.estado !== 'PENDIENTE_CONFIRMACION') {
      return res.status(400).json({
        message: 'Solo se pueden confirmar pedidos pendientes'
      })
    }

    const pedido = await prisma.pedido.update({
      where: { id },

      data: {
        estado: 'CONFIRMADO'
      }
    })

    return res.json({
      message: 'Pedido confirmado correctamente',
      data: {
        ...pedido,
        total: Number(pedido.total)
      }
    })
  } catch (error) {
    console.error('Error al confirmar pedido:', error)

    return res.status(500).json({
      message: 'Error al confirmar el pedido'
    })
  }
}


// ============================================================
// CANCELAR PEDIDO
// PATCH /api/pedidos/:id/cancelar
// ============================================================
export async function cancelarPedido(req, res) {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: 'ID de pedido inválido'
      })
    }

    const pedidoActual = await prisma.pedido.findUnique({
      where: { id },

      include: {
        detalle_pedido: true
      }
    })

    if (!pedidoActual) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      })
    }

    if (pedidoActual.estado === 'CANCELADO') {
      return res.status(400).json({
        message: 'El pedido ya está cancelado'
      })
    }

    if (pedidoActual.estado === 'ENTREGADO') {
      return res.status(400).json({
        message: 'No se puede cancelar un pedido entregado'
      })
    }

    const pedido = await prisma.$transaction(async (tx) => {
      // Devolver el inventario
      for (const detalle of pedidoActual.detalle_pedido) {
        await tx.producto.update({
          where: {
            id: detalle.producto_id
          },

          data: {
            stock: {
              increment: detalle.cantidad
            }
          }
        })
      }

      return tx.pedido.update({
        where: { id },

        data: {
          estado: 'CANCELADO'
        }
      })
    })

    return res.json({
      message: 'Pedido cancelado correctamente',
      data: {
        ...pedido,
        total: Number(pedido.total)
      }
    })
  } catch (error) {
    console.error('Error al cancelar pedido:', error)

    return res.status(500).json({
      message: 'Error al cancelar el pedido'
    })
  }
}