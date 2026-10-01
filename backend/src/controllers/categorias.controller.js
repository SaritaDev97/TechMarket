import prisma from '../utils/prisma.js'

// GET /api/categorias
export async function getCategorias(req, res) {
  try {
    const categorias = await prisma.categoria.findMany({
  orderBy: {
    nombre: 'asc'
  }
})

    return res.json({
      data: categorias
    })
  } catch (error) {
    console.error('Error al obtener categorías:', error)

    return res.status(500).json({
      message: 'Error al obtener las categorías'
    })
  }
}


// GET /api/categorias/:id
export async function getCategoriaById(req, res) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: 'ID de categoría inválido'
      })
    }

    const categoria = await prisma.categoria.findFirst({
      where: {
        id,
        activo: true
      }
    })

    if (!categoria) {
      return res.status(404).json({
        message: 'Categoría no encontrada'
      })
    }

    return res.json({
      data: categoria
    })
  } catch (error) {
    console.error('Error al obtener categoría:', error)

    return res.status(500).json({
      message: 'Error al obtener la categoría'
    })
  }
}

// POST /api/categorias
export async function createCategoria(req, res) {
  try {
    const { nombre, descripcion } = req.body

    if (!nombre?.trim()) {
      return res.status(400).json({
        message: 'El nombre de la categoría es requerido'
      })
    }

    // Revisar si ya existe una categoría con el mismo nombre
    const existente = await prisma.categoria.findFirst({
      where: {
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive'
        }
      }
    })

    if (existente) {
      return res.status(409).json({
        message: 'Ya existe una categoría con ese nombre'
      })
    }

    const imagenCategoria = req.file
  ? `/uploads/categorias/${req.file.filename}`
  : null

    const categoria = await prisma.categoria.create({
  data: {
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || null,
    imagen: imagenCategoria,
    activo: true
  }
})

    return res.status(201).json({
      message: 'Categoría creada correctamente',
      data: categoria
    })
  } catch (error) {
    console.error('Error al crear categoría:', error)

    return res.status(500).json({
      message: 'Error al crear la categoría'
    })
  }
}


// PUT /api/categorias/:id
export async function updateCategoria(req, res) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: 'ID de categoría inválido'
      })
    }

    const categoriaActual = await prisma.categoria.findUnique({
      where: { id }
    })

    if (!categoriaActual) {
      return res.status(404).json({
        message: 'Categoría no encontrada'
      })
    }

    const {
  nombre,
  descripcion,
  activo,
  imagen
} = req.body

    if (nombre !== undefined && !String(nombre).trim()) {
      return res.status(400).json({
        message: 'El nombre de la categoría es requerido'
      })
    }

    // Comprobar que el nuevo nombre no esté utilizado
    // por otra categoría.
    if (nombre !== undefined) {
      const existente = await prisma.categoria.findFirst({
        where: {
          nombre: {
            equals: String(nombre).trim(),
            mode: 'insensitive'
          },
          NOT: {
            id
          }
        }
      })

      if (existente) {
        return res.status(409).json({
          message: 'Ya existe otra categoría con ese nombre'
        })
      }
    }

    const data = {}

    if (nombre !== undefined) {
      data.nombre = String(nombre).trim()
    }

    if (descripcion !== undefined) {
      data.descripcion = descripcion?.trim() || null
    }

    if (activo !== undefined) {
  data.activo =
    activo === true ||
    activo === 'true'
}

    if (req.file) {
  data.imagen =
    `/uploads/categorias/${req.file.filename}`
} else if (imagen !== undefined) {
  data.imagen =
    imagen?.trim() || null
}


    const categoria = await prisma.categoria.update({
      where: { id },
      data
    })

    return res.json({
      message: 'Categoría actualizada correctamente',
      data: categoria
    })
  } catch (error) {
    console.error('Error al actualizar categoría:', error)

    return res.status(500).json({
      message: 'Error al actualizar la categoría'
    })
  }
}


// DELETE /api/categorias/:id
export async function deleteCategoria(req, res) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: 'ID de categoría inválido'
      })
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id }
    })

    if (!categoria) {
      return res.status(404).json({
        message: 'Categoría no encontrada'
      })
    }

    // Desactivación lógica:
    // no borramos físicamente la categoría.
    const categoriaDesactivada = await prisma.categoria.update({
      where: { id },
      data: {
        activo: false
      }
    })

    return res.json({
      message: 'Categoría desactivada correctamente',
      data: categoriaDesactivada
    })
  } catch (error) {
    console.error('Error al desactivar categoría:', error)

    return res.status(500).json({
      message: 'Error al desactivar la categoría'
    })
  }
}