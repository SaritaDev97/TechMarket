import jwt from 'jsonwebtoken'

export function verificarToken(req, res, next) {
  try {
    const authorization = req.headers.authorization

    if (!authorization) {
      return res.status(401).json({
        message: 'Token no proporcionado'
      })
    }

    const [tipo, token] = authorization.split(' ')

    if (tipo !== 'Bearer' || !token) {
      return res.status(401).json({
        message: 'Token inválido'
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.usuario = decoded

    next()
  } catch {
    return res.status(401).json({
      message: 'Token inválido o expirado'
    })
  }
}

// ======================================================
// PERMITIR SOLO ADMINISTRADORES
// ======================================================
export function soloAdmin(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      message: 'Usuario no autenticado'
    })
  }

  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      message: 'Acceso permitido únicamente para administradores'
    })
  }

  next()
}