import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { formatMoney } from '../utils/helpers'
import { getCartItemImage, getCartItemPrice, normalizeCartItems } from '../utils/cart'

export default function CartDrawer({
  open,
  items,
  mode,
  notice,
  error,
  busy,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGoCheckout,
  onGoCart,
}) {
  const cartItems = normalizeCartItems(items)
  const subtotal = cartItems.reduce((sum, item) => sum + getCartItemPrice(item) * Number(item.quantity || 0), 0)

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: 'cart-dialog-paper cart-side-sheet' }}
    >
      <Box className="cart-drawer">
        <Box className="cart-heading">
          <Box>
            <Chip className="scarlet-chip" label={mode === 'account' ? 'Giỏ hàng tài khoản' : 'Giỏ hàng khách'} />
            <Typography component="h2">Giỏ hàng</Typography>
            <Typography>
              {mode === 'account'
                ? 'Đã lưu vào tài khoản AEROTEC của bạn.'
                : 'Đã lưu trên trình duyệt này cho đến khi bạn đăng nhập hoặc xóa.'}
            </Typography>
          </Box>
          <IconButton className="dialog-close inline" onClick={onClose} aria-label="Đóng giỏ hàng">
            <CloseIcon />
          </IconButton>
        </Box>

        {notice && <Typography className="cart-message success">{notice}</Typography>}
        {error && <Typography className="cart-message error">{error}</Typography>}
        {busy && <Typography className="cart-message info">Đang đồng bộ giỏ hàng...</Typography>}

        {cartItems.length === 0 ? (
          <Box className="cart-empty">
            <ShoppingCartIcon />
            <strong>Giỏ hàng trống</strong>
            <span>Thêm phụ tùng từ danh mục để bắt đầu thanh toán.</span>
          </Box>
        ) : (
          <Box className="cart-items">
            {cartItems.map((item) => (
              <Box className="cart-item" key={item.id || `${item.productId}-${item.selectedColor || ''}-${item.selectedSize || ''}`}>
                <div className="cart-item-image">
                  {getCartItemImage(item) ? <img src={getCartItemImage(item)} alt={item.name} /> : <ShoppingCartIcon />}
                </div>
                <Box className="cart-item-copy">
                  <Typography component="h3" style={{ fontSize: '15px', fontWeight: 900 }}>{item.name}</Typography>
                  <Typography style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(248, 250, 252, 0.45)', margin: '2px 0 6px' }}>
                    SKU: {item.sku || `AT-PART-${item.productId || item.id}`} // {item.brand || 'AEROTEC'}
                  </Typography>
                  <Typography style={{ fontSize: '11px', color: 'rgba(248, 250, 252, 0.55)' }}>
                    {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') || 'Cấu hình đường đua tiêu chuẩn'}
                  </Typography>
                  <strong style={{ color: '#fb7185', fontSize: '14px', fontWeight: 950, display: 'block', marginTop: '6px' }}>
                    {formatMoney(getCartItemPrice(item))}
                  </strong>
                  {item.stock !== null && (
                    <Typography style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(248, 250, 252, 0.45)', marginTop: '4px' }}>
                      Còn {item.stock} sản phẩm
                    </Typography>
                  )}
                </Box>
                <Box className="quantity-stepper">
                  <IconButton
                     size="small"
                    disabled={busy}
                    onClick={() => onUpdateQuantity(item, Math.max(1, item.quantity - 1))}
                    aria-label="Giảm số lượng"
                  >
                    <RemoveIcon />
                  </IconButton>
                  <span>{item.quantity}</span>
                  <IconButton
                    size="small"
                    disabled={busy || (item.stock !== null && Number(item.quantity || 0) >= Number(item.stock))}
                    onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                    aria-label="Tăng số lượng"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <IconButton className="remove-cart-item" disabled={busy} onClick={() => onRemoveItem(item)} aria-label="Xóa sản phẩm">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Box className="cart-summary">
          <Box>
            <span>Tổng tiền hàng</span>
            <strong>{formatMoney(subtotal)}</strong>
          </Box>
          <Button className="pulse-button" disabled={busy || cartItems.length === 0} onClick={onGoCheckout}>
            Thanh toán
          </Button>
          {onGoCart && (
            <Button className="outline-button" disabled={busy} onClick={onGoCart}>
              Xem giỏ hàng
            </Button>
          )}
          <Button className="outline-button" disabled={busy || cartItems.length === 0} onClick={onClearCart}>
            Xóa giỏ hàng
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
