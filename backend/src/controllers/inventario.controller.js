import prisma from '../utils/prisma.js'

// GET /api/inventario
// Devuelve el inventario de todos los productos activos
export async function getInventario(req, res) {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        marca: true,
        stock: true,
        precio_venta: true,
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    })

    const data = productos.map(producto => ({
      ...producto,
      precio_venta: Number(producto.precio_venta),
      estado_stock:
        producto.stock <= 0
          ? 'SIN_STOCK'
          : producto.stock <= 5
            ? 'STOCK_BAJO'
            : 'DISPONIBLE'
    }))

    return res.json({
      data,
      total: data.length
    })
  } catch (error) {
    console.error('Error al obtener inventario:', error)

    return res.status(500).json({
      message: 'Error al obtener el inventario'
    })
  }
}


// GET /api/inventario/criticos
// Devuelve productos con stock crítico (5 unidades o menos)
export async function getInventarioCriticos(req, res) {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true,
        stock: {
          lte: 5
        }
      },
      select: {
        id: true,
        nombre: true,
        marca: true,
        stock: true,
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        stock: 'asc'
      }
    })

    const data = productos.map(producto => ({
      ...producto,
      stock_minimo: 5,
      categorias: producto.categoria
    }))

    return res.json({
      data,
      total: data.length
    })
  } catch (error) {
    console.error('Error al obtener inventario crítico:', error)

    return res.status(500).json({
      message: 'Error al obtener inventario crítico'
    })
  }
}

// GET /api/inventario/resumen
// Resumen general del inventario
export async function getResumenInventario(req, res) {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true
      },
      select: {
        stock: true
      }
    })

    const totalProductos = productos.length

    const unidadesDisponibles = productos.reduce(
      (total, producto) => total + producto.stock,
      0
    )

    const productosSinStock = productos.filter(
      producto => producto.stock <= 0
    ).length

    const productosStockBajo = productos.filter(
      producto => producto.stock > 0 && producto.stock <= 5
    ).length

    return res.json({
      data: {
        totalProductos,
        unidadesDisponibles,
        productosSinStock,
        productosStockBajo
      }
    })
  } catch (error) {
    console.error('Error al obtener resumen de inventario:', error)

    return res.status(500).json({
      message: 'Error al obtener el resumen del inventario'
    })
  }
}


// PATCH /api/inventario/:id/stock
// Actualiza las existencias de un producto
export async function actualizarStock(req, res) {
  try {
    const id = Number(req.params.id)
    const stock = Number(req.body.stock)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID de producto inválido'
      })
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        message: 'El stock debe ser un número entero mayor o igual a 0'
      })
    }

    const productoExistente = await prisma.producto.findUnique({
      where: {
        id
      }
    })

    if (!productoExistente) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }

    const producto = await prisma.producto.update({
      where: {
        id
      },
      data: {
        stock
      },
      select: {
        id: true,
        nombre: true,
        marca: true,
        stock: true
      }
    })

    return res.json({
      message: 'Stock actualizado correctamente',
      data: producto
    })
  } catch (error) {
    console.error('Error al actualizar stock:', error)

    return res.status(500).json({
      message: 'Error al actualizar el stock'
    })
  }
}