import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma.js'

// ======================================================
// LISTAR / BUSCAR CLIENTES
// GET /api/clientes
// ======================================================
export async function getClientes(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    )

    const buscar = String(req.query.buscar || '').trim()

    const where = {
      rol: 'CLIENTE',
      ...(buscar
        ? {
            OR: [
              {
                nombre: {
                  contains: buscar,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: buscar,
                  mode: 'insensitive'
                }
              },
              {
                telefono: {
                  contains: buscar,
                  mode: 'insensitive'
                }
              }
            ]
          }
        : {})
    }

    const [clientes, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          telefono: true,
          direccion: true,
          email: true,
          rol: true,
          activo: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          id: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),

      prisma.usuario.count({
        where
      })
    ])

    return res.json({
      data: clientes,
      total,
      page,
      limit
    })
  } catch (error) {
    console.error('Error al obtener clientes:', error)

    return res.status(500).json({
      message: 'Error al cargar clientes'
    })
  }
}

// ======================================================
// OBTENER UN CLIENTE
// GET /api/clientes/:id
// ======================================================
export async function getCliente(req, res) {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID de cliente inválido'
      })
    }

    const cliente = await prisma.usuario.findFirst({
      where: {
        id,
        rol: 'CLIENTE'
      },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        direccion: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!cliente) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      })
    }

    return res.json({
      data: cliente
    })
  } catch (error) {
    console.error('Error al obtener cliente:', error)

    return res.status(500).json({
      message: 'Error al obtener el cliente'
    })
  }
}

// ======================================================
// CREAR CLIENTE DESDE EL PANEL ADMIN
// POST /api/clientes
// ======================================================
export async function createCliente(req, res) {
  try {
    const {
      nombre,
      telefono,
      direccion,
      email,
      password
    } = req.body

    if (!nombre?.trim()) {
      return res.status(400).json({
        message: 'El nombre es obligatorio'
      })
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: 'El correo electrónico es obligatorio'
      })
    }

    if (!password) {
      return res.status(400).json({
        message: 'La contraseña temporal es obligatoria'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres'
      })
    }

    const emailLimpio = email.trim().toLowerCase()

    const existente = await prisma.usuario.findUnique({
      where: {
        email: emailLimpio
      }
    })

    if (existente) {
      return res.status(409).json({
        message: 'Ya existe una cuenta con este correo'
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const cliente = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        telefono: telefono?.trim() || null,
        direccion: direccion?.trim() || null,
        email: emailLimpio,
        password: passwordHash,
        rol: 'CLIENTE',
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        direccion: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return res.status(201).json({
      message: 'Cliente creado correctamente',
      data: cliente
    })
  } catch (error) {
    console.error('Error al crear cliente:', error)

    return res.status(500).json({
      message: 'Error al crear el cliente'
    })
  }
}

// ======================================================
// ACTUALIZAR CLIENTE
// PUT /api/clientes/:id
// ======================================================
export async function updateCliente(req, res) {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID de cliente inválido'
      })
    }

    const clienteExistente = await prisma.usuario.findFirst({
      where: {
        id,
        rol: 'CLIENTE'
      }
    })

    if (!clienteExistente) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      })
    }

    const {
      nombre,
      telefono,
      direccion,
      email
    } = req.body

    const data = {}

    if (nombre !== undefined) {
      const nombreLimpio = String(nombre).trim()

      if (!nombreLimpio) {
        return res.status(400).json({
          message: 'El nombre no puede estar vacío'
        })
      }

      data.nombre = nombreLimpio
    }

    if (telefono !== undefined) {
      data.telefono = String(telefono).trim() || null
    }

    if (direccion !== undefined) {
      data.direccion = String(direccion).trim() || null
    }

    if (email !== undefined) {
      const emailLimpio = String(email).trim().toLowerCase()

      if (!emailLimpio) {
        return res.status(400).json({
          message: 'El correo no puede estar vacío'
        })
      }

      const emailExistente = await prisma.usuario.findFirst({
        where: {
          email: emailLimpio,
          NOT: {
            id
          }
        }
      })

      if (emailExistente) {
        return res.status(409).json({
          message: 'Ya existe una cuenta con este correo'
        })
      }

      data.email = emailLimpio
    }

    const cliente = await prisma.usuario.update({
      where: {
        id
      },
      data,
      select: {
        id: true,
        nombre: true,
        telefono: true,
        direccion: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return res.json({
      message: 'Cliente actualizado correctamente',
      data: cliente
    })
  } catch (error) {
    console.error('Error al actualizar cliente:', error)

    return res.status(500).json({
      message: 'Error al actualizar el cliente'
    })
  }
}

// ======================================================
// ELIMINAR CLIENTE
// DELETE /api/clientes/:id
// ======================================================
export async function deleteCliente(req, res) {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'ID de cliente inválido'
      })
    }

    const cliente = await prisma.usuario.findFirst({
      where: {
        id,
        rol: 'CLIENTE'
      }
    })

    if (!cliente) {
      return res.status(404).json({
        message: 'Cliente no encontrado'
      })
    }

    // Si tiene pedidos, conservar el registro para no romper
    // el historial y simplemente desactivar la cuenta.
    const pedidos = await prisma.pedido.count({
      where: {
        usuario_id: id
      }
    })

    if (pedidos > 0) {
      const clienteDesactivado = await prisma.usuario.update({
        where: {
          id
        },
        data: {
          activo: false
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          activo: true
        }
      })

      return res.json({
        message: 'Cliente desactivado porque posee pedidos registrados',
        data: clienteDesactivado
      })
    }

    await prisma.usuario.delete({
      where: {
        id
      }
    })

    return res.json({
      message: 'Cliente eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)

    return res.status(500).json({
      message: 'Error al eliminar el cliente'
    })
  }
}