import prisma from '../utils/prisma.js'

// GET /api/productos
export async function getProductos(req, res) {
  try {
    const {
  buscar = '',
  categoria_id,
  marca,
  page = 1,
  limit = 12
} = req.query

    const pagina = Math.max(parseInt(page) || 1, 1)
    const limite = Math.max(parseInt(limit) || 12, 1)
    const skip = (pagina - 1) * limite

    const where = {
      activo: true
    }

    // Buscar por nombre, marca o descripción
    if (buscar.trim()) {
      where.OR = [
        {
          nombre: {
            contains: buscar.trim(),
            mode: 'insensitive'
          }
        },
        {
          marca: {
            contains: buscar.trim(),
            mode: 'insensitive'
          }
        },
        {
          descripcion: {
            contains: buscar.trim(),
            mode: 'insensitive'
          }
        }
      ]
    }

    // Filtrar por categoría
    if (categoria_id) {
      const categoriaId = Number(categoria_id)

      if (!Number.isNaN(categoriaId)) {
        where.categoria_id = categoriaId
      }
    }
    // Filtrar por marca
if (marca?.trim()) {
  where.marca = {
    equals: marca.trim(),
    mode: 'insensitive'
  }
}

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          categoria: true
        },
        orderBy: {
          id: 'desc'
        },
        skip,
        take: limite
      }),

      prisma.producto.count({
        where
      })
    ])

    // Adaptamos "categoria" a "categorias"
    // porque así lo espera actualmente tu frontend.
    const data = productos.map(producto => ({
      ...producto,
      categorias: producto.categoria,
      precio_venta: Number(producto.precio_venta),
      precio_anterior: producto.precio_anterior
        ? Number(producto.precio_anterior)
        : null
    }))

    return res.json({
      data,
      total,
      page: pagina,
      limit: limite,
      totalPages: Math.ceil(total / limite)
    })
  } catch (error) {
    console.error('Error al obtener productos:', error)

    return res.status(500).json({
      message: 'Error al obtener los productos'
    })
  }
}


// GET /api/productos/:id
export async function getProductoById(req, res) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: 'ID de producto inválido'
      })
    }

    const producto = await prisma.producto.findFirst({
      where: {
        id,
        activo: true
      },
      include: {
        categoria: true
      }
    })

    if (!producto) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }

    const data = {
      ...producto,
      categorias: producto.categoria,
      precio_venta: Number(producto.precio_venta),
      precio_anterior: producto.precio_anterior
        ? Number(producto.precio_anterior)
        : null
    }

    return res.json({
      data
    })
  } catch (error) {
    console.error('Error al obtener producto:', error)

    return res.status(500).json({
      message: 'Error al obtener el producto'
    })
  }
}

export async function getMarcas(req, res) {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true,
        marca: {
          not: null
        }
      },
      select: {
        marca: true
      },
      orderBy: {
        marca: 'asc'
      }
    })

    const marcas = [
      ...new Set(
        productos
          .map(producto => producto.marca?.trim())
          .filter(Boolean)
      )
    ]

    return res.json({
      data: marcas
    })
  } catch (error) {
    console.error('Error al obtener marcas:', error)

    return res.status(500).json({
      message: 'Error al obtener las marcas'
    })
  }
}

// POST /api/productos
export async function createProducto(req, res) {
  try {
    const {
      nombre,
      descripcion,
      marca,
      precio_venta,
      precio_anterior,
      stock,
      imagen,
      badge,
      categoria_id,
      activo
    } = req.body

    if (!nombre?.trim()) {
      return res.status(400).json({
        message: 'El nombre del producto es requerido'
      })
    }

    const precio = Number(precio_venta)

    if (Number.isNaN(precio) || precio < 0) {
      return res.status(400).json({
        message: 'El precio del producto es inválido'
      })
    }

    const stockProducto = Number(stock ?? 0)

    if (!Number.isInteger(stockProducto) || stockProducto < 0) {
      return res.status(400).json({
        message: 'El stock debe ser un número entero mayor o igual a 0'
      })
    }

    const categoriaId =
      categoria_id !== undefined &&
      categoria_id !== null &&
      categoria_id !== ''
        ? Number(categoria_id)
        : null

    if (categoriaId !== null && !Number.isInteger(categoriaId)) {
      return res.status(400).json({
        message: 'La categoría seleccionada es inválida'
      })
    }

    if (categoriaId !== null) {
      const categoria = await prisma.categoria.findUnique({
        where: {
          id: categoriaId
        }
      })

      if (!categoria) {
        return res.status(400).json({
          message: 'La categoría seleccionada no existe'
        })
      }
    }

    const imagenProducto = req.file
  ? `/uploads/productos/${req.file.filename}`
  : imagen?.trim() || null

    const producto = await prisma.producto.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        marca: marca?.trim() || null,
        precio_venta: precio,
        precio_anterior:
          precio_anterior !== undefined &&
          precio_anterior !== null &&
          precio_anterior !== ''
            ? Number(precio_anterior)
            : null,
        stock: stockProducto,
        imagen: imagenProducto,
        badge: badge?.trim() || null,
        activo: activo !== undefined ? Boolean(activo) : true,
        categoria_id: categoriaId
      },
      include: {
        categoria: true
      }
    })

    return res.status(201).json({
      message: 'Producto creado correctamente',
      data: {
        ...producto,
        categorias: producto.categoria,
        precio_venta: Number(producto.precio_venta),
        precio_anterior: producto.precio_anterior
          ? Number(producto.precio_anterior)
          : null
      }
    })
  } catch (error) {
    console.error('Error al crear producto:', error)

    return res.status(500).json({
      message: 'Error al crear el producto'
    })
  }
}


// PUT /api/productos/:id
export async function updateProducto(req, res) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: 'ID de producto inválido'
      })
    }

    const existente = await prisma.producto.findUnique({
      where: { id }
    })

    if (!existente) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }

    const {
      nombre,
      descripcion,
      marca,
      precio_venta,
      precio_anterior,
      stock,
      imagen,
      badge,
      categoria_id,
      activo
    } = req.body

    const data = {}

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({
          message: 'El nombre del producto es requerido'
        })
      }

      data.nombre = String(nombre).trim()
    }

    if (descripcion !== undefined) {
      data.descripcion = descripcion?.trim() || null
    }

    if (marca !== undefined) {
      data.marca = marca?.trim() || null
    }

    if (precio_venta !== undefined) {
      const precio = Number(precio_venta)

      if (Number.isNaN(precio) || precio < 0) {
        return res.status(400).json({
          message: 'El precio del producto es inválido'
        })
      }

      data.precio_venta = precio
    }

    if (precio_anterior !== undefined) {
      data.precio_anterior =
        precio_anterior === '' || precio_anterior === null
          ? null
          : Number(precio_anterior)
    }

    if (stock !== undefined) {
      const stockProducto = Number(stock)

      if (!Number.isInteger(stockProducto) || stockProducto < 0) {
        return res.status(400).json({
          message: 'El stock debe ser un número entero mayor o igual a 0'
        })
      }

      data.stock = stockProducto
    }

    if (req.file) {
  data.imagen = `/uploads/productos/${req.file.filename}`
} else if (imagen !== undefined) {
  data.imagen = imagen?.trim() || null
}

    if (badge !== undefined) {
      data.badge = badge?.trim() || null
    }

    if (activo !== undefined) {
      data.activo = Boolean(activo)
    }

    if (categoria_id !== undefined) {
      if (
        categoria_id === '' ||
        categoria_id === null
      ) {
        data.categoria_id = null
      } else {
        const categoriaId = Number(categoria_id)

        if (!Number.isInteger(categoriaId)) {
          return res.status(400).json({
            message: 'La categoría seleccionada es inválida'
          })
        }

        const categoria = await prisma.categoria.findUnique({
          where: {
            id: categoriaId
          }
        })

        if (!categoria) {
          return res.status(400).json({
            message: 'La categoría seleccionada no existe'
          })
        }

        data.categoria_id = categoriaId
      }
    }

    const producto = await prisma.producto.update({
      where: { id },
      data,
      include: {
        categoria: true
      }
    })

    return res.json({
      message: 'Producto actualizado correctamente',
      data: {
        ...producto,
        categorias: producto.categoria,
        precio_venta: Number(producto.precio_venta),
        precio_anterior: producto.precio_anterior
          ? Number(producto.precio_anterior)
          : null
      }
    })
  } catch (error) {
    console.error('Error al actualizar producto:', error)

    return res.status(500).json({
      message: 'Error al actualizar el producto'
    })
  }
}


// DELETE /api/productos/:id
export async function deleteProducto(req, res) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: 'ID de producto inválido'
      })
    }

    const producto = await prisma.producto.findUnique({
      where: { id }
    })

    if (!producto) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      })
    }

    // Eliminación lógica para no romper pedidos,
    // favoritos u otras relaciones existentes.
    await prisma.producto.update({
      where: { id },
      data: {
        activo: false
      }
    })

    return res.json({
      message: 'Producto eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar producto:', error)

    return res.status(500).json({
      message: 'Error al eliminar el producto'
    })
  }
}