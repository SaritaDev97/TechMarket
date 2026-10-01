import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductModal from './ProductModal'

function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const navigate = useNavigate()

  const inWishlist = isInWishlist(product.id)
  const [showModal, setShowModal] = useState(false)

  const nombre = product.nombre || product.name || ''
  const imagen = product.imagen || product.img || ''
  const marca = product.marca || product.brand || ''

  const precio = parseFloat(
    product.precio_venta || product.price || 0
  )

  const anterior = parseFloat(
  product.precio_anterior || product.oldPrice || 0
)

// Calcular porcentaje de descuento automáticamente
const tieneDescuento =
  anterior > precio && precio > 0

const porcentajeDescuento = tieneDescuento
  ? Math.round(((anterior - precio) / anterior) * 100)
  : 0

const enStock =
    product.stock !== undefined
      ? product.stock > 0
      : product.inStock ?? true

  // Ir al detalle del producto
  const comprarAhora = () => {
    if (!product.id) return

    navigate(`/cliente/producto/${product.id}`)
  }

  return (
    <>
      <div className="product-card">

        {/* Imagen */}
        <div
          className="product-card__image"
          onClick={() => setShowModal(true)}
          style={{
  cursor: 'pointer',
  position: 'relative'
}}
        >
          {imagen ? (
            <img
              src={imagen}
              alt={nombre}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                background: '#f4f6fb'
              }}
            >
              📦
            </div>
          )}
{/* Etiqueta de descuento */}
{tieneDescuento && (
  <div
    style={{
      position: 'absolute',
      top: '10px',
      right: '52px',
      zIndex: 2,
      background: '#dc2626',
      color: '#fff',
      fontSize: '0.75rem',
      fontWeight: 800,
      padding: '0.35rem 0.55rem',
      borderRadius: '7px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
    }}
  >
    -{porcentajeDescuento}%
  </div>
)}

          {product.badge && (
            <div className="product-card__badge">
              {product.badge}
            </div>
          )}

          {/* Favoritos */}
          <button
            className={`product-card__fav ${
              inWishlist ? 'active' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation()
              toggleWishlist(product)
            }}
            aria-label="Agregar a favoritos"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill={inWishlist ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Información */}
        <div className="product-card__body">

          {marca && (
            <p className="product-card__brand">
              {marca}
            </p>
          )}

          <p
            className="product-card__name"
            onClick={() => setShowModal(true)}
            style={{ cursor: 'pointer' }}
          >
            {nombre}
          </p>

          {/* Precio */}
          {/* Precio */}
<div className="product-card__price">

  {tieneDescuento && (
    <p
      className="product-card__old-price"
      style={{
        textDecoration: 'line-through',
        color: '#9ca3af',
        fontSize: '0.85rem',
        marginBottom: '0.25rem'
      }}
    >
      ${anterior.toFixed(2)}
    </p>
  )}

  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      flexWrap: 'wrap'
    }}
  >
    <p className="product-card__current-price">
      ${precio.toFixed(2)}
    </p>

    {tieneDescuento && (
      <span
        style={{
          background: '#dcfce7',
          color: '#15803d',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.25rem 0.5rem',
          borderRadius: '6px',
          whiteSpace: 'nowrap'
        }}
      >
        {porcentajeDescuento}% OFF
      </span>
    )}

  </div>

</div>

          {/* Stock */}
          <p
            className={`product-card__stock ${
              enStock
                ? 'product-card__stock--in'
                : 'product-card__stock--out'
            }`}
          >
            {enStock ? 'En stock' : 'Agotado'}
          </p>

          {/* Botones */}
          <div className="product-card__actions">

            <button
              className="btn-cart"
              onClick={() => addToCart(product)}
              disabled={!enStock}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              Agregar al carrito
            </button>

            <button
              className="btn-buy"
              onClick={comprarAhora}
              disabled={!enStock}
            >
              Comprar ahora
            </button>

          </div>
        </div>
      </div>

      {/* Vista rápida */}
      {showModal && (
        <ProductModal
          product={product}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default ProductCard