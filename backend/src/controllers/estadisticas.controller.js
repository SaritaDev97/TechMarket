import prisma from '../utils/prisma.js'

// GET /api/estadisticas
export async function getEstadisticas(req, res) {
  try {
    const [
      totalProductos,
      totalCategorias,
      totalClientes,
      totalPedidos,
      productos,
      pedidos,
      detallesVendidos
    ] = await Promise.all([
      // Productos activos
      prisma.producto.count({
        where: { activo: true }
      }),

      // Categorías activas
      prisma.categoria.count({
        where: { activo: true }
      }),

      // Clientes activos
      prisma.usuario.count({
        where: {
          activo: true,
          rol: 'CLIENTE'
        }
      }),

      // Todos los pedidos
      prisma.pedido.count(),

      // Inventario
      prisma.producto.findMany({
        where: { activo: true },
        select: {
          stock: true
        }
      }),

      // Pedidos para estadísticas
      prisma.pedido.findMany({
        select: {
          id: true,
          total: true,
          estado: true,
          created_at: true
        }
      }),

      // Productos vendidos
      prisma.detallePedido.findMany({
        where: {
          pedido: {
            estado: {
              not: 'CANCELADO'
            }
          }
        },
        select: {
          cantidad: true,
          subtotal: true,
          producto_id: true,
          producto: {
            select: {
              id: true,
              nombre: true,
              marca: true,
              imagen: true
            }
          }
        }
      })
    ])

    // ========================================================
    // INVENTARIO
    // ========================================================

    const unidadesInventario = productos.reduce(
      (total, producto) => total + producto.stock,
      0
    )

    const productosSinStock = productos.filter(
      producto => producto.stock <= 0
    ).length

    const productosStockBajo = productos.filter(
      producto => producto.stock > 0 && producto.stock <= 5
    ).length

    // ========================================================
    // VENTAS
    // ========================================================

    const pedidosValidos = pedidos.filter(
      pedido => pedido.estado !== 'CANCELADO'
    )

    const ventasTotales = pedidosValidos.reduce(
      (total, pedido) => total + Number(pedido.total),
      0
    )

    // ========================================================
// VENTAS DEL MES ACTUAL
// ========================================================

const fechaActual = new Date()

const ventasMesActual = pedidosValidos
  .filter(pedido => {
    const fechaPedido = new Date(pedido.created_at)

    return (
      fechaPedido.getMonth() === fechaActual.getMonth() &&
      fechaPedido.getFullYear() === fechaActual.getFullYear()
    )
  })
  .reduce(
    (total, pedido) => total + Number(pedido.total),
    0
  )




    const ticketPromedio =
      pedidosValidos.length > 0
        ? ventasTotales / pedidosValidos.length
        : 0

    // ========================================================
    // PEDIDOS POR ESTADO
    // ========================================================

    const pedidosPorEstado = {
      PENDIENTE_CONFIRMACION: 0,
      CONFIRMADO: 0,
      EN_RUTA: 0,
      ENTREGADO: 0,
      CANCELADO: 0
    }

    pedidos.forEach(pedido => {
      if (pedidosPorEstado[pedido.estado] !== undefined) {
        pedidosPorEstado[pedido.estado]++
      }
    })

    // ========================================================
    // PRODUCTOS MÁS VENDIDOS
    // ========================================================

    const productosAgrupados = {}

    detallesVendidos.forEach(detalle => {
      const id = detalle.producto_id

      if (!productosAgrupados[id]) {
        productosAgrupados[id] = {
          id,
          nombre: detalle.producto?.nombre || 'Producto',
          marca: detalle.producto?.marca || '',
          imagen: detalle.producto?.imagen || null,
          unidadesVendidas: 0,
          ingresos: 0
        }
      }

      productosAgrupados[id].unidadesVendidas +=
        Number(detalle.cantidad)

      productosAgrupados[id].ingresos +=
        Number(detalle.subtotal)
    })

    const topProductos = Object.values(productosAgrupados)
      .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
      .slice(0, 5)
      .map(producto => ({
        ...producto,
        ingresos: Number(producto.ingresos.toFixed(2))
      }))

    const productoMasVendido =
      topProductos.length > 0
        ? topProductos[0]
        : null

    // ========================================================
    // VENTAS ÚLTIMOS 6 MESES
    // ========================================================

    const meses = []

    const ahora = new Date()

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(
        ahora.getFullYear(),
        ahora.getMonth() - i,
        1
      )

      meses.push({
        anio: fecha.getFullYear(),
        mes: fecha.getMonth(),
        nombre: fecha.toLocaleString('es-ES', {
          month: 'short'
        }),
        total: 0,
        pedidos: 0
      })
    }

    pedidosValidos.forEach(pedido => {
      const fechaPedido = new Date(pedido.created_at)

      const mesEncontrado = meses.find(
        item =>
          item.anio === fechaPedido.getFullYear() &&
          item.mes === fechaPedido.getMonth()
      )

      if (mesEncontrado) {
        mesEncontrado.total += Number(pedido.total)
        mesEncontrado.pedidos++
      }
    })

    const ventasPorMes = meses.map(item => ({
      nombre: item.nombre,
      total: Number(item.total.toFixed(2)),
      pedidos: item.pedidos
    }))

    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.json({
      data: {
        productos: totalProductos,
        categorias: totalCategorias,
        clientes: totalClientes,
        pedidos: totalPedidos,

        inventario: {
          unidades: unidadesInventario,
          sinStock: productosSinStock,
          stockBajo: productosStockBajo
        },

        ventasTotales: Number(
          ventasTotales.toFixed(2)
        ),

        ventasMesActual: Number(
  ventasMesActual.toFixed(2)
),

        ticketPromedio: Number(
          ticketPromedio.toFixed(2)
        ),

        pedidosPorEstado,

        productoMasVendido,

        topProductos,

        ventasPorMes
      }
    })
  } catch (error) {
    console.error(
      'Error al obtener estadísticas:',
      error
    )

    return res.status(500).json({
      message: 'Error al obtener las estadísticas'
    })
  }
}