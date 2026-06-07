import { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'

// Components
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'

// Utils & Helpers
import { clearGuestCart, normalizeCartItems, readGuestCart, writeGuestCart, cartItemKey } from '../utils/cart'
import { getAuthToken } from '../services/authToken'
import { apiFetch } from '../services/apiClient'

// Utils
import { videoStages } from '../utils/constants'

// Render simulation chart based on active stage index
function renderSimulationChart(index) {
  if (index === 0) {
    // Stage 1: Downforce & Drag
    return (
      <svg width="320" height="180" viewBox="0 0 200 100" fill="none" style={{ overflow: 'visible' }}>
        {/* Axis */}
        <line x1="10" y1="90" x2="190" y2="90" stroke="rgba(248,250,252,0.3)" strokeWidth="1" />
        <line x1="10" y1="10" x2="10" y2="90" stroke="rgba(248,250,252,0.3)" strokeWidth="1" />
        {/* Downforce line (rose-orange) */}
        <path d="M 10,85 Q 70,80 130,45 T 190,15" stroke="url(#roseOrangeGrad)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Drag line (electric blue) */}
        <path d="M 10,88 Q 70,85 130,65 T 190,40" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 1" />
        
        {/* Dots & labels */}
        <circle cx="190" cy="15" r="3" fill="#f43f5e" />
        <circle cx="190" cy="40" r="3" fill="#38bdf8" />
        <text x="130" y="24" fill="#f43f5e" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', fontWeight: 'bold' }}>DOWNFORCE: 940 KGF</text>
        <text x="135" y="49" fill="#38bdf8" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', fontWeight: 'bold' }}>DRAG COEF: 0.32</text>
        
        {/* Gradients */}
        <defs>
          <linearGradient id="roseOrangeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (index === 1) {
    // Stage 2: Engine power/torque curve
    return (
      <svg width="320" height="180" viewBox="0 0 200 100" fill="none" style={{ overflow: 'visible' }}>
        {/* Axis */}
        <line x1="10" y1="90" x2="190" y2="90" stroke="rgba(248,250,252,0.3)" strokeWidth="1" />
        <line x1="10" y1="10" x2="10" y2="90" stroke="rgba(248,250,252,0.3)" strokeWidth="1" />
        {/* HP curve (rose) */}
        <path d="M 10,85 C 40,80 80,60 120,30 C 140,15 170,10 190,20" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
        {/* Torque curve (orange) */}
        <path d="M 10,65 C 40,45 80,35 120,40 C 140,42 170,55 190,80" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        
        {/* Dots & labels */}
        <circle cx="170" cy="10" r="3" fill="#f43f5e" />
        <circle cx="120" cy="40" r="3" fill="#f97316" />
        <text x="100" y="16" fill="#f43f5e" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', fontWeight: 'bold' }}>MAX POWER: 940 HP @ 8200 RPM</text>
        <text x="64" y="46" fill="#f97316" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', fontWeight: 'bold' }}>MAX TORQUE: 880 NM @ 5500 RPM</text>
      </svg>
    );
  }
  // Stage 3: Wheels & brakes deceleration
  return (
    <svg width="320" height="180" viewBox="0 0 200 100" fill="none" style={{ overflow: 'visible' }}>
      {/* Axis */}
      <line x1="10" y1="90" x2="190" y2="90" stroke="rgba(248,250,252,0.3)" strokeWidth="1" />
      <line x1="10" y1="10" x2="10" y2="90" stroke="rgba(248,250,252,0.3)" strokeWidth="1" />
      {/* Brake pressure (rose) */}
      <path d="M 10,85 L 30,20 L 70,20 L 110,85" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
      {/* Deceleration G (emerald/green) */}
      <path d="M 10,85 L 30,15 L 70,18 L 110,85" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 1" />
      
      {/* Dots & labels */}
      <circle cx="30" cy="15" r="3" fill="#22c55e" />
      <text x="35" y="24" fill="#22c55e" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', fontWeight: 'bold' }}>PEAK G: -2.12G DECEL</text>
      <text x="35" y="32" fill="#f43f5e" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', fontWeight: 'bold' }}>PRESSURE: 120 BAR</text>
    </svg>
  );
}

// Subassembly components helper
function renderSubAssemblyComponents(index) {
  if (index === 0) {
    return [
      { name: 'Cấu trúc khoang cabin Carbon', sku: 'CBN-C26-MONO', desc: 'Khung cabin chịu lực được lưu hóa trong lò hấp autoclave.', status: 'ĐỘ CỨNG 98.4%', color: '#f43f5e' },
      { name: 'Đường hầm gió Venturi dưới gầm', sku: 'AER-V99-DIFF', desc: 'Bộ khuếch tán dẫn luồng khí động học hiệu ứng gầm.', status: 'LỰC ÉP 90KG', color: '#f97316' },
      { name: 'Thanh giằng chéo khung gầm', sku: 'CHR-M12-BAR', desc: 'Hệ giằng hợp kim titanium giảm vặn xoắn thân xe.', status: 'DUNG SAI 0.8mm', color: '#fb7185' }
    ];
  }
  if (index === 1) {
    return [
      { name: 'Lốc máy V8 CNC nguyên khối', sku: 'ENG-V8B-ALU', desc: 'Lốc nhôm CNC nguyên khối với hệ thống bôi trơn các-te khô.', status: '112,000 RPM', color: '#f43f5e' },
      { name: 'Bầu nạp khí nén sợi carbon', sku: 'PLN-C12-FLOW', desc: 'Cổ hút thể tích lớn tối ưu áp suất không khí nạp buồng đốt.', status: 'ÁP SUẤT 4.2 BAR ĐẠT', color: '#f97316' },
      { name: 'Cổ xả tích hợp van titanium', sku: 'EXH-T20-PIPE', desc: 'Hệ thống ống xả tích hợp van biến thiên âm thanh.', status: 'ỔN ĐỊNH Ở 1100°C', color: '#fb7185' }
    ];
  }
  return [
    { name: 'Đĩa phanh gốm Carbon thông gió', sku: 'ROT-CC38-DISC', desc: 'Bộ đĩa phanh composite tản nhiệt nhanh không suy giảm lực phanh.', status: 'TỐI ĐA 950°C', color: '#f43f5e' },
    { name: 'Heo dầu phanh Monobloc 6-piston', sku: 'CAL-B60-MONO', desc: 'Heo dầu Monobloc gia công nguyên khối chịu tải phanh cực đại.', status: 'ÁP LỰC 120 BAR', color: '#f97316' },
    { name: 'Cụm ngõng moay-ơ Magie đúc áp lực', sku: 'HUB-CL12-LOCK', desc: 'Trục moay-ơ khóa trung tâm với hình học bánh xe đua.', status: 'PHẢN HỒI 0.2 ms', color: '#fb7185' }
  ];
}

export default function TechPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout, onGoCheckout }) {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const videoRef = useRef(null)

  // Shopping Cart States
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const cartMode = getAuthToken() ? 'account' : 'guest'
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  const loadCart = async () => {
    setCartError('')
    if (!getAuthToken()) {
      const guestItems = readGuestCart()
      setCartItems(guestItems)
      return guestItems
    }
    setCartBusy(true)
    try {
      const result = await apiFetch('/cart', { auth: true })
      const items = normalizeCartItems(result)
      setCartItems(items)
      return items
    } catch (error) {
      setCartError(error.message || 'Không thể tải giỏ hàng tài khoản.')
      return []
    } finally {
      setCartBusy(false)
    }
  }

  const updateCartQuantity = async (item, quantity) => {
    setCartNotice('')
    setCartError('')
    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify({ quantity }),
        })
        await loadCart()
        return
      } catch {
        setCartError('Không thể cập nhật số lượng trong giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    const nextItems = readGuestCart().map((cartItem) =>
      cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity } : cartItem
    )
    writeGuestCart(nextItems)
    setCartItems(nextItems)
  }

  const removeCartItem = async (item) => {
    setCartNotice('')
    setCartError('')
    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, {
          method: 'DELETE',
          auth: true,
        })
        await loadCart()
        return
      } catch {
        setCartError('Không thể xóa sản phẩm khỏi giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    const nextItems = readGuestCart().filter((cartItem) => cartItemKey(cartItem) !== cartItemKey(item))
    writeGuestCart(nextItems)
    setCartItems(nextItems)
  }

  const clearCart = async () => {
    setCartNotice('')
    setCartError('')
    if (getAuthToken()) {
      setCartBusy(true)
      try {
        await apiFetch('/cart', { method: 'DELETE', auth: true })
        setCartItems([])
        return
      } catch {
        setCartError('Không thể xóa giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    clearGuestCart()
    setCartItems([])
  }

  useEffect(() => {
    loadCart()
  }, [user])

  const activeStage = videoStages[activeStageIndex]

  const handleStageChange = (index) => {
    if (index === activeStageIndex) return
    setFade(false)
    setTimeout(() => {
      setActiveStageIndex(index)
      setFade(true)
      if (videoRef.current) {
        videoRef.current.load()
        videoRef.current.play().catch((err) => console.log('Video play interrupted:', err))
      }
    }, 400)
  }

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab="tech"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      {/* TECH MAIN SECTION */}
      <Container maxWidth="xl" className="tech-container">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Chip label="Phòng Thực Nghiệm Tương Tác" sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 950, color: '#fff', fontSize: { md: '46px', xs: '32px' }, mb: 2 }}>
            Giải Phẫu Chi Tiết Kỹ Thuật
          </Typography>
          <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', maxWidth: '640px', mx: 'auto', fontSize: '15px', lineHeight: 1.6 }}>
            Khám phá cơ học tiên tiến từ kỹ sư AEROTEC. Các giai đoạn video tương tác mô phỏng khung gầm, cụm truyền động và các hệ thống bánh xe hiệu năng cao.
          </Typography>
        </Box>

        {/* VIDEOS & DETAIL VIEW GRID */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '1.4fr 0.6fr', xs: '1fr' }, gap: 4 }}>
          {/* LEFT: CINEMATIC PLAYER */}
          <Box>
            <div className="cinema-player-box">
              <div className="speed-grid" />
              <video
                ref={videoRef}
                className="cinema-video"
                src={activeStage.src}
                style={{ opacity: fade ? 1 : 0 }}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
              <div className="video-vignette" />
              <div className="video-overlay-text">
                <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>
                  MÔ PHỎNG AEROTEC // GIAI ĐOẠN {activeStage.number}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', my: 0.5 }}>
                  {activeStage.title}
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.7)', fontSize: '13px' }}>
                  {activeStage.subtitle}
                </Typography>
              </div>
            </div>

            {/* STAGE SELECT TABS */}
            <Box className="tech-stages-nav">
              {videoStages.map((stage, idx) => (
                <Button
                  key={stage.id}
                  className={`tech-stage-btn ${idx === activeStageIndex ? 'active' : ''}`}
                  onClick={() => handleStageChange(idx)}
                >
                  Giai đoạn {stage.number}: {stage.id.toUpperCase()}
                </Button>
              ))}
            </Box>
          </Box>

          {/* RIGHT: MECHANICAL DESCRIPTION */}
          <Box className="glow-card-premium" sx={{ p: 4, display: 'flex', flexDirection: 'column', justify: 'space-between', border: '1px solid rgba(244,63,94,0.15) !important' }}>
            <Box>
              <Chip label={`Stage ${activeStage.number}`} sx={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', fontWeight: 900, mb: 3 }} />
              <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', fontSize: '26px', mb: 2 }}>
                {activeStage.title}
              </Typography>
              <Typography sx={{ color: '#fb7185', fontWeight: 900, fontSize: '14px', mb: 3, letterSpacing: '0.5px' }}>
                {activeStage.subtitle}
              </Typography>
              <Typography sx={{ color: 'rgba(248, 250, 252, 0.6)', fontSize: '14px', lineHeight: 1.7, mb: 4 }}>
                {activeStage.narrative}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', mb: 2, textTransform: 'uppercase' }}>
                DANH MỤC THÔNG SỐ KỸ THUẬT
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {activeStage.points.map((point) => (
                  <Box key={point} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <span style={{ color: '#f43f5e', fontWeight: 900 }}>✓</span>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>
                      {point}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* LIVE SIMULATION & DIAGNOSTIC DECK */}
        <Box sx={{ mt: 8, borderTop: '1px solid rgba(248,250,252,0.06)', pt: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '28px', mb: 1, fontFamily: 'Be Vietnam Pro' }}>
            BÀN ĐIỀU KHIỂN MÔ PHỎNG ATELIER
          </Typography>
          <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', fontFamily: 'JetBrains Mono', mb: 4, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Luồng Telemetry // Chẩn đoán Giai đoạn {activeStage.number} // đang hoạt động
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.2fr 0.8fr', xs: '1fr' }, gap: 6 }}>
            {/* LEFT: DYNAMIC SIMULATION GRAPH */}
            <Box className="glow-card-premium" sx={{ p: 4, background: 'rgba(5,5,5,0.7)', border: '1px solid rgba(244,63,94,0.15) !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#fb7185', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {activeStageIndex === 0 ? 'Bản đồ Vector Lực ép & Lực cản (KGF vs KM/H)' : activeStageIndex === 1 ? 'Đường cong Dyno Công suất & Mô-men xoắn (RPM vs HP/NM)' : 'Hồ sơ giảm tốc lực phanh (G vs Thời gian)'}
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pulse-glow-dot" style={{ width: '6px', height: '6px' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#22c55e', fontWeight: 'bold' }}>ĐANG CHẠY THỜI GIAN THỰC</span>
                </div>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px dashed rgba(248,250,252,0.12)', borderRadius: '8px', height: '260px', position: 'relative', overflow: 'hidden' }}>
                {/* Graph Grid Lines */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(248,250,252,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(248,250,252,0.02) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {/* SVG Live Simulation Chart */}
                {renderSimulationChart(activeStageIndex)}
              </Box>
            </Box>

            {/* RIGHT: SUB-ASSEMBLY DIAGNOSTICS */}
            <Box className="glow-card-premium" sx={{ p: 4, background: 'rgba(5,5,5,0.7)', border: '1px solid rgba(244,63,94,0.15) !important', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#fb7185', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(248,250,252,0.08)', pb: 1 }}>
                Chẩn đoán chi tiết cụm phụ tùng
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {renderSubAssemblyComponents(activeStageIndex).map((comp) => (
                  <Box key={comp.sku} sx={{ borderLeft: `2px solid ${comp.color}`, pl: 2, py: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '13px', fontFamily: 'Plus Jakarta Sans' }}>
                        {comp.name}
                      </Typography>
                      <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', fontFamily: 'JetBrains Mono' }}>
                        SKU: {comp.sku}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', fontFamily: 'Plus Jakarta Sans' }}>
                        {comp.desc}
                      </Typography>
                      <Typography sx={{ color: '#fb7185', fontWeight: 900, fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                        {comp.status}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Footer onNavigate={onNavigate} />

      {/* CART DRAWER */}
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
