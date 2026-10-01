// GET /api/externa/tipo-cambio
export async function getTipoCambio(req, res) {
  try {
    const moneda = String(req.query.moneda || 'EUR').toUpperCase()

    // Solo permitimos códigos de moneda simples, por ejemplo EUR, MXN, GTQ
    if (!/^[A-Z]{3}$/.test(moneda)) {
      return res.status(400).json({
        message: 'Código de moneda inválido'
      })
    }

    const url = `https://open.er-api.com/v6/latest/USD`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API externa respondió con estado ${response.status}`)
    }

    const resultado = await response.json()

    const tasa = resultado?.rates?.[moneda]

    if (!tasa) {
      return res.status(404).json({
        message: `No se encontró el tipo de cambio para ${moneda}`
      })
    }

    return res.json({
      data: {
        monedaBase: 'USD',
        monedaDestino: moneda,
        tasa,
        ejemplo: {
          usd: 1,
          convertido: Number(tasa.toFixed(4))
        },
        ultimaActualizacion:
          resultado.time_last_update_utc || null
      },
      fuente: 'ExchangeRate-API'
    })
  } catch (error) {
    console.error('Error al consultar API externa:', error)

    return res.status(502).json({
      message: 'No se pudo consultar el servicio externo de tipo de cambio'
    })
  }
}


// GET /api/externa/productos
// Catálogo tecnológico externo únicamente para visualización
export async function getProductosExternos(req, res) {
  try {
    const response = await fetch(
      'https://dummyjson.com/products/category/laptops?limit=20'
    )

    if (!response.ok) {
      throw new Error(
        `API externa respondió con estado ${response.status}`
      )
    }

    const resultado = await response.json()

    const productos = (resultado.products || []).map(producto => ({
      id: producto.id,
      nombre: producto.title,
      descripcion: producto.description,
      precio: producto.price,
      marca: producto.brand || 'Sin marca',
      categoria: producto.category,
      imagen: producto.thumbnail,
      imagenes: producto.images || [],
      rating: producto.rating,
      stock: producto.stock,
      fuente: 'DummyJSON',
      externo: true
    }))

    return res.json({
      data: productos,
      total: productos.length,
      fuente: 'DummyJSON',
      soloVisualizacion: true
    })

  } catch (error) {
    console.error(
      'Error al consultar catálogo externo:',
      error
    )

    return res.status(502).json({
      message:
        'No se pudo consultar el catálogo externo'
    })
  }
}