import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.resolve('uploads/productos')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
    const nombre = `${Date.now()}-${Math.round(
      Math.random() * 1E9
    )}${extension}`

    cb(null, nombre)
  }
})

const fileFilter = (req, file, cb) => {
  const permitidos = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  if (permitidos.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Solo se permiten imágenes JPG, PNG o WEBP'
      ),
      false
    )
  }
}

const uploadProducto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

export default uploadProducto