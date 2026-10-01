import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.resolve(
  'uploads',
  'categorias'
)

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase()

    const nombreArchivo =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`

    cb(null, nombreArchivo)
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

const uploadCategoria = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

export default uploadCategoria