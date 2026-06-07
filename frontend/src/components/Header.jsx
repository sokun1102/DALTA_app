import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ArticleIcon from '@mui/icons-material/Article'
import BuildIcon from '@mui/icons-material/Build'
import CloseIcon from '@mui/icons-material/Close'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HomeIcon from '@mui/icons-material/Home'
import InfoIcon from '@mui/icons-material/Info'
import HelpIcon from '@mui/icons-material/Help'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import MemoryIcon from '@mui/icons-material/Memory'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CartDrawer from './CartDrawer'
import { useCart } from '../hooks/useCart'
import { apiFetch } from '../services/apiClient'

const primaryNavItems = [
  { id: 'home', label: 'Trang Chủ' },
  { id: 'parts', label: 'Phụ Tùng' },
  { id: 'showroom', label: 'Trưng Bày' },
  { id: 'tech', label: 'Công Nghệ' },
  { id: 'articles', label: 'Bài Viết' },
]

const shoppingItems = [
  { id: 'parts', label: 'Danh mục phụ tùng', icon: BuildIcon },
  { id: 'cart', label: 'Giỏ hàng', icon: ShoppingCartIcon },
  { id: 'showroom', label: 'Trưng bày', icon: DirectionsCarIcon },
]

const accountItems = [
  { id: 'profile', label: 'Tài khoản của tôi', icon: AccountCircleIcon },
  { id: 'orders', label: 'Đơn hàng', icon: ReceiptLongIcon },
  { id: 'wishlist', label: 'Yêu thích', icon: FavoriteIcon },
]

const adminItems = [
  { id: 'admin', label: 'Quản trị', icon: AdminPanelSettingsIcon },
]

const informationItems = [
  { id: 'home', label: 'Trang chủ', icon: HomeIcon },
  { id: 'tech', label: 'Công nghệ', icon: MemoryIcon },
  { id: 'articles', label: 'Bài viết', icon: ArticleIcon },
  { id: 'about', label: 'Giới thiệu', icon: InfoIcon },
  { id: 'contact', label: 'Liên hệ hỗ trợ', icon: HelpIcon },
]

export default function Header({
  user,
  activeTab,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onLogout,
  cartCount,
  onCartClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const {
    cartOpen,
    setCartOpen,
    cartItems,
    cartMode,
    cartCount: liveCartCount,
    cartNotice,
    cartError,
    cartBusy,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    loadCart,
  } = useCart({ user })
  const displayCartCount = cartCount ?? liveCartCount
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return
    try {
      const data = await apiFetch('/settings/notifications', { auth: true })
      if (Array.isArray(data)) {
        setNotifications(data)
      }
    } catch (err) {
      console.warn('Lỗi khi tải thông báo:', err.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 20000) // Poll every 20s
      return () => clearInterval(interval)
    } else {
      setNotifications([])
    }
  }, [user])

  // Handle outside click to close notification panel
  useEffect(() => {
    if (!notificationsOpen) return
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.notifications-dropdown-panel') && !e.target.closest('.bell-btn')) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [notificationsOpen])

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/settings/notifications/read-all', { method: 'POST', auth: true })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.warn('Lỗi khi đọc tất cả thông báo:', err.message)
    }
  }

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await apiFetch(`/settings/notifications/${notif.id}/read`, { method: 'POST', auth: true })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
      }
      setNotificationsOpen(false)
      onNavigate('orders')
    } catch (err) {
      console.warn('Lỗi khi đọc thông báo:', err.message)
    }
  }

  const closeMenu = () => setMenuOpen(false)

  const handleNavClick = (event, tab) => {
    event.preventDefault()
    onNavigate(tab)
  }

  const handleMenuNavigate = (target) => {
    closeMenu()
    if (target === 'profile') {
      if (user) {
        onOpenProfile()
      } else {
        onOpenLogin()
      }
      return
    }
    if (target === 'cart') {
      openCartPreview()
      return
    }
    onNavigate(target)
  }

  const openCartPreview = () => {
    loadCart()
    setCartOpen(true)
  }

  const renderMenuItems = (items) => (
    <List disablePadding className="menu-list">
      {items.map((item) => {
        const Icon = item.icon
        const active = activeTab === item.id || (item.id === 'profile' && activeTab === 'profile')
        return (
          <ListItemButton
            key={item.id}
            className={active ? 'menu-item active' : 'menu-item'}
            onClick={() => handleMenuNavigate(item.id)}
          >
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        )
      })}
    </List>
  )

  return (
    <Box className="topbar">
      <Container maxWidth="xl" className="nav-inner">
        <Box
          className="brand-mark"
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 'auto', cursor: 'pointer' }}
          onClick={() => onNavigate('home')}
        >
          <span style={{ fontSize: 24, fontWeight: 950, letterSpacing: '1.5px', color: '#fff', lineHeight: 1 }}>
            AEROTEC
          </span>
          <small style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', fontWeight: 800, color: '#fb7185', letterSpacing: '1px', marginTop: '4px' }}>
            EST. 2026 // SEOUL
          </small>
        </Box>

        <Box className="nav-links">
          <Box className="nav-capsule">
            {primaryNavItems.map((item) => (
              <a
                href="#"
                key={item.id}
                className={activeTab === item.id ? 'active' : ''}
                onClick={(event) => handleNavClick(event, item.id)}
              >
                {item.label}
              </a>
            ))}
          </Box>
        </Box>

        <Box className="nav-actions">
          {!user && (
            <Button className="header-login-button" startIcon={<LoginIcon />} onClick={onOpenLogin}>
              Đăng nhập
            </Button>
          )}

          {/* User Notification Bell */}
          {user && (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Tooltip title="Thông báo">
                <IconButton
                  className="icon-button bell-btn"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  sx={{
                    color: notificationsOpen ? '#fb7185' : 'inherit',
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {notificationsOpen && (
                <Box
                  className="notifications-dropdown-panel"
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '360px',
                    maxHeight: '440px',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(251, 113, 133, 0.25)', // Aerotec glowing rose border
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9), 0 0 15px rgba(251, 113, 133, 0.08)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 1200,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Dropdown Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: 'rgba(20, 20, 20, 0.6)',
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: '11px', color: '#fff', fontFamily: 'JetBrains Mono', letterSpacing: '1px' }}>
                      THÔNG BÁO ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        onClick={handleMarkAllRead}
                        sx={{
                          fontSize: '10px',
                          color: '#fb7185',
                          textTransform: 'uppercase',
                          fontWeight: 900,
                          fontFamily: 'JetBrains Mono',
                          letterSpacing: '0.5px',
                          minWidth: 0,
                          padding: '2px 6px',
                          '&:hover': { backgroundColor: 'rgba(251, 113, 133, 0.1)' },
                        }}
                      >
                        Đọc tất cả
                      </Button>
                    )}
                  </Box>

                  {/* Dropdown Body */}
                  <Box
                    sx={{
                      overflowY: 'auto',
                      flex: 1,
                      maxHeight: '340px',
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '2px' },
                    }}
                  >
                    {notifications.length === 0 ? (
                      <Box sx={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Plus Jakarta Sans' }}>
                        Không có thông báo nào.
                      </Box>
                    ) : (
                      notifications.map((notif) => (
                        <Box
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          sx={{
                            padding: '14px 16px 14px 24px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: notif.isRead ? 'transparent' : 'rgba(251, 113, 133, 0.03)',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            },
                          }}
                        >
                          {!notif.isRead && (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: '10px',
                                top: '20px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#fb7185',
                                boxShadow: '0 0 8px #fb7185',
                              }}
                            />
                          )}
                          <Typography
                            sx={{
                              fontSize: '13px',
                              fontWeight: notif.isRead ? 600 : 900,
                              color: '#fff',
                              fontFamily: 'Be Vietnam Pro',
                              lineHeight: 1.3,
                              mb: 0.5,
                            }}
                          >
                            {notif.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '12px',
                              color: notif.isRead ? 'rgba(248, 250, 252, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                              lineHeight: 1.4,
                              fontFamily: 'Plus Jakarta Sans',
                              mb: 0.8,
                            }}
                          >
                            {notif.message}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography
                              sx={{
                                fontSize: '9px',
                                color: 'rgba(255,255,255,0.3)',
                                fontFamily: 'JetBrains Mono',
                                fontWeight: 700,
                              }}
                            >
                              {new Date(notif.createdAt).toLocaleString('vi-VN')}
                            </Typography>
                            <span style={{ 
                              fontSize: '11px', 
                              color: '#fb7185', 
                              fontFamily: 'Plus Jakarta Sans', 
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Xem chi tiết →
                            </span>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Tooltip title="Giỏ hàng">
            <IconButton className="icon-button" onClick={openCartPreview}>
              <Badge badgeContent={displayCartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Menu">
            <IconButton className="icon-button" onClick={() => setMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Container>

      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={closeMenu}
        PaperProps={{ className: 'aerotec-menu-drawer' }}
      >
        <Box className="menu-drawer-header">
          <Box>
            <Typography component="p" className="menu-eyebrow">AEROTEC</Typography>
            <Typography component="h2">Menu</Typography>
          </Box>
          <IconButton className="icon-button" onClick={closeMenu} aria-label="Đóng menu">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className="menu-account-card">
          <AccountCircleIcon />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="p" className="menu-account-title">
              {user ? 'Tài khoản thành viên' : 'Khách mua hàng'}
            </Typography>
            <Typography component="p" className="menu-account-subtitle">
              {user?.email || 'Đăng nhập để xem đơn hàng và yêu thích'}
            </Typography>
          </Box>
        </Box>

        <Box className="menu-section">
          <Typography component="p" className="menu-section-title">Mua sắm</Typography>
          {renderMenuItems(shoppingItems)}
        </Box>

        <Divider className="menu-divider" />

        <Box className="menu-section">
          <Typography component="p" className="menu-section-title">Tài khoản</Typography>
          {renderMenuItems(accountItems)}
          {user?.role === 'admin' && renderMenuItems(adminItems)}
          {user ? (
            <Button
              className="menu-auth-button danger"
              startIcon={<LogoutIcon />}
              onClick={() => {
                closeMenu()
                onLogout()
              }}
            >
              Đăng xuất
            </Button>
          ) : (
            <Box className="menu-auth-actions">
              <Button
                className="menu-auth-button"
                startIcon={<LoginIcon />}
                onClick={() => {
                  closeMenu()
                  onOpenLogin()
                }}
              >
                Đăng nhập
              </Button>
              <Button
                className="menu-auth-button filled"
                startIcon={<PersonAddIcon />}
                onClick={() => {
                  closeMenu()
                  onOpenRegister()
                }}
              >
                Đăng ký
              </Button>
            </Box>
          )}
        </Box>

        <Divider className="menu-divider" />

        <Box className="menu-section">
          <Typography component="p" className="menu-section-title">Thông tin</Typography>
          {renderMenuItems(informationItems)}
        </Box>
      </Drawer>

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        mode={cartMode}
        notice={cartNotice}
        error={cartError}
        busy={cartBusy}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
        onClearCart={clearCart}
        onGoCheckout={() => {
          setCartOpen(false)
          onNavigate('checkout')
        }}
        onGoCart={() => {
          setCartOpen(false)
          onNavigate('cart')
        }}
      />
    </Box>
  )
}
