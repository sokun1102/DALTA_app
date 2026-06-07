import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import DateRangeIcon from '@mui/icons-material/DateRange'

// Components
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'

// Utils & Helpers
import { apiFetch } from '../services/apiClient'
import { ARTICLES_DATA, featuredCars } from '../utils/constants'
import { mapProductToCar } from '../utils/helpers'
import { useCart } from '../hooks/useCart'

export default function ArticleDetailPage({
  user,
  selectedArticle: propArticle,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onLogout,
  onGoCheckout,
}) {
  const [dbProducts, setDbProducts] = useState([])
  const fallbackArticle = useMemo(() => {
    if (propArticle && propArticle.id) {
      const found = ARTICLES_DATA.find((a) => Number(a.id) === Number(propArticle.id))
      return found || ARTICLES_DATA[0]
    }

    const path = window.location.pathname
    const idStr = path.split('/articles/')[1]
    const id = parseInt(idStr, 10)
    const found = ARTICLES_DATA.find((a) => Number(a.id) === Number(id))
    return found || ARTICLES_DATA[0]
  }, [propArticle])
  const [article, setArticle] = useState(fallbackArticle)
  const {
    cartOpen,
    setCartOpen,
    cartItems,
    cartMode,
    cartCount,
    cartNotice,
    cartError,
    cartBusy,
    updateCartQuantity,
    removeCartItem,
    clearCart,
  } = useCart({ user })

  useEffect(() => {
    const id = propArticle?.id || window.location.pathname.split('/articles/')[1]
    if (!id) {
      setArticle(fallbackArticle)
      return
    }

    apiFetch(`/articles/${id}`)
      .then((data) => setArticle(data?.id ? data : fallbackArticle))
      .catch(() => setArticle(fallbackArticle))
  }, [fallbackArticle, propArticle])

  useEffect(() => {
    let isMounted = true

    apiFetch('/products')
      .then((result) => {
        if (!isMounted) return
        const items = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : (result?.items || [])
        setDbProducts(items)
      })
      .catch((error) => {
        console.warn('Failed to load products in article detail:', error.message)
      })

    return () => {
      isMounted = false
    }
  }, [user])

  const getProductIdBySku = (sku) => {
    if (dbProducts.length > 0) {
      const mappedDb = dbProducts.map((p) => mapProductToCar(p))
      const matched = mappedDb.find(
        (p) => p.sku.toLowerCase().trim() === sku.toLowerCase().trim()
      )
      if (matched) return matched.id
    }
    const matched = featuredCars.find(
      (car) => car.sku.toLowerCase().trim() === sku.toLowerCase().trim()
    )
    if (matched) return matched.id
    if (sku.includes('WING')) return 1
    if (sku.includes('EXH') || sku.includes('EXHAUST')) return 2
    if (sku.includes('BRK') || sku.includes('ROTOR')) return 3
    if (sku.includes('SUSP')) return 4
    if (sku.includes('INT')) return 5
    if (sku.includes('NEUR') || sku.includes('DRV')) return 6
    if (sku.includes('DIFF') || sku.includes('UNDER')) return 7
    if (sku.includes('RIM')) return 8
    return null
  }

  if (!article) {
    return (
      <Box className="car-site" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Typography sx={{ color: '#fff', fontFamily: 'JetBrains Mono' }}>Loading Publication Telemetry...</Typography>
      </Box>
    )
  }

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab="articles"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      <Box sx={{ pt: 14, pb: 10, minHeight: '80vh' }}>
        <Container maxWidth="xl">
          {/* BACK LINK */}
          <Button
            startIcon={<ArrowBackIcon />}
            sx={{
              color: '#fb7185',
              fontFamily: 'JetBrains Mono',
              fontSize: '13px',
              fontWeight: 'bold',
              mb: 4,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              '&:hover': {
                background: 'rgba(244,63,94,0.08)',
                color: '#f43f5e',
              },
            }}
            onClick={() => onNavigate('articles')}
          >
            Back to Publications
          </Button>

          {/* ARTICLE HERO CONTAINER */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              mb: 6,
              border: '1px solid rgba(248, 250, 252, 0.08)',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)',
              padding: { md: 6, xs: 4 },
              display: 'grid',
              gridTemplateColumns: { md: '1.2fr 0.8fr', xs: '1fr' },
              gap: 5,
              alignItems: 'center',
            }}
          >
            <Box>
              <Chip
                label={article.category}
                sx={{
                  background: 'rgba(244,63,94,0.12)',
                  color: '#f43f5e',
                  fontWeight: 900,
                  mb: 3,
                  fontFamily: 'JetBrains Mono',
                  textTransform: 'uppercase',
                  fontSize: '11px',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 950,
                  color: '#fff',
                  fontSize: { md: '44px', xs: '28px' },
                  mb: 3,
                  fontFamily: 'Be Vietnam Pro',
                  lineHeight: 1.15,
                }}
              >
                {article.title}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(248, 250, 252, 0.7)',
                  fontSize: '16px',
                  fontFamily: 'Plus Jakarta Sans',
                  lineHeight: 1.6,
                  mb: 4,
                }}
              >
                {article.subtitle}
              </Typography>

              {/* METADATA STRIP */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                  borderTop: '1px solid rgba(248,250,252,0.06)',
                  pt: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonOutlineIcon sx={{ color: '#fb7185', fontSize: '18px' }} />
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans' }}>
                    {article.author}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateRangeIcon sx={{ color: '#fb7185', fontSize: '18px' }} />
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans' }}>
                    {article.date}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon sx={{ color: '#fb7185', fontSize: '18px' }} />
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans' }}>
                    {article.readTime}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ART WORK OR DUMMY CAR DESIGN */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '16px',
                border: '1px dashed rgba(248,250,252,0.08)',
                overflow: 'hidden',
                height: '100%',
                minHeight: '260px',
              }}
            >
              <img
                src={article.image}
                alt={article.title}
                style={{
                  width: '90%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.8)) brightness(0.9)',
                }}
              />
            </Box>
          </Box>

          {/* DUAL COLUMN MAIN LAYOUT */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '1.4fr 0.6fr', xs: '1fr' }, gap: 5 }}>
            {/* ARTICLE BODY */}
            <Box>
              <Box
                sx={{
                  background: 'rgba(10, 10, 10, 0.65)',
                  border: '1px solid rgba(248, 250, 252, 0.06)',
                  borderRadius: '20px',
                  padding: { md: 5, xs: 3 },
                  color: 'rgba(248,250,252,0.8)',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '16px',
                  lineHeight: 1.8,
                }}
              >
                {article.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: '24px' }}>
                    {paragraph.trim()}
                  </p>
                ))}

                {/* SCHEMATICS & PHYSICS FORMULAS */}
                {article.formulas && (
                  <Box sx={{ mt: 6, pt: 4, borderTop: '1px dashed rgba(248,250,252,0.1)' }}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#fff',
                        fontWeight: 900,
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: '18px',
                        mb: 3,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Mathematical Aerodynamics & Physics Mappings
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {article.formulas.map((form) => (
                        <Box
                          key={form.label}
                          className="glow-card-premium"
                          sx={{
                            p: 3.5,
                            background: 'rgba(5,5,5,0.8)',
                            border: '1px solid rgba(244,63,94,0.15) !important',
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: 'JetBrains Mono',
                              fontSize: '10px',
                              color: 'rgba(248,250,252,0.4)',
                              textTransform: 'uppercase',
                              mb: 2,
                              letterSpacing: '0.5px',
                            }}
                          >
                            CÔNG THỨC // {form.label}
                          </Typography>
                          <Box
                            sx={{
                              py: 2.5,
                              px: 3,
                              background: 'rgba(0,0,0,0.5)',
                              borderRadius: '8px',
                              border: '1px solid rgba(248,250,252,0.06)',
                              display: 'flex',
                              justifyContent: 'center',
                              mb: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: 'JetBrains Mono',
                                fontSize: '15px',
                                color: '#fb7185',
                                letterSpacing: '1px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }}
                            >
                              {form.equation}
                            </Typography>
                          </Box>
                          <Typography sx={{ color: 'rgba(248,250,252,0.55)', fontSize: '13px', lineHeight: 1.5 }}>
                            {form.desc}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* SIDEBAR: COMPATIBLE PARTS & SPECS */}
            <Box>
              <Box
                sx={{
                  position: 'sticky',
                  top: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {/* COMPATIBLE PARTS DECK */}
                {article.compatibleParts && (
                  <Box
                    sx={{
                      background: 'rgba(15,15,15,0.8)',
                      border: '1px solid rgba(248,250,252,0.08)',
                      borderRadius: '20px',
                      padding: 4,
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#fff',
                        fontWeight: 950,
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: '16px',
                        mb: 3,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Phụ Tùng Tương Thích
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      {article.compatibleParts.map((part) => {
                        const targetId = getProductIdBySku(part.sku)
                        return (
                          <Box
                            key={part.sku}
                            sx={{
                              background: 'rgba(248,250,252,0.02)',
                              border: '1px solid rgba(248,250,252,0.06)',
                              p: 2.5,
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}>
                                {part.name}
                              </Typography>
                              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(248,250,252,0.4)', mt: 0.5 }}>
                                SKU: {part.sku}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid rgba(248,250,252,0.04)' }}>
                              <Typography sx={{ color: '#fb7185', fontWeight: 900, fontSize: '14px', fontFamily: 'JetBrains Mono' }}>
                                {part.price}
                              </Typography>
                              <Button
                                className="gradient-btn-rose-orange"
                                sx={{
                                  py: 0.5,
                                  px: 2,
                                  borderRadius: '99px',
                                  fontSize: '10px',
                                  fontWeight: 900,
                                }}
                                onClick={() => {
                                  if (targetId) {
                                    onNavigate('product-detail', { id: targetId })
                                  } else {
                                    onNavigate('parts')
                                  }
                                }}
                              >
                                {targetId ? 'XEM CHI TIẾT' : 'CẤU HÌNH'}
                              </Button>
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                )}

                {/* PUBLICATION DETAILS */}
                <Box
                  sx={{
                    background: 'rgba(15,15,15,0.4)',
                    border: '1px solid rgba(248,250,252,0.04)',
                    borderRadius: '20px',
                    padding: 3.5,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(248,250,252,0.5)',
                      fontWeight: 800,
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: '12px',
                      mb: 2,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Thông số Báo cáo Atelier
                  </Typography>
                  <Box sx={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(248,250,252,0.4)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>TRẠNG THÁI BÁO CÁO:</span>
                      <span style={{ color: '#22c55e', fontWeight: 'bold' }}>PEER-REVIEWED</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>CHỈ SỐ TUÂN THỦ:</span>
                      <span style={{ color: '#fff' }}>FIA GT-CLASS CERT</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>NGUỒN DỮ LIỆU TELEMETRY:</span>
                      <span style={{ color: '#fb7185' }}>SEOUL LABS</span>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer onNavigate={onNavigate} />

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
          onGoCheckout()
        }}
      />
    </Box>
  )
}
