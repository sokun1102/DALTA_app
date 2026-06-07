export function formatCarPrice(product) {
  const displayPrice = product?.specifications?.displayPrice
  if (displayPrice) return displayPrice

  const price = Number(product?.price)
  if (!Number.isFinite(price)) return 'Liên hệ'

  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)}B VND`
  }

  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M VND`
  }

  return `${new Intl.NumberFormat('vi-VN').format(price)} VND`
}

export function getPrimaryImage(product) {
  return product?.images?.find((image) => image.isPrimary)?.url || product?.images?.[0]?.url || ''
}

export function formatMoney(value) {
  const price = Number(value)
  if (!Number.isFinite(price)) return 'Liên hệ'

  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)}B VND`
  }

  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M VND`
  }

  return `${new Intl.NumberFormat('vi-VN').format(price)} VND`
}

export function mapProductToCar(product) {
  const specs = product.specifications || {}

  return {
    id: product.id,
    name: product.name,
    type: specs.type || product.size || product.category?.name || 'Phụ tùng hiệu năng',
    price: formatCarPrice(product),
    numericPrice: Number(product.price || 0),
    brand: product.brand || product.brandEntity?.name || 'AEROTEC',
    sku: product.sku || '',
    description: product.description || '',
    material: specs.material || 'Vật liệu motorsport cao cấp',
    weightReduction: specs.weightReduction || product.weight || 'N/A',
    gain: specs.gain || 'Nâng cấp hiệu năng',
    power: specs.power || specs.gain || product.weight || 'Nâng cấp hiệu năng',
    zero: specs.fitment || 'Fitment theo dòng xe',
    topSpeed: specs.topSpeed || '',
    drivetrain: specs.fitment || 'Fitment xe hiệu năng',
    fuel: specs.warranty || 'Có bảo hành',
    body: specs.type || product.category?.name || 'Phụ tùng xe',
    color: specs.accent || '#e11d48',
    colorName: product.color || '',
    size: product.size || '',
    stock: Number(product.stock || 0),
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    soldCount: Number(product.soldCount || 0),
    categoryId: product.categoryId || product.category?.id || '',
    categoryName: product.category?.name || '',
    specifications: specs,
    image: getPrimaryImage(product),
  }
}
