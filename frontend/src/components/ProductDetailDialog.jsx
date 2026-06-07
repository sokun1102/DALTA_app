import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'

export default function ProductDetailDialog({ product, relatedCars, loading, onClose, onOpenProduct, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    setQuantity(1)
    setSelectedColor(product?.colorName || '')
    setSelectedSize(product?.size || '')
  }, [product?.id])

  return (
    <Dialog
      open={Boolean(product)}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ className: 'product-dialog-paper' }}
    >
      {product && (
        <DialogContent className="product-dialog">
          <IconButton className="dialog-close" onClick={onClose} aria-label="Close product detail">
            <CloseIcon />
          </IconButton>

          <Box className="detail-hero">
            <div className="card-glow" style={{ '--card-color': product.color }} />
            <div className="detail-image-shell">
              {product.image ? (
                <img className="detail-image" src={product.image} alt={product.name} />
              ) : (
                <div className="mini-car">
                  <span className="mini-body" />
                  <span className="mini-wheel left" />
                  <span className="mini-wheel right" />
                </div>
              )}
            </div>
            <Box className="detail-copy">
              <Chip className="scarlet-chip" label={product.brand} />
              <Typography component="h2" className="detail-title">
                {product.name}
              </Typography>
              <Typography className="detail-description">
                {product.description || 'Sản phẩm hiệu năng cao với dữ liệu giá, tồn kho và thông số kỹ thuật trực tiếp từ dịch vụ sản phẩm.'}
              </Typography>
              <Box className="detail-actions">
                <Box className="detail-purchase-controls">
                  <label>
                     <span>Số lượng</span>
                    <input
                      min="1"
                      max={Math.max(product.stock || 1, 1)}
                      type="number"
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
                    />
                  </label>
                  <label>
                    <span>Màu sắc</span>
                    <input
                      value={selectedColor}
                      onChange={(event) => setSelectedColor(event.target.value)}
                      placeholder="Mặc định"
                    />
                  </label>
                  <label>
                    <span>Cấu hình</span>
                    <input
                      value={selectedSize}
                      onChange={(event) => setSelectedSize(event.target.value)}
                      placeholder="Mặc định"
                    />
                  </label>
                </Box>
                <Button
                  className="pulse-button"
                  onClick={() =>
                    onAddToCart(product, {
                      quantity,
                      color: selectedColor,
                      size: selectedSize,
                    })
                  }
                >
                  Thêm vào giỏ
                </Button>
                <Button className="outline-button">So sánh</Button>
              </Box>
            </Box>
          </Box>

          <Box className="detail-spec-grid">
            {[
              ['Giá', product.price],
              ['Tồn kho', `${product.stock} có sẵn`],
              ['Đánh giá', `${product.rating || '-'} / 5`],
              ['Mã SKU', product.sku || 'Chưa thiết lập'],
              ['Công suất', product.power],
              ['Gia tốc 0-100', product.zero],
              ['Tốc độ tối đa', product.topSpeed || 'Chưa thiết lập'],
              ['Hệ dẫn động', product.drivetrain],
              ['Nhiên liệu', product.fuel],
              ['Khung thân', product.body],
              ['Màu sắc', product.colorName || 'Chưa thiết lập'],
              ['Phân loại', product.categoryName || 'Chưa thiết lập'],
            ].map(([label, value]) => (
              <Box className="detail-spec" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </Box>
            ))}
          </Box>

          <Box className="related-block">
            <Box className="related-heading">
              <Typography component="h3">Sản phẩm liên quan</Typography>
              <Typography>{loading ? 'Đang tải gợi ý...' : `${relatedCars.length} gợi ý`}</Typography>
            </Box>
            {relatedCars.length > 0 ? (
              <Box className="related-grid">
                {relatedCars.map((car) => (
                  <button className="related-card" type="button" key={car.id || car.name} onClick={() => onOpenProduct(car)}>
                    <img src={car.image} alt={car.name} />
                    <span>{car.type}</span>
                    <strong>{car.name}</strong>
                    <em>{car.price}</em>
                  </button>
                ))}
              </Box>
            ) : (
              <Typography className="inventory-note">Không tìm thấy sản phẩm liên quan.</Typography>
            )}
          </Box>
        </DialogContent>
      )}
    </Dialog>
  )
}
