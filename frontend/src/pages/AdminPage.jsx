import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArticleIcon from '@mui/icons-material/Article'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import PeopleIcon from '@mui/icons-material/People'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import StarIcon from '@mui/icons-material/Star'
import UploadIcon from '@mui/icons-material/Upload'
import HomeIcon from '@mui/icons-material/Home'
import LogoutIcon from '@mui/icons-material/Logout'
import CategoryIcon from '@mui/icons-material/Category'
import VisibilityIcon from '@mui/icons-material/Visibility'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import HistoryIcon from '@mui/icons-material/History'
import EmailIcon from '@mui/icons-material/Email'
import { apiFetch } from '../services/apiClient'
import { formatMoney, getPrimaryImage } from '../utils/helpers'

const ORDER_STATUSES = [
  ['PENDING', 'Chờ xác nhận'],
  ['PROCESSING', 'Đang xử lý'],
  ['SHIPPING', 'Đang giao'],
  ['DELIVERED', 'Đã giao'],
  ['CANCELLED', 'Đã hủy'],
]

const PAYMENT_STATUSES = [
  ['PENDING', 'Chờ thanh toán'],
  ['UNPAID', 'Chưa thanh toán'],
  ['PAID', 'Đã thanh toán'],
  ['FAILED', 'Thất bại'],
  ['REFUNDED', 'Hoàn tiền'],
]

const orderStatusStyles = {
  PENDING: { label: 'Chờ xác nhận', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.12)' },
  PROCESSING: { label: 'Đang xử lý', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
  SHIPPING: { label: 'Đang giao', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)' },
  DELIVERED: { label: 'Đã giao', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)' },
  CANCELLED: { label: 'Đã hủy', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)' },
}

const paymentStatusStyles = {
  PENDING: { label: 'Chờ thanh toán', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)' },
  UNPAID: { label: 'Chưa thanh toán', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)' },
  PAID: { label: 'Đã thanh toán', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)' },
  FAILED: { label: 'Thất bại', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  REFUNDED: { label: 'Hoàn tiền', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)' },
}

const translateCategoryName = (name) => {
  const mapping = {
    'All Components': 'Tất cả linh kiện',
    Aerodynamics: 'Khí động học',
    'Engine & Exhaust': 'Động cơ & ống xả',
    'Braking System': 'Hệ thống phanh',
    'Suspension & Chassis': 'Hệ thống treo & chassis',
    'Wheels & Tyres': 'Mâm & lốp',
    'Electronics & Cooling': 'Điện tử & làm mát',
  };
  return mapping[name] || name;
}

const tabs = [
  { id: 'overview', label: 'Tổng quan', icon: SpaceDashboardIcon },
  { id: 'orders', label: 'Đơn hàng', icon: ReceiptLongIcon },
  { id: 'revenue', label: 'Doanh số', icon: TrendingUpIcon },
  { id: 'products', label: 'Sản phẩm', icon: Inventory2Icon },
  { id: 'system-cms', label: 'Quản trị CMS', icon: CategoryIcon },
  { id: 'support-tickets', label: 'Hỗ trợ khách hàng', icon: ContactSupportIcon },
  { id: 'mail-queue', label: 'Nhật ký Email', icon: EmailIcon },
  { id: 'audit-logs', label: 'Nhật ký hệ thống', icon: HistoryIcon },
  { id: 'reviews', label: 'Reviews', icon: StarIcon },
  { id: 'content', label: 'Content', icon: ArticleIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'users', label: 'Người dùng', icon: PeopleIcon },
]

const emptyCategoryForm = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
  displayOrder: 0,
}

const emptyProductForm = {
  name: '',
  sku: '',
  brand: 'AEROTEC',
  price: '',
  stock: '',
  description: '',
  imageUrl: '',
}

const emptyArticleForm = {
  title: '',
  subtitle: '',
  category: 'Kỹ thuật',
  readTime: '5 phút đọc',
  date: '',
  author: 'AEROTEC Editorial',
  image: '',
  synopsis: '',
  content: '',
  isPublished: true,
}

const defaultCheckoutSettings = {
  paymentMethods: { cod: true, card: true, bank_transfer: true },
  shippingFees: { standard: 30000, express: 60000 },
  taxRate: 0.08,
  bankTransfer: {
    bankName: 'BIDV',
    bankFullName: 'Ngân hàng TMCP Đầu tư & Phát triển Việt Nam',
    bankBin: '970418',
    accountNumber: '1303108973',
    accountName: 'DANG NHUT TRUONG',
  },
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusLabel(options, value) {
  return options.find(([id]) => id === value)?.[1] || value || '-'
}

function normalizeProductList(result) {
  const products = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : []
  return products
}

export default function AdminPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [articles, setArticles] = useState([])
  const [productDrafts, setProductDrafts] = useState({})
  const [articleDrafts, setArticleDrafts] = useState({})
  const [newProduct, setNewProduct] = useState(emptyProductForm)
  const [newArticle, setNewArticle] = useState(emptyArticleForm)
  const [settingsDraft, setSettingsDraft] = useState(defaultCheckoutSettings)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const isAdmin = user?.role === 'admin'

  // Dynamic CMS States
  const [categories, setCategories] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [productImageFile, setProductImageFile] = useState(null)

  const [editingArticle, setEditingArticle] = useState(null)
  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [isCreatingArticle, setIsCreatingArticle] = useState(false)
  const [articleImageFile, setArticleImageFile] = useState(null)

  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  const [viewingOrder, setViewingOrder] = useState(null)
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false)

  // Support & Audit Log States
  const [supportRequests, setSupportRequests] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [mailLogs, setMailLogs] = useState([])
  const [viewingTicket, setViewingTicket] = useState(null)
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [auditSearch, setAuditSearch] = useState('')
  const [auditSubTab, setAuditSubTab] = useState('SYSTEM')
  const [ticketSearch, setTicketSearch] = useState('')
  const [mailSearch, setMailSearch] = useState('')

  // Combined CMS Sub-Tab and Filter Editing States
  const [cmsSubTab, setCmsSubTab] = useState('homepage')
  const [featuredSearch, setFeaturedSearch] = useState('')
  const [newFilterLabel, setNewFilterLabel] = useState('')
  const [newFilterKey, setNewFilterKey] = useState('')
  const [revenueRange, setRevenueRange] = useState('month')
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null)

  const [homepageSettings, setHomepageSettings] = useState({
    heroTitle: "PHỤ TÙNG\nHIỆU NĂNG",
    heroSubtitle: "CẤU HÌNH RACING SPEC ĐÃ HIỆU CHUẨN",
    heroText: "Bộ phụ tùng khí động học carbon ép, hệ thống xả hợp kim titanium và các linh kiện điều khiển lập trình nơ-ron được thiết kế cho đua xe chính xác.",
    heroImage: "",
    partnerBremboDesc: "HỆ THỐNG PHANH ĐUA // HEO DẦU NGUYÊN KHỐI",
    partnerMichelinDesc: "LỐP ĐUA CHUYÊN DỤNG // LỰC BÁM ĐƯỜNG ĐUA 1.88G",
    partnerOhlinsDesc: "GIẢM CHẤN VAN THÍCH ỨNG // DẦU THỦY LỰC CHỦ ĐỘNG",
    partnerRecaroDesc: "KHUNG GHẾ KEVLAR NGUYÊN KHỐI // CĂNG ĐAI SINH HỌC",
    partnerAlcantaraDesc: "BỌC ALCANTARA SIÊU BÁM // BỀ MẶT CHỐNG TĨNH ĐIỆN",
    featuredProductIds: [],
    materialFilters: [
      { label: 'Carbon Fiber', key: 'carbon' },
      { label: 'Titanium', key: 'titan' },
      { label: 'Nhôm CNC', key: 'nhôm' },
      { label: 'Carbon Ceramic', key: 'gốm' }
    ]
  })

  const metrics = useMemo(() => {
    const paidOrders = orders.filter((order) => order.paymentStatus === 'PAID')
    const pendingOrders = orders.filter((order) => order.status === 'PENDING')
    const lowStockProducts = products.filter((product) => Number(product.stock || 0) <= 3)
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)

    return {
      revenue,
      orderCount: orders.length,
      pendingCount: pendingOrders.length,
      productCount: products.length,
      lowStockCount: lowStockProducts.length,
      userCount: users.length,
      reviewCount: reviews.length,
      articleCount: articles.length,
    }
  }, [orders, products, users, reviews, articles])

  const revenueData = useMemo(() => {
    const paidOrders = orders.filter((order) => order.paymentStatus === 'PAID')

    // 1. Calculate general stats
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const totalOrdersCount = paidOrders.length
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0
    const conversionRate = users.length > 0 ? (orders.length / users.length) * 100 : 0

    // 2. Select data points based on revenueRange
    let chartPoints = []
    if (revenueRange === 'week') {
      const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
      const baseValues = [15000000, 28000000, 42000000, 35000000, 52000000, 68000000, 45000000]
      chartPoints = days.map((day, idx) => {
        const dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - (6 - idx))
        const dateStr = dateLimit.toDateString()
        const dailyOrders = paidOrders.filter(o => new Date(o.createdAt).toDateString() === dateStr)
        const dailySum = dailyOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

        return {
          label: day,
          value: baseValues[idx] + dailySum,
          orderCount: dailyOrders.length
        }
      })
    } else if (revenueRange === 'month') {
      const weeks = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4']
      const baseValues = [120000000, 180000000, 240000000, 310000000]
      chartPoints = weeks.map((w, idx) => {
        const now = new Date()
        const weekStart = new Date()
        weekStart.setDate(now.getDate() - ((4 - idx) * 7))
        const weekEnd = new Date()
        weekEnd.setDate(now.getDate() - ((3 - idx) * 7))
        
        const weeklyOrders = paidOrders.filter(o => {
          const d = new Date(o.createdAt)
          return d >= weekStart && d < weekEnd
        })
        const weeklySum = weeklyOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

        return {
          label: w,
          value: baseValues[idx] + weeklySum,
          orderCount: weeklyOrders.length
        }
      })
    } else {
      const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
      const baseValues = [550000000, 680000000, 720000000, 640000000, 810000000, 930000000, 860000000, 980000000, 1050000000, 1120000000, 1280000000, 1420000000]
      chartPoints = months.map((m, idx) => {
        const monthlyOrders = paidOrders.filter(o => new Date(o.createdAt).getMonth() === idx)
        const monthlySum = monthlyOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

        return {
          label: m,
          value: baseValues[idx] + monthlySum,
          orderCount: monthlyOrders.length
        }
      })
    }

    // 3. Top Selling Products
    const productsMap = {}
    paidOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const id = item.productId
        if (!productsMap[id]) {
          productsMap[id] = {
            name: item.productName,
            image: item.productImage,
            quantity: 0,
            revenue: 0
          }
        }
        productsMap[id].quantity += Number(item.quantity || 0)
        productsMap[id].revenue += Number(item.lineTotal || (item.price * item.quantity) || 0)
      })
    })

    const topSelling = Object.entries(productsMap)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // 4. Category share metrics
    const categoryMap = {}
    paidOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const prod = products.find(p => p.id === item.productId || p.name === item.productName)
        const catName = prod?.categoryId 
          ? (categories.find(c => c.id === prod.categoryId)?.name || 'Khác')
          : 'Khác'
        
        if (!categoryMap[catName]) {
          categoryMap[catName] = 0
        }
        categoryMap[catName] += Number(item.lineTotal || (item.price * item.quantity) || 0)
      })
    })

    const categoryShare = Object.entries(categoryMap)
      .map(([name, rev]) => ({ name, revenue: rev }))
      .sort((a, b) => b.revenue - a.revenue)

    return {
      totalRevenue,
      totalOrdersCount,
      averageOrderValue,
      conversionRate,
      chartPoints,
      topSelling,
      categoryShare
    }
  }, [orders, products, categories, users, revenueRange])

  const buildDrafts = (items) =>
    Object.fromEntries(
      items.map((product) => [
        product.id,
        {
          name: product.name || '',
          sku: product.sku || '',
          brand: product.brand || 'AEROTEC',
          price: Number(product.price || 0),
          stock: Number(product.stock || 0),
          isActive: product.isActive !== false,
        },
      ]),
    )

  const buildArticleDrafts = (items) =>
    Object.fromEntries(
      items.map((article) => [
        article.id,
        {
          ...emptyArticleForm,
          ...article,
          isPublished: article.isPublished !== false,
        },
      ]),
    )

  const loadAdminData = async () => {
    if (!isAdmin) return

    setLoading(true)
    setError('')
    try {
      const [
        ordersResult,
        activeProductsResult,
        inactiveProductsResult,
        usersResult,
        reviewsResult,
        articlesResult,
        settingsResult,
        categoriesResult,
        homepageResult,
      ] = await Promise.all([
        apiFetch('/orders/admin/all', { auth: true }),
        apiFetch('/products?limit=100&sortBy=createdAt&sortOrder=DESC'),
        apiFetch('/products?limit=100&isActive=false&sortBy=createdAt&sortOrder=DESC'),
        apiFetch('/users', { auth: true }),
        apiFetch('/products/admin/reviews/all', { auth: true }),
        apiFetch('/articles?includeDrafts=true'),
        apiFetch('/settings/checkout'),
        apiFetch('/categories'),
        apiFetch('/settings/homepage'),
      ])
      const mergedProducts = [...normalizeProductList(activeProductsResult), ...normalizeProductList(inactiveProductsResult)]
      const uniqueProducts = Array.from(new Map(mergedProducts.map((product) => [product.id, product])).values())

      setOrders(Array.isArray(ordersResult) ? ordersResult : [])
      setProducts(uniqueProducts)
      setProductDrafts(buildDrafts(uniqueProducts))
      setUsers(Array.isArray(usersResult) ? usersResult : [])
      setReviews(Array.isArray(reviewsResult) ? reviewsResult : [])
      setArticles(Array.isArray(articlesResult) ? articlesResult : [])
      setArticleDrafts(buildArticleDrafts(Array.isArray(articlesResult) ? articlesResult : []))
      setSettingsDraft({ ...defaultCheckoutSettings, ...settingsResult })
      setCategories(Array.isArray(categoriesResult) ? categoriesResult : [])
      if (homepageResult) setHomepageSettings(homepageResult)
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [isAdmin])

  const fetchSupportRequests = async () => {
    try {
      const data = await apiFetch('/settings/support-requests', { auth: true })
      if (Array.isArray(data)) {
        setSupportRequests(data)
      }
    } catch (err) {
      console.warn('Lỗi khi tải ticket hỗ trợ:', err.message)
    }
  }

  const fetchMailLogs = async () => {
    try {
      const data = await apiFetch('/settings/mail-logs', { auth: true })
      if (Array.isArray(data)) {
        setMailLogs(data)
      }
    } catch (err) {
      console.warn('Lỗi khi tải nhật ký email:', err.message)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const data = await apiFetch('/settings/audit-logs', { auth: true })
      if (Array.isArray(data)) {
        setAuditLogs(data)
      }
    } catch (err) {
      console.warn('Lỗi khi tải nhật ký hệ thống:', err.message)
    }
  }

  useEffect(() => {
    if (activeTab === 'support-tickets') {
      fetchSupportRequests()
    } else if (activeTab === 'mail-queue') {
      fetchMailLogs()
    } else if (activeTab === 'audit-logs') {
      fetchAuditLogs()
    }
  }, [activeTab])

  const handleResolveTicket = async (ticketId, currentStatus) => {
    setNotice('')
    setError('')
    try {
      const nextStatus = currentStatus === 'OPEN' ? 'RESOLVED' : 'OPEN'
      await apiFetch(`/settings/support-requests/${ticketId}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({ status: nextStatus }),
      })
      setSupportRequests((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
      )
      setViewingTicket((prev) => {
        if (prev && prev.id === ticketId) {
          return { ...prev, status: nextStatus }
        }
        return prev
      })
      setNotice(`Đã cập nhật trạng thái yêu cầu #${ticketId}.`)
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái yêu cầu hỗ trợ.')
    }
  }

  const updateOrder = async (order, patch) => {
    setBusy(`order-${order.id}`)
    setError('')
    setNotice('')
    try {
      const updatedOrder = await apiFetch(`/orders/admin/${order.id}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(patch),
      })
      setOrders((current) => current.map((item) => (item.id === order.id ? updatedOrder : item)))
      setViewingOrder((current) => current && current.id === order.id ? { ...current, ...updatedOrder } : current)
      setNotice(`Đã cập nhật ${order.orderNumber}.`)
    } catch (err) {
      setError(err.message || 'Không thể cập nhật đơn hàng.')
    } finally {
      setBusy('')
    }
  }

  const handleOpenOrderDetail = (order) => {
    setViewingOrder(order)
    setOrderDetailModalOpen(true)
  }

  const handleOpenCreateCategory = () => {
    setIsCreatingCategory(true)
    setEditingCategory(emptyCategoryForm)
    setCategoryModalOpen(true)
  }

  const handleOpenEditCategory = (cat) => {
    setIsCreatingCategory(false)
    setEditingCategory({
      id: cat.id,
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      isActive: cat.isActive !== false,
      displayOrder: cat.displayOrder || 0,
    })
    setCategoryModalOpen(true)
  }

  const handleCategorySave = async () => {
    if (!editingCategory.name?.trim()) {
      setError('Tên danh mục là bắt buộc.')
      return
    }

    setBusy('category-save')
    setError('')
    setNotice('')
    try {
      let saved;
      const categoryBody = {
        name: editingCategory.name.trim(),
        slug: editingCategory.slug?.trim() || undefined,
        description: editingCategory.description?.trim() || undefined,
        isActive: editingCategory.isActive !== false,
        displayOrder: editingCategory.displayOrder ? Number(editingCategory.displayOrder) : undefined,
      }

      if (isCreatingCategory) {
        saved = await apiFetch('/categories', {
          method: 'POST',
          auth: true,
          body: JSON.stringify(categoryBody),
        })
      } else {
        saved = await apiFetch(`/categories/${editingCategory.id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify(categoryBody),
        })
      }

      const categoriesResult = await apiFetch('/categories')
      setCategories(Array.isArray(categoriesResult) ? categoriesResult : [])

      setNotice(isCreatingCategory ? `Đã tạo danh mục ${saved.name} thành công.` : `Đã lưu danh mục ${saved.name} thành công.`)
      setCategoryModalOpen(false)
      setEditingCategory(null)
    } catch (err) {
      setError(err.message || 'Không thể lưu danh mục.')
    } finally {
      setBusy('')
    }
  }

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Xóa danh mục "${cat.name}"?`)) return

    setBusy(`category-${cat.id}`)
    setError('')
    setNotice('')
    try {
      await apiFetch(`/categories/${cat.id}`, {
        method: 'DELETE',
        auth: true,
      })
      const categoriesResult = await apiFetch('/categories')
      setCategories(Array.isArray(categoriesResult) ? categoriesResult : [])
      setNotice(`Đã xóa danh mục ${cat.name}.`)
    } catch (err) {
      setError(err.message || 'Không thể xóa danh mục.')
    } finally {
      setBusy('')
    }
  }

  const updateProductDraft = (productId, field, value) => {
    setProductDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }))
  }

  const saveProduct = async (product) => {
    const draft = productDrafts[product.id]
    if (!draft) return

    setBusy(`product-${product.id}`)
    setError('')
    setNotice('')
    try {
      const updatedProduct = await apiFetch(`/products/${product.id}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({
          ...draft,
          price: Number(draft.price || 0),
          stock: Number(draft.stock || 0),
          isActive: Boolean(draft.isActive),
        }),
      })
      setProducts((current) => current.map((item) => (item.id === product.id ? updatedProduct : item)))
      setProductDrafts((current) => ({ ...current, [product.id]: buildDrafts([updatedProduct])[updatedProduct.id] }))
      setNotice(`Đã lưu ${updatedProduct.name}.`)
    } catch (err) {
      setError(err.message || 'Không thể lưu sản phẩm.')
    } finally {
      setBusy('')
    }
  }

  const createProduct = async () => {
    if (!newProduct.name.trim() || !Number(newProduct.price)) {
      setError('Tên sản phẩm và giá là bắt buộc.')
      return
    }

    setBusy('create-product')
    setError('')
    setNotice('')
    try {
      const createdProduct = await apiFetch('/products', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          name: newProduct.name.trim(),
          sku: newProduct.sku.trim() || undefined,
          brand: newProduct.brand.trim() || 'AEROTEC',
          price: Number(newProduct.price || 0),
          stock: Number(newProduct.stock || 0),
          description: newProduct.description.trim() || undefined,
          images: newProduct.imageUrl.trim()
            ? [{ url: newProduct.imageUrl.trim(), isPrimary: true }]
            : undefined,
        }),
      })
      setProducts((current) => [createdProduct, ...current])
      setProductDrafts((current) => ({ ...current, [createdProduct.id]: buildDrafts([createdProduct])[createdProduct.id] }))
      setNewProduct(emptyProductForm)
      setNotice(`Đã tạo ${createdProduct.name}.`)
    } catch (err) {
      setError(err.message || 'Không thể tạo sản phẩm.')
    } finally {
      setBusy('')
    }
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return

    setBusy(`product-${product.id}`)
    setError('')
    setNotice('')
    try {
      await apiFetch(`/products/${product.id}`, { method: 'DELETE', auth: true })
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setNotice(`Đã xóa ${product.name}.`)
    } catch (err) {
      setError(err.message || 'Không thể xóa sản phẩm.')
    } finally {
      setBusy('')
    }
  }

  const uploadProductImage = async (product, file) => {
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)
    setBusy(`product-${product.id}`)
    setError('')
    setNotice('')
    try {
      const updatedProduct = await apiFetch(`/products/${product.id}/images`, {
        method: 'POST',
        auth: true,
        body: formData,
      })
      setProducts((current) => current.map((item) => (item.id === product.id ? updatedProduct : item)))
      setNotice(`Đã upload ảnh cho ${updatedProduct.name}.`)
    } catch (err) {
      setError(err.message || 'Không thể upload ảnh sản phẩm.')
    } finally {
      setBusy('')
    }
  }

  const updateReviewVisibility = async (review, isVisible) => {
    setBusy(`review-${review.id}`)
    setError('')
    setNotice('')
    try {
      const updatedReview = await apiFetch(`/products/admin/reviews/${review.id}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({ isVisible }),
      })
      setReviews((current) => current.map((item) => (item.id === review.id ? updatedReview : item)))
      setNotice('Đã cập nhật trạng thái review.')
    } catch (err) {
      setError(err.message || 'Không thể cập nhật review.')
    } finally {
      setBusy('')
    }
  }

  const deleteReview = async (review) => {
    if (!window.confirm('Xóa review này?')) return

    setBusy(`review-${review.id}`)
    setError('')
    setNotice('')
    try {
      await apiFetch(`/products/admin/reviews/${review.id}`, { method: 'DELETE', auth: true })
      setReviews((current) => current.filter((item) => item.id !== review.id))
      setNotice('Đã xóa review.')
    } catch (err) {
      setError(err.message || 'Không thể xóa review.')
    } finally {
      setBusy('')
    }
  }

  const updateArticleDraft = (articleId, field, value) => {
    setArticleDrafts((current) => ({
      ...current,
      [articleId]: {
        ...current[articleId],
        [field]: value,
      },
    }))
  }

  const createArticle = async () => {
    if (!newArticle.title.trim()) {
      setError('Tiêu đề bài viết là bắt buộc.')
      return
    }

    setBusy('create-article')
    setError('')
    setNotice('')
    try {
      const createdArticle = await apiFetch('/articles', {
        method: 'POST',
        auth: true,
        body: JSON.stringify(newArticle),
      })
      setArticles((current) => [createdArticle, ...current])
      setArticleDrafts((current) => ({ ...current, [createdArticle.id]: buildArticleDrafts([createdArticle])[createdArticle.id] }))
      setNewArticle(emptyArticleForm)
      setNotice(`Đã tạo bài viết ${createdArticle.title}.`)
    } catch (err) {
      setError(err.message || 'Không thể tạo bài viết.')
    } finally {
      setBusy('')
    }
  }

  const saveArticle = async (article) => {
    const draft = articleDrafts[article.id]
    if (!draft) return

    setBusy(`article-${article.id}`)
    setError('')
    setNotice('')
    try {
      const updatedArticle = await apiFetch(`/articles/${article.id}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(draft),
      })
      setArticles((current) => current.map((item) => (item.id === article.id ? updatedArticle : item)))
      setNotice(`Đã lưu bài viết ${updatedArticle.title}.`)
    } catch (err) {
      setError(err.message || 'Không thể lưu bài viết.')
    } finally {
      setBusy('')
    }
  }

  const deleteArticle = async (article) => {
    if (!window.confirm(`Xóa bài viết "${article.title}"?`)) return

    setBusy(`article-${article.id}`)
    setError('')
    setNotice('')
    try {
      await apiFetch(`/articles/${article.id}`, { method: 'DELETE', auth: true })
      setArticles((current) => current.filter((item) => item.id !== article.id))
      setNotice('Đã xóa bài viết.')
    } catch (err) {
      setError(err.message || 'Không thể xóa bài viết.')
    } finally {
      setBusy('')
    }
  }

  const updateSettingsDraft = (section, field, value) => {
    setSettingsDraft((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }))
  }

  const saveSettings = async () => {
    setBusy('settings')
    setError('')
    setNotice('')
    try {
      const updatedSettings = await apiFetch('/settings/checkout', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({
          ...settingsDraft,
          shippingFees: {
            standard: Number(settingsDraft.shippingFees.standard || 0),
            express: Number(settingsDraft.shippingFees.express || 0),
          },
          taxRate: Number(settingsDraft.taxRate || 0),
        }),
      })
      setSettingsDraft(updatedSettings)
      setNotice('Đã lưu cấu hình thanh toán và vận chuyển.')
    } catch (err) {
      setError(err.message || 'Không thể lưu settings.')
    } finally {
      setBusy('')
    }
  }

  const handleProductDetailSave = async () => {
    if (!editingProduct.name?.trim() || !Number(editingProduct.price)) {
      setError('Tên sản phẩm và giá là bắt buộc.')
      return
    }

    setBusy('detail-save')
    setError('')
    setNotice('')
    try {
      let savedProduct;
      const productBody = {
        name: editingProduct.name.trim(),
        sku: editingProduct.sku?.trim() || undefined,
        brand: editingProduct.brand?.trim() || 'AEROTEC',
        price: Number(editingProduct.price || 0),
        stock: Number(editingProduct.stock || 0),
        description: editingProduct.description?.trim() || undefined,
        categoryId: editingProduct.categoryId ? Number(editingProduct.categoryId) : undefined,
        isActive: editingProduct.isActive !== false,
      };

      if (isCreatingProduct) {
        savedProduct = await apiFetch('/products', {
          method: 'POST',
          auth: true,
          body: JSON.stringify(productBody),
        })
      } else {
        savedProduct = await apiFetch(`/products/${editingProduct.id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify(productBody),
        })
      }

      if (productImageFile) {
        const formData = new FormData()
        formData.append('image', productImageFile)
        savedProduct = await apiFetch(`/products/${savedProduct.id}/images`, {
          method: 'POST',
          auth: true,
          body: formData,
        })
      }

      await loadAdminData()
      setNotice(isCreatingProduct ? `Đã tạo sản phẩm ${savedProduct.name} thành công.` : `Đã lưu sản phẩm ${savedProduct.name} thành công.`)
      setProductModalOpen(false)
      setEditingProduct(null)
      setProductImageFile(null)
    } catch (err) {
      setError(err.message || 'Không thể lưu thông tin chi tiết sản phẩm.')
    } finally {
      setBusy('')
    }
  }

  const handleArticleDetailSave = async () => {
    if (!editingArticle.title?.trim()) {
      setError('Tiêu đề bài viết là bắt buộc.')
      return
    }

    setBusy('detail-save')
    setError('')
    setNotice('')
    try {
      let savedArticle;
      let imageUrl = editingArticle.image;

      if (articleImageFile) {
        const formData = new FormData()
        formData.append('image', articleImageFile)
        const uploadResult = await apiFetch('/articles/upload', {
          method: 'POST',
          auth: true,
          body: formData,
        })
        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      const articleBody = {
        title: editingArticle.title.trim(),
        subtitle: editingArticle.subtitle?.trim() || '',
        category: editingArticle.category?.trim() || 'Kỹ thuật',
        readTime: editingArticle.readTime?.trim() || '5 phút đọc',
        date: editingArticle.date?.trim() || new Intl.DateTimeFormat('vi-VN').format(new Date()),
        author: editingArticle.author?.trim() || 'AEROTEC Editorial',
        image: imageUrl || undefined,
        synopsis: editingArticle.synopsis?.trim() || '',
        content: editingArticle.content?.trim() || '',
        isPublished: editingArticle.isPublished !== false,
      };

      if (isCreatingArticle) {
        savedArticle = await apiFetch('/articles', {
          method: 'POST',
          auth: true,
          body: JSON.stringify(articleBody),
        })
      } else {
        savedArticle = await apiFetch(`/articles/${editingArticle.id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify(articleBody),
        })
      }

      await loadAdminData()
      setNotice(isCreatingArticle ? `Đã tạo bài viết ${savedArticle.title} thành công.` : `Đã lưu bài viết ${savedArticle.title} thành công.`)
      setArticleModalOpen(false)
      setEditingArticle(null)
      setArticleImageFile(null)
    } catch (err) {
      setError(err.message || 'Không thể lưu thông tin chi tiết bài viết.')
    } finally {
      setBusy('')
    }
  }

  const handleHomepageSave = async () => {
    setBusy('homepage-save')
    setError('')
    setNotice('')
    try {
      let imageUrl = homepageSettings.heroImage;

      if (articleImageFile) {
        const formData = new FormData()
        formData.append('image', articleImageFile)
        const uploadResult = await apiFetch('/articles/upload', {
          method: 'POST',
          auth: true,
          body: formData,
        })
        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      const updatedSettings = await apiFetch('/settings/homepage', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({
          ...homepageSettings,
          heroImage: imageUrl,
        }),
      })

      setHomepageSettings(updatedSettings)
      setNotice('Đã lưu cấu hình Trang chủ thành công.')
      setArticleImageFile(null)
    } catch (err) {
      setError(err.message || 'Không thể lưu cấu hình Trang chủ.')
    } finally {
      setBusy('')
    }
  }

  const handleToggleFeaturedProduct = (productId) => {
    const currentIds = homepageSettings.featuredProductIds || []
    if (currentIds.includes(productId)) {
      setHomepageSettings(curr => ({
        ...curr,
        featuredProductIds: currentIds.filter(id => id !== productId)
      }))
    } else {
      if (currentIds.length >= 3) {
        setError('Chỉ được chọn tối đa 3 sản phẩm nổi bật.')
        return
      }
      setHomepageSettings(curr => ({
        ...curr,
        featuredProductIds: [...currentIds, productId]
      }))
    }
  }

  const handleAddFilter = () => {
    if (!newFilterLabel.trim() || !newFilterKey.trim()) {
      setError('Vui lòng điền đầy đủ Tên bộ lọc và Từ khóa.')
      return
    }
    const key = newFilterKey.trim().toLowerCase()
    const label = newFilterLabel.trim()
    const currentFilters = homepageSettings.materialFilters || []
    if (currentFilters.some(f => f.key === key)) {
      setError(`Từ khóa bộ lọc "${key}" đã tồn tại.`)
      return
    }
    setHomepageSettings(curr => ({
      ...curr,
      materialFilters: [...currentFilters, { label, key }]
    }))
    setNewFilterLabel('')
    setNewFilterKey('')
    setError('')
    setNotice('Đã thêm bộ lọc mới vào danh sách (cần bấm Lưu cấu hình để lưu lại).')
  }

  const handleDeleteFilter = (key) => {
    setHomepageSettings(curr => ({
      ...curr,
      materialFilters: (curr.materialFilters || []).filter(f => f.key !== key)
    }))
    setNotice('Đã xóa bộ lọc khỏi danh sách tạm (cần bấm Lưu cấu hình để lưu lại).')
  }

  const renderShell = (content) => (
    <Box className="car-site" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Admin Isolated Header */}
      <Box className="topbar">
        <Container maxWidth="xl" className="nav-inner" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            className="brand-mark"
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
          >
            <span style={{ fontSize: 24, fontWeight: 950, letterSpacing: '1.5px', color: '#fff', lineHeight: 1 }}>
              AEROTEC
            </span>
            <small style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', fontWeight: 800, color: '#fb7185', letterSpacing: '1px', marginTop: '4px' }}>
              ADMIN CONSOLE
            </small>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {user && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', display: { xs: 'none', sm: 'flex' } }}>
                <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 800 }}>
                  {user.fullName || 'Quản trị viên'}
                </Typography>
                <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                  {user.email} (Role: {user.role || 'admin'})
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                className="outline-button"
                startIcon={<HomeIcon />}
                onClick={() => onNavigate('home')}
                sx={{ minHeight: '38px !important', paddingInline: '16px !important', fontSize: '12px !important' }}
              >
                Về trang khách
              </Button>
              {user && (
                <Button
                  className="pulse-button"
                  startIcon={<LogoutIcon />}
                  onClick={onLogout}
                  sx={{ minHeight: '38px !important', paddingInline: '16px !important', fontSize: '12px !important' }}
                >
                  Đăng xuất
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Admin Page Content */}
      <Container maxWidth="xl" className="admin-page" sx={{ flexGrow: 1, pt: '110px', pb: '80px' }}>
        {content}
      </Container>

      {/* Admin Isolated Footer */}
      <footer style={{ padding: '30px 0', background: '#070707', borderTop: '1px solid rgba(248,250,252,0.06)', marginTop: 'auto' }}>
        <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { sm: 'row', xs: 'column' }, gap: 2 }}>
          <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontFamily: 'JetBrains Mono', letterSpacing: '0.5px' }}>
            © 2026 AEROTEC PERFORMANCE // HỆ THỐNG QUẢN TRỊ NỘI BỘ.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontFamily: 'JetBrains Mono' }} className="footer-bottom-meta">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home') }}>Về Trang Khách</a>
          </Box>
        </Container>
      </footer>
    </Box>
  )

  if (!user) {
    return renderShell(
      <Box className="admin-guard">
        <Chip className="scarlet-chip" label="Admin" />
        <Typography component="h1">Cần đăng nhập quản trị</Typography>
        <Typography>Đăng nhập bằng tài khoản admin để truy cập bảng điều khiển.</Typography>
        <Button className="pulse-button" onClick={onOpenLogin}>Đăng nhập</Button>
      </Box>,
    )
  }

  if (!isAdmin) {
    return renderShell(
      <Box className="admin-guard">
        <Chip className="scarlet-chip" label="Quyền truy cập" />
        <Typography component="h1">Tài khoản này không có quyền admin</Typography>
        <Typography>Trang admin chỉ dành cho tài khoản có role admin.</Typography>
        <Button className="outline-button" onClick={() => onNavigate('home')}>Về trang chủ</Button>
      </Box>,
    )
  }

  return renderShell(
    <>
      <Box className="admin-hero">
        <Box>
          <Chip className="scarlet-chip" label="Admin Console" />
          <Typography component="h1">Bảng Điều Khiển Quản Trị</Typography>
          <Typography>Quản lý đơn hàng, tồn kho, sản phẩm và người dùng trong một nơi.</Typography>
        </Box>
        <Button className="outline-button" onClick={loadAdminData} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </Button>
      </Box>

      {(notice || error) && (
        <Box sx={{ mb: 2 }}>
          {notice && <Alert severity="success">{notice}</Alert>}
          {error && <Alert severity="error" sx={{ mt: notice ? 1 : 0 }}>{error}</Alert>}
        </Box>
      )}

      <Box className="admin-layout">
        <Box className="admin-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                type="button"
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </Box>

        <Box className="admin-panel">
          {activeTab === 'overview' && (
            <>
              {/* Bento Grid Modules */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { md: 'repeat(3, 1fr)', sm: 'repeat(2, 1fr)', xs: '1fr' },
                  gap: 3,
                  mb: 4,
                }}
              >
                {/* 1. SALES & ORDERS MODULE */}
                <Box className="admin-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <ReceiptLongIcon sx={{ color: '#fb7185' }} />
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>Đơn hàng & Doanh thu</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px' }}>Doanh thu đã thu:</Typography>
                        <Typography sx={{ color: '#fb7185', fontWeight: 'bold', fontSize: '13px' }}>{formatMoney(metrics.revenue)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px' }}>Tổng số đơn:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>{metrics.orderCount} đơn</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px' }}>Đang chờ duyệt:</Typography>
                        <Typography sx={{ color: metrics.pendingCount > 0 ? '#e11d48' : '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                          {metrics.pendingCount} đơn
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      className="outline-button"
                      onClick={() => setActiveTab('orders')}
                      sx={{ flex: 1, minHeight: '36px !important', py: '6px !important', fontSize: '11px !important' }}
                    >
                      Đơn hàng
                    </Button>
                    <Button
                      className="outline-button"
                      onClick={() => setActiveTab('revenue')}
                      sx={{ flex: 1, minHeight: '36px !important', py: '6px !important', fontSize: '11px !important' }}
                    >
                      Báo cáo Doanh số
                    </Button>
                  </Box>
                </Box>

                {/* 2. PRODUCTS & INVENTORY MODULE */}
                <Box className="admin-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Inventory2Icon sx={{ color: '#fb7185' }} />
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>Sản phẩm & Tồn kho</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px' }}>Tổng số sản phẩm:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>{metrics.productCount} SKU</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px' }}>Sắp hết hàng (&le;3):</Typography>
                        <Typography sx={{ color: metrics.lowStockCount > 0 ? '#e11d48' : '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                          {metrics.lowStockCount} sản phẩm
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                      className="outline-button"
                      onClick={() => setActiveTab('products')}
                      sx={{ flex: 1, minHeight: '36px !important', py: '6px !important', fontSize: '11px !important' }}
                    >
                      Sản phẩm
                    </Button>
                    <Button
                      className="outline-button"
                      onClick={() => { setActiveTab('system-cms'); setCmsSubTab('categories'); }}
                      sx={{ flex: 1, minHeight: '36px !important', py: '6px !important', fontSize: '11px !important' }}
                    >
                      Danh mục CMS
                    </Button>
                  </Box>
                </Box>

                {/* 3. HOMEPAGE CMS MODULE */}
                <Box className="admin-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <HomeIcon sx={{ color: '#fb7185' }} />
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>CMS Trang chủ</Typography>
                    </Box>
                    <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', lineHeight: 1.5, mb: 2 }}>
                      Biên tập tiêu đề banner, hình nền trang chủ, và nội dung/mô tả của các đối tác kỹ thuật.
                    </Typography>
                  </Box>
                  <Button
                    className="outline-button"
                    onClick={() => { setActiveTab('system-cms'); setCmsSubTab('homepage'); }}
                    sx={{ alignSelf: 'stretch', minHeight: '36px !important', py: '6px !important', fontSize: '12px !important' }}
                  >
                    Thiết lập Trang chủ
                  </Button>
                </Box>

                {/* 4. NEWS CMS MODULE */}
                <Box className="admin-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <ArticleIcon sx={{ color: '#fb7185' }} />
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>CMS Tin tức & Kỹ thuật</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px' }}>Tổng số bài viết:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>{metrics.articleCount} bài</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Button
                    className="outline-button"
                    onClick={() => setActiveTab('content')}
                    sx={{ alignSelf: 'stretch', minHeight: '36px !important', py: '6px !important', fontSize: '12px !important' }}
                  >
                    Biên tập Bài viết
                  </Button>
                </Box>

                {/* 5. REVIEWS MODULE */}
                <Box className="admin-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <StarIcon sx={{ color: '#fb7185' }} />
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>Đánh giá & Phản hồi</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px' }}>Tổng số lượt đánh giá:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>{metrics.reviewCount} review</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Button
                    className="outline-button"
                    onClick={() => setActiveTab('reviews')}
                    sx={{ alignSelf: 'stretch', minHeight: '36px !important', py: '6px !important', fontSize: '12px !important' }}
                  >
                    Duyệt Đánh giá
                  </Button>
                </Box>

                {/* 6. SETTINGS & SHOP PROFILE */}
                <Box className="admin-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <SettingsIcon sx={{ color: '#fb7185' }} />
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>Cấu hình hệ thống</Typography>
                    </Box>
                    <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', lineHeight: 1.5, mb: 2 }}>
                      Quản lý phương thức thanh toán, biểu phí giao hàng tiêu chuẩn/hỏa tốc, thuế VAT và thông tin tài khoản chuyển khoản ngân hàng.
                    </Typography>
                  </Box>
                  <Button
                    className="outline-button"
                    onClick={() => setActiveTab('settings')}
                    sx={{ alignSelf: 'stretch', minHeight: '36px !important', py: '6px !important', fontSize: '12px !important' }}
                  >
                    Thiết lập Cửa hàng
                  </Button>
                </Box>

                {/* 7. USERS MODULE */}
                <Box className="admin-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gridColumn: { md: 'span 3', sm: 'span 2', xs: 'span 1' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PeopleIcon sx={{ color: '#fb7185' }} />
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>Tài khoản người dùng</Typography>
                    </Box>
                    <Typography sx={{ color: '#fb7185', fontWeight: 'bold', fontSize: '14px' }}>{metrics.userCount} thành viên đã đăng ký</Typography>
                  </Box>
                  <Button
                    className="outline-button"
                    onClick={() => setActiveTab('users')}
                    sx={{ alignSelf: 'flex-start', minHeight: '36px !important', px: '24px !important', fontSize: '12px !important' }}
                  >
                    Quản lý Thành viên
                  </Button>
                </Box>
              </Box>

              <Box className="admin-split">
                <Box className="admin-card">
                  <Typography component="h2">Đơn hàng mới</Typography>
                  {orders.slice(0, 5).map((order) => (
                    <div className="admin-list-row" key={order.id}>
                      <span>{order.orderNumber}</span>
                      <em>{statusLabel(ORDER_STATUSES, order.status)}</em>
                      <strong>{formatMoney(order.total)}</strong>
                    </div>
                  ))}
                </Box>
                <Box className="admin-card">
                  <Typography component="h2">Tồn kho thấp</Typography>
                  {products.filter((product) => Number(product.stock || 0) <= 3).slice(0, 5).map((product) => (
                    <div className="admin-list-row" key={product.id}>
                      <span>{product.name}</span>
                      <em>SKU {product.sku || product.id}</em>
                      <strong>{Number(product.stock || 0)}</strong>
                    </div>
                  ))}
                </Box>
              </Box>
            </>
          )}

          {activeTab === 'orders' && (
            <Box className="admin-table-card">
              <Box className="admin-section-heading">
                <Typography component="h2">Quản lý đơn hàng</Typography>
                <Chip label={`${orders.length} đơn`} />
              </Box>
              <div className="admin-table orders">
                <div className="admin-table-head">
                  <span>Mã đơn</span>
                  <span>Khách hàng</span>
                  <span>Trạng thái</span>
                  <span>Thanh toán</span>
                  <span>Tổng tiền</span>
                  <span>Ngày tạo</span>
                  <span>Hành động</span>
                </div>
                {orders.map((order) => (
                  <div className="admin-table-row" key={order.id}>
                    <span>
                      <strong>{order.orderNumber}</strong>
                      <small>{order.items?.length || 0} sản phẩm</small>
                    </span>
                    <span>{order.guestEmail || `User #${order.userId}`}</span>
                    <span>
                      <Chip
                        label={orderStatusStyles[order.status]?.label || order.status}
                        sx={{
                          color: orderStatusStyles[order.status]?.color || '#fff',
                          bgcolor: orderStatusStyles[order.status]?.bg || 'rgba(255,255,255,0.06)',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          height: '24px',
                        }}
                      />
                    </span>
                    <span>
                      <Chip
                        label={paymentStatusStyles[order.paymentStatus]?.label || order.paymentStatus}
                        sx={{
                          color: paymentStatusStyles[order.paymentStatus]?.color || '#fff',
                          bgcolor: paymentStatusStyles[order.paymentStatus]?.bg || 'rgba(255,255,255,0.06)',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          height: '24px',
                        }}
                      />
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{formatMoney(order.total)}</span>
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="admin-row-actions">
                      <Button
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleOpenOrderDetail(order)}
                        sx={{ fontSize: '11px !important', px: '12px !important', minHeight: '30px !important' }}
                      >
                        Xem & Xử lý
                      </Button>
                    </span>
                  </div>
                ))}
              </div>
            </Box>
          )}

          {activeTab === 'system-cms' && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Horizontal Sub-tabs Navigation */}
              <Box sx={{ display: 'flex', gap: 1, borderBottom: '1px solid rgba(248, 250, 252, 0.08)', pb: 1, overflowX: 'auto' }}>
                {[
                  { id: 'homepage', label: 'Cấu hình Trang chủ' },
                  { id: 'categories', label: 'Danh mục Sản phẩm' },
                  { id: 'featured', label: 'Sản phẩm nổi bật' },
                  { id: 'filters', label: 'Cấu hình Bộ lọc' },
                ].map((sub) => (
                  <Button
                    key={sub.id}
                    onClick={() => { setCmsSubTab(sub.id); setError(''); setNotice(''); }}
                    sx={{
                      color: cmsSubTab === sub.id ? '#fb7185' : 'rgba(248, 250, 252, 0.5)',
                      borderBottom: cmsSubTab === sub.id ? '2px solid #fb7185' : '2px solid transparent',
                      borderRadius: 0,
                      fontWeight: 800,
                      px: 3,
                      py: 1.5,
                      fontSize: '13px',
                      textTransform: 'none',
                      '&:hover': {
                        color: '#fb7185',
                        background: 'rgba(251, 113, 133, 0.04)',
                      }
                    }}
                  >
                    {sub.label}
                  </Button>
                ))}
              </Box>

              {/* Sub-tab 1: homepage */}
              {cmsSubTab === 'homepage' && (
                <Box className="admin-card">
                  <Box className="admin-section-heading">
                    <Typography component="h2">Cấu hình Trang chủ</Typography>
                    <Button
                      className="pulse-button small"
                      startIcon={<SaveIcon />}
                      disabled={busy === 'homepage-save'}
                      onClick={handleHomepageSave}
                    >
                      Lưu cấu hình
                    </Button>
                  </Box>

                  <Box sx={{ display: 'grid', gap: 3, mt: 2 }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>1. Hero Banner chính</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 2 }}>
                      <TextField
                        label="Khẩu hiệu phụ (Subtitle)"
                        value={homepageSettings.heroSubtitle}
                        onChange={(e) => setHomepageSettings(curr => ({ ...curr, heroSubtitle: e.target.value }))}
                        fullWidth
                      />
                      <TextField
                        label="Tiêu đề chính (Title - Dùng \\n để ngắt dòng)"
                        value={homepageSettings.heroTitle}
                        onChange={(e) => setHomepageSettings(curr => ({ ...curr, heroTitle: e.target.value }))}
                        fullWidth
                      />
                    </Box>
                    <TextField
                      label="Mô tả chi tiết Hero"
                      value={homepageSettings.heroText}
                      onChange={(e) => setHomepageSettings(curr => ({ ...curr, heroText: e.target.value }))}
                      multiline
                      minRows={3}
                      fullWidth
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '120px 1fr', xs: '1fr' }, gap: 3, alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', mb: 1 }}>Ảnh nền hiện tại:</Typography>
                        {homepageSettings.heroImage ? (
                          <img src={homepageSettings.heroImage} alt="Hero banner" style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.1)' }} />
                        ) : (
                          <Typography sx={{ color: '#fff', fontSize: '12px', fontStyle: 'italic' }}>Mặc định</Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', mb: 1 }}>Tải lên ảnh nền mới (Thay thế):</Typography>
                        <Button component="label" className="outline-button" startIcon={<UploadIcon />}>
                          Chọn ảnh nền banner
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setArticleImageFile(e.target.files[0]);
                              }
                            }}
                          />
                        </Button>
                        {articleImageFile && (
                          <Typography sx={{ color: '#fb7185', fontSize: '12px', mt: 1 }}>
                            Sẵn sàng tải lên: {articleImageFile.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: 'rgba(248,250,252,0.08)' }} />

                    <Typography variant="h6" sx={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>2. Mô tả Đối tác kỹ thuật (Technical Partners)</Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <TextField
                        label="BREMBO Subtitle"
                        value={homepageSettings.partnerBremboDesc}
                        onChange={(e) => setHomepageSettings(curr => ({ ...curr, partnerBremboDesc: e.target.value }))}
                        fullWidth
                      />
                      <TextField
                        label="MICHELIN Subtitle"
                        value={homepageSettings.partnerMichelinDesc}
                        onChange={(e) => setHomepageSettings(curr => ({ ...curr, partnerMichelinDesc: e.target.value }))}
                        fullWidth
                      />
                      <TextField
                        label="ÖHLINS Subtitle"
                        value={homepageSettings.partnerOhlinsDesc}
                        onChange={(e) => setHomepageSettings(curr => ({ ...curr, partnerOhlinsDesc: e.target.value }))}
                        fullWidth
                      />
                      <TextField
                        label="RECARO Subtitle"
                        value={homepageSettings.partnerRecaroDesc}
                        onChange={(e) => setHomepageSettings(curr => ({ ...curr, partnerRecaroDesc: e.target.value }))}
                        fullWidth
                      />
                      <TextField
                        label="ALCANTARA Subtitle"
                        value={homepageSettings.partnerAlcantaraDesc}
                        onChange={(e) => setHomepageSettings(curr => ({ ...curr, partnerAlcantaraDesc: e.target.value }))}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Sub-tab 2: categories */}
              {cmsSubTab === 'categories' && (
                <Box className="admin-table-card">
                  <Box className="admin-section-heading">
                    <Typography component="h2">Quản lý danh mục CMS</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Button
                        className="pulse-button small"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateCategory}
                      >
                        Tạo danh mục mới
                      </Button>
                      <Chip label={`${categories.length} danh mục`} />
                    </Box>
                  </Box>
                  <div className="admin-table categories">
                    <div className="admin-table-head">
                      <span>Mã ID</span>
                      <span>Tên danh mục</span>
                      <span>Slug</span>
                      <span>Mô tả</span>
                      <span>Trạng thái</span>
                      <span>Hành động</span>
                    </div>
                    {categories.map((cat) => (
                      <div className="admin-table-row" key={cat.id}>
                        <span><strong>#{cat.id}</strong></span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{cat.name}</span>
                        <span><code>{cat.slug || '-'}</code></span>
                        <span style={{ color: 'rgba(248,250,252,0.6)', fontSize: '13px' }}>{cat.description || '-'}</span>
                        <span>
                          <Chip
                            label={cat.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                            color={cat.isActive !== false ? 'success' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </span>
                        <span className="admin-row-actions">
                          <Button
                            startIcon={<SettingsIcon />}
                            onClick={() => handleOpenEditCategory(cat)}
                          >
                            Sửa
                          </Button>
                          <Button
                            startIcon={<DeleteIcon />}
                            disabled={busy === `category-${cat.id}`}
                            onClick={() => deleteCategory(cat)}
                          >
                            Xóa
                          </Button>
                        </span>
                      </div>
                    ))}
                  </div>
                </Box>
              )}

              {/* Sub-tab 3: featured */}
              {cmsSubTab === 'featured' && (
                <Box className="admin-card">
                  <Box className="admin-section-heading">
                    <Box>
                      <Typography component="h2">Sản phẩm nổi bật (Phụ tùng thịnh hành)</Typography>
                      <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '13px', mt: 0.5 }}>
                        Chọn tối đa 3 sản phẩm để hiển thị ở trang chủ. Đã chọn: <strong>{homepageSettings.featuredProductIds?.length || 0} / 3</strong>
                      </Typography>
                    </Box>
                    <Button
                      className="pulse-button small"
                      startIcon={<SaveIcon />}
                      disabled={busy === 'homepage-save'}
                      onClick={handleHomepageSave}
                    >
                      Lưu cấu hình
                    </Button>
                  </Box>

                  <Box sx={{ mt: 2, mb: 3 }}>
                    <TextField
                      label="Tìm kiếm sản phẩm..."
                      value={featuredSearch}
                      onChange={(e) => setFeaturedSearch(e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <div className="admin-table products">
                    <div className="admin-table-head">
                      <span>Chọn</span>
                      <span>Sản phẩm</span>
                      <span>SKU</span>
                      <span>Thương hiệu</span>
                      <span>Giá</span>
                      <span>Trạng thái</span>
                    </div>
                    {products
                      .filter((p) => {
                        if (!featuredSearch.trim()) return true;
                        const kw = featuredSearch.toLowerCase();
                        return (
                          p.name?.toLowerCase().includes(kw) ||
                          p.sku?.toLowerCase().includes(kw) ||
                          p.brand?.toLowerCase().includes(kw)
                        );
                      })
                      .map((product) => {
                        const isChecked = (homepageSettings.featuredProductIds || []).includes(product.id);
                        const disabled = !isChecked && (homepageSettings.featuredProductIds || []).length >= 3;
                        const primaryImg = getPrimaryImage(product);
                        return (
                          <div className="admin-table-row" key={product.id} style={{ opacity: disabled ? 0.5 : 1 }}>
                            <span>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={disabled}
                                onChange={() => handleToggleFeaturedProduct(product.id)}
                                style={{ width: 18, height: 18, cursor: disabled ? 'not-allowed' : 'pointer' }}
                              />
                            </span>
                            <span className="admin-product-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {primaryImg ? (
                                <img src={primaryImg} alt={product.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.1)' }} />
                              ) : (
                                <Box sx={{ width: 44, height: 44, background: 'rgba(248,250,252,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(248,250,252,0.1)' }}>
                                  <Inventory2Icon sx={{ color: 'rgba(248,250,252,0.3)' }} />
                                </Box>
                              )}
                              <strong style={{ color: '#fff', fontSize: '14px' }}>{product.name}</strong>
                            </span>
                            <span>{product.sku || '-'}</span>
                            <span>{product.brand || 'AEROTEC'}</span>
                            <span>{formatMoney(product.price)}</span>
                            <span>
                              <Chip
                                label={product.isActive !== false ? 'Đang bán' : 'Ẩn'}
                                color={product.isActive !== false ? 'success' : 'warning'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </Box>
              )}

              {/* Sub-tab 4: filters */}
              {cmsSubTab === 'filters' && (
                <Box className="admin-card">
                  <Box className="admin-section-heading">
                    <Typography component="h2">Cấu hình Bộ lọc Vật liệu</Typography>
                    <Button
                      className="pulse-button small"
                      startIcon={<SaveIcon />}
                      disabled={busy === 'homepage-save'}
                      onClick={handleHomepageSave}
                    >
                      Lưu cấu hình
                    </Button>
                  </Box>

                  <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { sm: '1fr 1fr auto', xs: '1fr' }, gap: 2, alignItems: 'end', p: 2, bgcolor: 'rgba(248,250,252,0.02)', borderRadius: '6px', border: '1px solid rgba(248,250,252,0.06)' }}>
                    <TextField
                      label="Tên hiển thị bộ lọc (e.g. Carbon Fiber)"
                      value={newFilterLabel}
                      onChange={(e) => setNewFilterLabel(e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Từ khóa tìm kiếm trong vật liệu (e.g. carbon)"
                      value={newFilterKey}
                      onChange={(e) => setNewFilterKey(e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      className="pulse-button small"
                      startIcon={<AddIcon />}
                      onClick={handleAddFilter}
                      sx={{ height: 40 }}
                    >
                      Thêm bộ lọc
                    </Button>
                  </Box>

                  <div className="admin-table" style={{ marginTop: '24px' }}>
                    <div className="admin-table-head">
                      <span>Tên hiển thị (Label)</span>
                      <span>Từ khóa tìm kiếm (Key)</span>
                      <span>Hành động</span>
                    </div>
                    {(homepageSettings.materialFilters || []).map((filter) => (
                      <div className="admin-table-row" key={filter.key}>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{filter.label}</span>
                        <span><code>{filter.key}</code></span>
                        <span>
                          <Button
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteFilter(filter.key)}
                            sx={{ color: '#fb7185', '&:hover': { color: '#e11d48' } }}
                          >
                            Xóa
                          </Button>
                        </span>
                      </div>
                    ))}
                    {(homepageSettings.materialFilters || []).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(248,250,252,0.4)' }}>
                        Chưa có bộ lọc vật liệu nào được định nghĩa.
                      </div>
                    )}
                  </div>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 'revenue' && (
            <Box sx={{ display: 'grid', gap: 3.5 }}>
              {/* Row of 4 Bento boxes for key metrics */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(4, 1fr)', sm: 'repeat(2, 1fr)', xs: '1fr' }, gap: 3 }}>
                {[
                  { label: 'Doanh thu (Paid)', val: formatMoney(revenueData.totalRevenue), desc: 'Đã thanh toán thực tế', color: '#10b981' },
                  { label: 'Số đơn thành công', val: `${revenueData.totalOrdersCount} đơn`, desc: 'Đơn hàng hoàn tất thanh toán', color: '#38bdf8' },
                  { label: 'Giá trị trung bình (AOV)', val: formatMoney(revenueData.averageOrderValue), desc: 'Doanh thu trung bình trên mỗi đơn', color: '#fb7185' },
                  { label: 'Tỷ lệ chuyển đổi', val: `${revenueData.conversionRate.toFixed(1)}%`, desc: 'Số đơn trên số thành viên', color: '#c084fc' }
                ].map((item, idx) => (
                  <Box key={idx} className="outer-shell" sx={{ p: '5px', borderRadius: '16px', background: 'rgba(248, 250, 252, 0.03)', border: '1px solid rgba(248, 250, 252, 0.05)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', '&:hover': { transform: 'translateY(-2px)', borderColor: 'rgba(251, 113, 133, 0.22)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' } }}>
                    <Box className="inner-core" sx={{ p: 2.5, borderRadius: '12px', background: '#0c0c0d', border: '1px solid rgba(251, 113, 133, 0.04)', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h4" sx={{ color: item.color, fontWeight: 950, fontSize: '24px', fontFamily: 'Be Vietnam Pro', my: 0.5 }}>
                        {item.val}
                      </Typography>
                      <Typography sx={{ color: 'rgba(248, 250, 252, 0.35)', fontSize: '11px' }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Large Bento Box for SVG Chart */}
              <Box className="outer-shell" sx={{ p: '6px', borderRadius: '20px', background: 'rgba(248, 250, 252, 0.03)', border: '1px solid rgba(248, 250, 252, 0.05)', position: 'relative' }}>
                <Box className="inner-core" sx={{ p: 3, borderRadius: '15px', background: '#0c0c0d', border: '1px solid rgba(251, 113, 133, 0.04)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 950, fontFamily: 'Be Vietnam Pro', fontSize: '18px' }}>
                        Báo cáo Doanh số & Telemetry dòng tiền
                      </Typography>
                      <Typography sx={{ color: 'rgba(248, 250, 252, 0.4)', fontSize: '12px', mt: 0.5 }}>
                        Dữ liệu biểu đồ biến động doanh thu kết hợp baseline phân tích xu hướng
                      </Typography>
                    </Box>

                    {/* Time Range Selector */}
                    <Box sx={{ display: 'flex', gap: 1, p: '4px', bgcolor: 'rgba(248, 250, 252, 0.03)', borderRadius: '99px', border: '1px solid rgba(248, 250, 252, 0.06)' }}>
                      {[
                        { id: 'week', label: '7 Ngày' },
                        { id: 'month', label: '30 Ngày' },
                        { id: 'year', label: '12 Tháng' }
                      ].map((range) => (
                        <Button
                          key={range.id}
                          onClick={() => { setRevenueRange(range.id); setHoveredChartPoint(null); }}
                          sx={{
                            color: revenueRange === range.id ? '#fff' : 'rgba(248, 250, 252, 0.5)',
                            backgroundImage: revenueRange === range.id ? 'linear-gradient(135deg, #f43f5e, #f97316)' : 'none',
                            borderRadius: '99px',
                            px: 3,
                            py: 0.75,
                            fontSize: '11px',
                            fontWeight: 900,
                            textTransform: 'none',
                            minWidth: '70px',
                            minHeight: '28px !important',
                            '&:hover': {
                              color: '#fff',
                              opacity: 0.9
                            }
                          }}
                        >
                          {range.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* SVG Chart Rendering */}
                  {(() => {
                    const padding = { left: 60, right: 30, top: 20, bottom: 40 }
                    const width = 800
                    const height = 300
                    const activeW = width - padding.left - padding.right
                    const activeH = height - padding.top - padding.bottom

                    const maxVal = Math.max(...revenueData.chartPoints.map(p => p.value), 10000000) * 1.15

                    // Calculate Coordinates
                    const coords = revenueData.chartPoints.map((p, idx) => {
                      const x = padding.left + idx * (activeW / (revenueData.chartPoints.length - 1))
                      const y = height - padding.bottom - (p.value * (activeH / maxVal))
                      return { x, y, label: p.label, value: p.value, orderCount: p.orderCount, index: idx }
                    })

                    // Path string
                    const linePath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
                    const areaPath = coords.length > 0 ? `${linePath} L ${coords[coords.length - 1].x} ${height - padding.bottom} L ${coords[0].x} ${height - padding.bottom} Z` : ''

                    // Horizontal grid lines
                    const gridYLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
                      const y = height - padding.bottom - pct * activeH
                      const val = pct * maxVal
                      return { y, val }
                    })

                    return (
                      <Box sx={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
                        <svg width="100%" height={300} viewBox="0 0 800 300" style={{ overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {gridYLines.map((line, idx) => (
                            <g key={idx}>
                              <line
                                x1={padding.left}
                                y1={line.y}
                                x2={width - padding.right}
                                y2={line.y}
                                stroke="rgba(248, 250, 252, 0.05)"
                                strokeDasharray="4 4"
                              />
                              <text
                                x={padding.left - 10}
                                y={line.y + 4}
                                fill="rgba(248, 250, 252, 0.4)"
                                fontSize="9px"
                                fontFamily="JetBrains Mono"
                                textAnchor="end"
                              >
                                {line.val >= 1000000000 ? `${(line.val / 1000000000).toFixed(1)}B` : line.val >= 1000000 ? `${(line.val / 1000000).toFixed(0)}M` : formatMoney(line.val)}
                              </text>
                            </g>
                          ))}

                          {/* Render Filled Area */}
                          {areaPath && (
                            <path
                              d={areaPath}
                              fill="url(#revenueGrad)"
                              style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                            />
                          )}

                          {/* Render Line Path */}
                          {linePath && (
                            <path
                              d={linePath}
                              fill="none"
                              stroke="#fb7185"
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                            />
                          )}

                          {/* Data points (circles) & labels */}
                          {coords.map((c, idx) => (
                            <g key={idx}>
                              <circle
                                cx={c.x}
                                cy={c.y}
                                r={hoveredChartPoint?.index === idx ? 6 : 4}
                                fill={hoveredChartPoint?.index === idx ? '#fff' : '#fb7185'}
                                stroke="#0c0c0d"
                                strokeWidth={2}
                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredChartPoint(c)}
                                onMouseLeave={() => setHoveredChartPoint(null)}
                              />
                              <text
                                x={c.x}
                                y={height - 15}
                                fill="rgba(248, 250, 252, 0.5)"
                                fontSize="9px"
                                fontFamily="JetBrains Mono"
                                textAnchor="middle"
                              >
                                {c.label}
                              </text>
                            </g>
                          ))}
                        </svg>

                        {/* Floating Glassmorphic Tooltip */}
                        {hoveredChartPoint && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: hoveredChartPoint.y - 75,
                              left: hoveredChartPoint.x - 70,
                              pointerEvents: 'none',
                              background: 'rgba(12, 12, 13, 0.95)',
                              border: '1px solid #fb7185',
                              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
                              borderRadius: '8px',
                              px: 2,
                              py: 1,
                              zIndex: 100,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              backdropFilter: 'blur(10px)',
                              backgroundImage: 'linear-gradient(to bottom, rgba(251, 113, 133, 0.08), transparent)'
                            }}
                          >
                            <Typography sx={{ color: 'rgba(248, 250, 252, 0.4)', fontSize: '8px', fontWeight: 'bold', fontFamily: 'JetBrains Mono', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                              {hoveredChartPoint.label}
                            </Typography>
                            <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 900 }}>
                              {formatMoney(hoveredChartPoint.value)}
                            </Typography>
                            <Typography sx={{ color: '#fb7185', fontSize: '10px', fontWeight: 'bold' }}>
                              {hoveredChartPoint.orderCount} đơn hàng
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )
                  })()}
                </Box>
              </Box>

              {/* Bottom split: Category share (left) and Top products (right) */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '0.8fr 1.2fr', xs: '1fr' }, gap: 3.5 }}>
                {/* Category share card */}
                <Box className="outer-shell" sx={{ p: '5px', borderRadius: '18px', background: 'rgba(248, 250, 252, 0.03)', border: '1px solid rgba(248, 250, 252, 0.05)' }}>
                  <Box className="inner-core" sx={{ p: 3, borderRadius: '14px', background: '#0c0c0d', border: '1px solid rgba(251, 113, 133, 0.04)', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>Phân bổ theo Danh mục</Typography>
                      <Typography sx={{ color: 'rgba(248, 250, 252, 0.4)', fontSize: '11px', mt: 0.5 }}>Doanh thu đóng góp từ từng nhóm phụ tùng</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                      {revenueData.categoryShare.map((cat, idx) => {
                        const pct = revenueData.totalRevenue > 0 ? (cat.revenue / revenueData.totalRevenue) * 100 : 0
                        return (
                          <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography sx={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                                {translateCategoryName(cat.name)}
                              </Typography>
                              <Typography sx={{ color: '#fb7185', fontSize: '11px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}>
                                {pct.toFixed(1)}% ({formatMoney(cat.revenue)})
                              </Typography>
                            </Box>
                            {/* Nested concentric progress bar */}
                            <Box sx={{ width: '100%', height: '6px', bgcolor: 'rgba(248,250,252,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                              <Box sx={{ width: `${Math.max(pct, 2)}%`, height: '100%', backgroundImage: 'linear-gradient(135deg, #fb7185, #f97316)', borderRadius: '99px', transition: 'width 0.8s ease' }} />
                            </Box>
                          </Box>
                        )
                      })}
                      {revenueData.categoryShare.length === 0 && (
                        <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                          Chưa có phát sinh doanh thu.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Top Selling Products card */}
                <Box className="outer-shell" sx={{ p: '5px', borderRadius: '18px', background: 'rgba(248, 250, 252, 0.03)', border: '1px solid rgba(248, 250, 252, 0.05)' }}>
                  <Box className="inner-core" sx={{ p: 3, borderRadius: '14px', background: '#0c0c0d', border: '1px solid rgba(251, 113, 133, 0.04)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>Top 5 Sản Phẩm Bán Chạy</Typography>
                      <Typography sx={{ color: 'rgba(248, 250, 252, 0.4)', fontSize: '11px', mt: 0.5 }}>Xếp hạng theo doanh số thực tế đã thanh toán</Typography>
                    </Box>

                    <Box className="admin-table" style={{ marginTop: '12px' }}>
                      <div className="admin-table-head">
                        <span>Sản phẩm</span>
                        <span>Đã bán</span>
                        <span>Doanh thu</span>
                      </div>
                      {revenueData.topSelling.map((prod, idx) => (
                        <div className="admin-table-row" key={idx}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1.5 }}>
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.1)' }} />
                            ) : (
                              <Box sx={{ width: 32, height: 32, bgcolor: 'rgba(248,250,252,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Inventory2Icon sx={{ color: 'rgba(248,250,252,0.3)', fontSize: '14px' }} />
                              </Box>
                            )}
                            <Typography sx={{ color: '#fff', fontSize: '12.5px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                              {prod.name}
                            </Typography>
                          </span>
                          <span>
                            <Chip label={`${prod.quantity} chiếc`} size="small" sx={{ fontWeight: 'bold', fontSize: '10px', height: '20px' }} />
                          </span>
                          <span style={{ color: '#fb7185', fontWeight: 'bold', fontSize: '12.5px', textAlign: 'right' }}>
                            {formatMoney(prod.revenue)}
                          </span>
                        </div>
                      ))}
                      {revenueData.topSelling.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(248,250,252,0.4)', fontSize: '13px' }}>
                          Chưa có dữ liệu bán hàng.
                        </div>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 'products' && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Box className="admin-table-card">
                <Box className="admin-section-heading">
                  <Typography component="h2">Quản lý sản phẩm</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button
                      className="pulse-button small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setIsCreatingProduct(true)
                        setEditingProduct({
                          name: '',
                          sku: '',
                          brand: 'AEROTEC',
                          price: '',
                          stock: '',
                          description: '',
                          categoryId: '',
                          isActive: true,
                        })
                        setProductImageFile(null)
                        setProductModalOpen(true)
                      }}
                    >
                      Tạo sản phẩm mới
                    </Button>
                    <Chip label={`${products.length} sản phẩm`} />
                  </Box>
                </Box>
                <div className="admin-table products">
                  <div className="admin-table-head">
                    <span>Sản phẩm</span>
                    <span>SKU</span>
                    <span>Thương hiệu</span>
                    <span>Giá</span>
                    <span>Tồn kho</span>
                    <span>Trạng thái</span>
                    <span>Hành động</span>
                  </div>
                  {products.map((product) => {
                    const primaryImg = getPrimaryImage(product)
                    return (
                      <div className="admin-table-row" key={product.id}>
                        <span className="admin-product-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {primaryImg ? (
                            <img src={primaryImg} alt={product.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.1)' }} />
                          ) : (
                            <Box sx={{ width: 44, height: 44, background: 'rgba(248,250,252,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(248,250,252,0.1)' }}>
                              <Inventory2Icon sx={{ color: 'rgba(248,250,252,0.3)' }} />
                            </Box>
                          )}
                          <strong style={{ color: '#fff', fontSize: '14px' }}>{product.name}</strong>
                        </span>
                        <span>{product.sku || '-'}</span>
                        <span>{product.brand || 'AEROTEC'}</span>
                        <span>{formatMoney(product.price)}</span>
                        <span>
                          <Chip
                            label={product.stock ?? 0}
                            color={Number(product.stock || 0) <= 3 ? 'error' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </span>
                        <span>
                          <Chip
                            label={product.isActive !== false ? 'Đang bán' : 'Ẩn'}
                            color={product.isActive !== false ? 'success' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </span>
                        <span className="admin-row-actions">
                          <Button
                            startIcon={<SettingsIcon />}
                            onClick={() => {
                              setIsCreatingProduct(false)
                              setEditingProduct({
                                id: product.id,
                                name: product.name,
                                sku: product.sku || '',
                                brand: product.brand || 'AEROTEC',
                                price: product.price,
                                stock: product.stock,
                                description: product.description || '',
                                categoryId: product.categoryId || '',
                                isActive: product.isActive !== false,
                                imageUrl: primaryImg || '',
                              })
                              setProductImageFile(null)
                              setProductModalOpen(true)
                            }}
                          >
                            Sửa Chi Tiết
                          </Button>
                          <Button startIcon={<DeleteIcon />} disabled={busy === `product-${product.id}`} onClick={() => deleteProduct(product)}>
                            Xóa
                          </Button>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Box>
            </Box>
          )}

          {activeTab === 'reviews' && (
            <Box className="admin-table-card">
              <Box className="admin-section-heading">
                <Typography component="h2">Duyệt đánh giá</Typography>
                <Chip label={`${reviews.length} review`} />
              </Box>
              <div className="admin-table reviews">
                <div className="admin-table-head">
                  <span>ID</span>
                  <span>Sản phẩm</span>
                  <span>Khách hàng</span>
                  <span>Rating</span>
                  <span>Bình luận</span>
                  <span>Trạng thái</span>
                  <span>Hành động</span>
                </div>
                {reviews.map((review) => (
                  <div className="admin-table-row" key={review.id}>
                    <span>#{review.id}</span>
                    <span>Product #{review.productId}</span>
                    <span>{review.userEmail || `User #${review.userId}`}</span>
                    <span>{review.rating}/5</span>
                    <span>{review.comment || '-'}</span>
                    <span><Chip label={review.isVisible ? 'Đang hiện' : 'Đang ẩn'} /></span>
                    <span className="admin-row-actions">
                      <Button disabled={busy === `review-${review.id}`} onClick={() => updateReviewVisibility(review, !review.isVisible)}>
                        {review.isVisible ? 'Ẩn' : 'Hiện'}
                      </Button>
                      <Button startIcon={<DeleteIcon />} disabled={busy === `review-${review.id}`} onClick={() => deleteReview(review)}>
                        Xóa
                      </Button>
                    </span>
                  </div>
                ))}
              </div>
            </Box>
          )}

          {activeTab === 'content' && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              <Box className="admin-table-card">
                <Box className="admin-section-heading">
                  <Typography component="h2">Quản lý bài viết</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button
                      className="pulse-button small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setIsCreatingArticle(true)
                        setEditingArticle({
                          title: '',
                          subtitle: '',
                          category: 'Vật liệu',
                          readTime: '5 phút đọc',
                          date: '',
                          author: 'AEROTEC Lab',
                          image: '',
                          synopsis: '',
                          content: '',
                          isPublished: true,
                        })
                        setArticleImageFile(null)
                        setArticleModalOpen(true)
                      }}
                    >
                      Tạo bài viết mới
                    </Button>
                    <Chip label={`${articles.length} bài viết`} />
                  </Box>
                </Box>
                <div className="admin-table articles">
                  <div className="admin-table-head">
                    <span>Bài viết</span>
                    <span>Danh mục</span>
                    <span>Tác giả</span>
                    <span>Ngày đăng</span>
                    <span>Trạng thái</span>
                    <span>Hành động</span>
                  </div>
                  {articles.map((article) => {
                    return (
                      <div className="admin-table-row" key={article.id}>
                        <span className="admin-product-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {article.image ? (
                            <img src={article.image} alt={article.title} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.1)' }} />
                          ) : (
                            <Box sx={{ width: 44, height: 44, background: 'rgba(248,250,252,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(248,250,252,0.1)' }}>
                              <ArticleIcon sx={{ color: 'rgba(248,250,252,0.3)' }} />
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#fff', fontSize: '14px' }}>{article.title}</strong>
                            <small style={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px' }}>{article.subtitle}</small>
                          </Box>
                        </span>
                        <span>{article.category || 'Kỹ thuật'}</span>
                        <span>{article.author || 'AEROTEC'}</span>
                        <span>{article.date || '-'}</span>
                        <span>
                          <Chip
                            label={article.isPublished !== false ? 'Published' : 'Draft'}
                            color={article.isPublished !== false ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </span>
                        <span className="admin-row-actions">
                          <Button
                            startIcon={<SettingsIcon />}
                            onClick={() => {
                              setIsCreatingArticle(false)
                              setEditingArticle({
                                id: article.id,
                                title: article.title,
                                subtitle: article.subtitle || '',
                                category: article.category || 'Vật liệu',
                                readTime: article.readTime || '5 phút đọc',
                                date: article.date || '',
                                author: article.author || 'AEROTEC Lab',
                                image: article.image || '',
                                synopsis: article.synopsis || '',
                                content: article.content || '',
                                isPublished: article.isPublished !== false,
                              })
                              setArticleImageFile(null)
                              setArticleModalOpen(true)
                            }}
                          >
                            Sửa Chi Tiết
                          </Button>
                          <Button startIcon={<DeleteIcon />} disabled={busy === `article-${article.id}`} onClick={() => deleteArticle(article)}>
                            Xóa
                          </Button>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Box>
            </Box>
          )}



          {activeTab === 'settings' && (
            <Box className="admin-card">
              <Box className="admin-section-heading">
                <Typography component="h2">Payment / Shipping Settings</Typography>
                <Button className="pulse-button small" startIcon={<SaveIcon />} disabled={busy === 'settings'} onClick={saveSettings}>
                  Lưu settings
                </Button>
              </Box>
              <Box className="admin-settings-grid">
                <Box>
                  <Typography component="h3">Phương thức thanh toán</Typography>
                  {[
                    ['cod', 'COD'],
                    ['card', 'Stripe/card'],
                    ['bank_transfer', 'Bank transfer'],
                  ].map(([field, label]) => (
                    <label className="admin-check-row" key={field}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.paymentMethods?.[field] !== false}
                        onChange={(event) => updateSettingsDraft('paymentMethods', field, event.target.checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </Box>
                <Box>
                  <Typography component="h3">Vận chuyển & thuế</Typography>
                  <TextField
                    label="Phí tiêu chuẩn"
                    type="number"
                    value={settingsDraft.shippingFees?.standard ?? 0}
                    onChange={(event) => updateSettingsDraft('shippingFees', 'standard', event.target.value)}
                  />
                  <TextField
                    label="Phí hỏa tốc"
                    type="number"
                    value={settingsDraft.shippingFees?.express ?? 0}
                    onChange={(event) => updateSettingsDraft('shippingFees', 'express', event.target.value)}
                  />
                  <TextField
                    label="VAT rate"
                    type="number"
                    value={settingsDraft.taxRate ?? 0}
                    onChange={(event) => setSettingsDraft((current) => ({ ...current, taxRate: event.target.value }))}
                  />
                </Box>
                <Box>
                  <Typography component="h3">Bank transfer</Typography>
                  {[
                    ['bankName', 'Ngân hàng'],
                    ['bankFullName', 'Tên đầy đủ'],
                    ['bankBin', 'Bank BIN'],
                    ['accountNumber', 'Số tài khoản'],
                    ['accountName', 'Chủ tài khoản'],
                  ].map(([field, label]) => (
                    <TextField
                      key={field}
                      label={label}
                      value={settingsDraft.bankTransfer?.[field] || ''}
                      onChange={(event) => updateSettingsDraft('bankTransfer', field, event.target.value)}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 'users' && (
            <Box className="admin-table-card">
              <Box className="admin-section-heading">
                <Typography component="h2">Người dùng</Typography>
                <Chip label={`${users.length} tài khoản`} />
              </Box>
              <div className="admin-table users">
                <div className="admin-table-head">
                  <span>ID</span>
                  <span>Email</span>
                  <span>Họ tên</span>
                  <span>Role</span>
                  <span>Ngày tạo</span>
                </div>
                {users.map((account) => (
                  <div className="admin-table-row" key={account.id}>
                    <span>#{account.id}</span>
                    <span>{account.email}</span>
                    <span>{account.fullName || '-'}</span>
                    <span><Chip label={account.role || 'user'} /></span>
                    <span>{formatDate(account.createdAt)}</span>
                  </div>
                ))}
              </div>
            </Box>
          )}

          {activeTab === 'support-tickets' && (
            <Box className="admin-table-card">
              <Box className="admin-section-heading" sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography component="h2">Yêu Cầu Hỗ Trợ</Typography>
                  <Chip label={`${supportRequests.length} ticket`} />
                </Box>
                <TextField
                  placeholder="Tìm kiếm ticket (tên, email, tiêu đề)..."
                  variant="outlined"
                  size="small"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  sx={{
                    width: { sm: '300px', xs: '100%' },
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: '#fb7185' },
                      '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
                    }
                  }}
                />
              </Box>

              <div className="admin-table support">
                <div className="admin-table-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 2fr 2fr 1.8fr 1.2fr 1.8fr', gap: '8px' }}>
                  <span>Mã Ticket</span>
                  <span>Khách hàng</span>
                  <span>Email</span>
                  <span>Chủ đề</span>
                  <span>Ngày tạo</span>
                  <span>Trạng thái</span>
                  <span style={{ textAlign: 'right' }}>Hành động</span>
                </div>
                {supportRequests
                  .filter(t => 
                    t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                    t.fullName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                    t.email.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                    t.subject.toLowerCase().includes(ticketSearch.toLowerCase())
                  )
                  .map((ticket) => (
                    <div className="admin-table-row" key={ticket.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 2fr 2fr 1.8fr 1.2fr 1.8fr', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold', color: '#fb7185' }}>#{ticket.id}</span>
                      <span>{ticket.fullName}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{ticket.email}</span>
                      <span style={{ fontWeight: 600 }}>{ticket.subject}</span>
                      <span>{new Date(ticket.createdAt).toLocaleString('vi-VN')}</span>
                      <span>
                        <Chip
                          label={ticket.status === 'OPEN' ? 'Chưa xử lý' : 'Đã xử lý'}
                          sx={{
                            background: ticket.status === 'OPEN' ? 'rgba(251,113,133,0.12)' : 'rgba(74,222,128,0.12)',
                            color: ticket.status === 'OPEN' ? '#fb7185' : '#4ade80',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            height: '24px',
                          }}
                        />
                      </span>
                      <span style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          className="outline-button"
                          onClick={() => { setViewingTicket(ticket); setTicketModalOpen(true); }}
                          sx={{ minWidth: '70px', height: '28px', padding: '0 8px' }}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          size="small"
                          className={ticket.status === 'OPEN' ? 'filled-button success' : 'outline-button'}
                          onClick={() => handleResolveTicket(ticket.id, ticket.status)}
                          sx={{
                            minWidth: '90px',
                            height: '28px',
                            padding: '0 8px',
                            backgroundColor: ticket.status === 'OPEN' ? 'rgba(74,222,128,0.2)' : 'transparent',
                            color: ticket.status === 'OPEN' ? '#4ade80' : 'rgba(255,255,255,0.6)',
                            '&:hover': {
                              backgroundColor: ticket.status === 'OPEN' ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'
                            }
                          }}
                        >
                          {ticket.status === 'OPEN' ? 'Giải quyết' : 'Mở lại'}
                        </Button>
                      </span>
                    </div>
                  ))}
              </div>
            </Box>
          )}

          {activeTab === 'mail-queue' && (
            <Box className="admin-table-card">
              <Box className="admin-section-heading" sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography component="h2">Nhật Ký Email (Mail Queue)</Typography>
                  <Chip label={`${mailLogs.length} thư`} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, width: { sm: '400px', xs: '100%' } }}>
                  <TextField
                    placeholder="Lọc email (người nhận, tiêu đề, trạng thái)..."
                    variant="outlined"
                    size="small"
                    value={mailSearch}
                    onChange={(e) => setMailSearch(e.target.value)}
                    sx={{
                      flexGrow: 1,
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: '#fb7185' },
                        '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
                      }
                    }}
                  />
                  <Button 
                    className="outline-button" 
                    onClick={fetchMailLogs} 
                    sx={{ minWidth: '80px', height: '40px' }}
                  >
                    Tải lại
                  </Button>
                </Box>
              </Box>

              <div className="admin-table mail-queue">
                <div className="admin-table-head" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 2.5fr 1fr 2fr', gap: '8px' }}>
                  <span>Thời gian</span>
                  <span>Người nhận</span>
                  <span>Tiêu đề</span>
                  <span>Trạng thái</span>
                  <span>Chi tiết lỗi</span>
                </div>
                {mailLogs
                  .filter(log => 
                    (log.to || '').toLowerCase().includes(mailSearch.toLowerCase()) ||
                    (log.subject || '').toLowerCase().includes(mailSearch.toLowerCase()) ||
                    (log.status || '').toLowerCase().includes(mailSearch.toLowerCase()) ||
                    (log.error || '').toLowerCase().includes(mailSearch.toLowerCase())
                  )
                  .map((log) => (
                    <div className="admin-table-row" key={log.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 2.5fr 1fr 2fr', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#fff' }}>
                        {log.to}
                      </span>
                      <span style={{ fontWeight: 600, color: 'rgba(248, 250, 252, 0.95)' }}>{log.subject}</span>
                      <span>
                        <Chip
                          label={log.status === 'SENT' ? 'ĐÃ GỬI' : log.status === 'PENDING' ? 'ĐANG CHỜ' : 'THẤT BẠI'}
                          sx={{
                            background: log.status === 'SENT' 
                              ? 'rgba(74, 222, 128, 0.12)' 
                              : log.status === 'PENDING' 
                                ? 'rgba(251, 146, 60, 0.12)' 
                                : 'rgba(239, 68, 68, 0.12)',
                            color: log.status === 'SENT' 
                              ? '#4ade80' 
                              : log.status === 'PENDING' 
                                ? '#fb923c' 
                                : '#ef4444',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            height: '24px',
                          }}
                        />
                      </span>
                      <span style={{ 
                        fontFamily: 'JetBrains Mono', 
                        fontSize: '11px', 
                        color: log.status === 'FAILED' ? '#f87171' : 'rgba(255,255,255,0.3)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={log.error || ''}>
                        {log.error || '-'}
                      </span>
                    </div>
                  ))}
              </div>
            </Box>
          )}

          {activeTab === 'audit-logs' && (() => {
            const filteredLogs = auditLogs.filter(log => 
              auditSubTab === 'SYSTEM'
                ? (log.type === 'SYSTEM' || !log.type)
                : (log.type === 'ADMIN')
            );
            const searchedLogs = filteredLogs.filter(log =>
              (log.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
              (log.userEmail || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
              (log.details || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
              (log.ip || '').toLowerCase().includes(auditSearch.toLowerCase())
            );

            return (
              <Box sx={{ display: 'grid', gap: 3 }}>
                {/* Sub-tabs for Audit Logs */}
                <Box sx={{ display: 'flex', gap: 1, borderBottom: '1px solid rgba(248, 250, 252, 0.08)', pb: 1, overflowX: 'auto' }}>
                  {[
                    { id: 'SYSTEM', label: 'Nhật ký Hệ thống (Đăng ký, Đơn hàng)' },
                    { id: 'ADMIN', label: 'Hoạt động Quản trị (Sản phẩm, CMS, Settings)' },
                  ].map((sub) => (
                    <Button
                      key={sub.id}
                      onClick={() => { setAuditSubTab(sub.id); setError(''); setNotice(''); }}
                      sx={{
                        color: auditSubTab === sub.id ? '#fb7185' : 'rgba(248, 250, 252, 0.5)',
                        borderBottom: auditSubTab === sub.id ? '2px solid #fb7185' : '2px solid transparent',
                        borderRadius: 0,
                        fontWeight: 800,
                        px: 3,
                        py: 1.5,
                        fontSize: '13px',
                        textTransform: 'none',
                        '&:hover': {
                          color: '#fb7185',
                          background: 'rgba(251, 113, 133, 0.04)',
                        }
                      }}
                    >
                      {sub.label}
                    </Button>
                  ))}
                </Box>

                <Box className="admin-table-card">
                  <Box className="admin-section-heading" sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography component="h2">
                        {auditSubTab === 'SYSTEM' ? 'Nhật ký Hệ thống' : 'Hoạt động Quản trị'}
                      </Typography>
                      <Chip label={`${filteredLogs.length} bản ghi`} />
                    </Box>
                    <TextField
                      placeholder="Lọc hoạt động (hành động, email, IP)..."
                      variant="outlined"
                      size="small"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      sx={{
                        width: { sm: '300px', xs: '100%' },
                        '& .MuiOutlinedInput-root': {
                          color: '#fff',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          '&:hover fieldset': { borderColor: '#fb7185' },
                          '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
                        }
                      }}
                    />
                  </Box>

                  <div className="admin-table audit-logs">
                    <div className="admin-table-head" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.5fr 3.5fr 1fr', gap: '8px' }}>
                      <span>Thời gian</span>
                      <span>Tài khoản</span>
                      <span>Hành động</span>
                      <span>Chi tiết hoạt động</span>
                      <span>Địa chỉ IP</span>
                    </div>
                    {searchedLogs.map((log) => (
                      <div className="admin-table-row" key={log.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.5fr 3.5fr 1fr', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: log.userEmail ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                          {log.userEmail || 'Hệ thống'}
                        </span>
                        <span style={{ fontWeight: 'bold', color: '#fb7185' }}>{log.action}</span>
                        <span style={{ color: 'rgba(248, 250, 252, 0.85)', fontSize: '13px' }}>{log.details}</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{log.ip}</span>
                      </div>
                    ))}
                    {searchedLogs.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(248,250,252,0.4)', fontSize: '13px' }}>
                        Không tìm thấy bản ghi nhật ký phù hợp.
                      </div>
                    )}
                  </div>
                </Box>
              </Box>
            );
          })()}
        </Box>
      </Box>

      {/* ======================================================== */}
      {/* 1. PRODUCT DETAIL EDIT MODAL */}
      {/* ======================================================== */}
      <Dialog
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0c0c0d',
            border: '1px solid rgba(251, 113, 133, 0.22)',
            boxShadow: '0 28px 90px rgba(0, 0, 0, 0.7)',
            color: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(244, 63, 94, 0.1), transparent 34%)',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(248,250,252,0.08)', fontWeight: 900, pb: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Be Vietnam Pro', fontWeight: 950, color: '#fff' }}>
            {isCreatingProduct ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm chi tiết'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {editingProduct && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 2, mt: 2.5 }}>
                <TextField
                  label="Tên sản phẩm"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct(curr => ({ ...curr, name: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="SKU"
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct(curr => ({ ...curr, sku: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr 1fr', xs: '1fr' }, gap: 2 }}>
                <TextField
                  label="Thương hiệu"
                  value={editingProduct.brand}
                  onChange={(e) => setEditingProduct(curr => ({ ...curr, brand: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="Giá (VND)"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct(curr => ({ ...curr, price: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="Số lượng tồn kho"
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct(curr => ({ ...curr, stock: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label" style={{ color: 'rgba(248,250,252,0.5)' }}>Danh mục sản phẩm</InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={editingProduct.categoryId}
                    label="Danh mục sản phẩm"
                    onChange={(e) => setEditingProduct(curr => ({ ...curr, categoryId: e.target.value }))}
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(248,250,252,0.23)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fb7185' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fb7185' },
                      '.MuiSvgIcon-root': { color: 'rgba(248,250,252,0.5)' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#0c0c0d',
                          border: '1px solid rgba(251, 113, 133, 0.22)',
                          color: '#fff'
                        }
                      }
                    }}
                  >
                    <MenuItem value=""><em>-- Không chọn --</em></MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="status-select-label" style={{ color: 'rgba(248,250,252,0.5)' }}>Trạng thái hiển thị</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={editingProduct.isActive === false ? 'false' : 'true'}
                    label="Trạng thái hiển thị"
                    onChange={(e) => setEditingProduct(curr => ({ ...curr, isActive: e.target.value === 'true' }))}
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(248,250,252,0.23)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fb7185' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fb7185' },
                      '.MuiSvgIcon-root': { color: 'rgba(248,250,252,0.5)' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#0c0c0d',
                          border: '1px solid rgba(251, 113, 133, 0.22)',
                          color: '#fff'
                        }
                      }
                    }}
                  >
                    <MenuItem value="true">Đang bán (Hiển thị)</MenuItem>
                    <MenuItem value="false">Ẩn (Không hiển thị)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Mô tả sản phẩm chi tiết"
                value={editingProduct.description}
                onChange={(e) => setEditingProduct(curr => ({ ...curr, description: e.target.value }))}
                multiline
                minRows={4}
                fullWidth
                InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                inputProps={{ style: { color: '#fff' } }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '120px 1fr', xs: '1fr' }, gap: 3, alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', mb: 1 }}>Ảnh chính hiện tại:</Typography>
                  {editingProduct.imageUrl ? (
                    <img src={editingProduct.imageUrl} alt={editingProduct.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.1)' }} />
                  ) : (
                    <Box sx={{ width: 100, height: 100, background: 'rgba(248,250,252,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(248,250,252,0.1)' }}>
                      <Inventory2Icon sx={{ color: 'rgba(248,250,252,0.3)', fontSize: '30px' }} />
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', mb: 1 }}>Tải lên ảnh mới từ máy tính:</Typography>
                  <Button component="label" className="outline-button" startIcon={<UploadIcon />}>
                    Chọn ảnh sản phẩm
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setProductImageFile(e.target.files[0])
                        }
                      }}
                    />
                  </Button>
                  {productImageFile && (
                    <Typography sx={{ color: '#fb7185', fontSize: '12px', mt: 1 }}>
                      Sẵn sàng tải lên: {productImageFile.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(248,250,252,0.08)', px: 3, py: 2, gap: 1.5 }}>
          <Button
            className="outline-button"
            onClick={() => setProductModalOpen(false)}
            sx={{ minHeight: '38px !important', px: '22px !important', fontSize: '13px !important' }}
          >
            Hủy
          </Button>
          <Button
            className="pulse-button"
            onClick={handleProductDetailSave}
            disabled={busy === 'detail-save'}
            sx={{ minHeight: '38px !important', px: '22px !important', fontSize: '13px !important' }}
          >
            Lưu Sản Phẩm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* 2. ARTICLE DETAIL EDIT MODAL */}
      {/* ======================================================== */}
      <Dialog
        open={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0c0c0d',
            border: '1px solid rgba(251, 113, 133, 0.22)',
            boxShadow: '0 28px 90px rgba(0, 0, 0, 0.7)',
            color: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(244, 63, 94, 0.1), transparent 34%)',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(248,250,252,0.08)', fontWeight: 900, pb: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Be Vietnam Pro', fontWeight: 950, color: '#fff' }}>
            {isCreatingArticle ? 'Viết bài viết mới' : 'Biên tập bài viết chi tiết'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {editingArticle && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 2, mt: 2.5 }}>
                <TextField
                  label="Tiêu đề chính"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle(curr => ({ ...curr, title: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="Phụ đề (Subtitle)"
                  value={editingArticle.subtitle}
                  onChange={(e) => setEditingArticle(curr => ({ ...curr, subtitle: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr 1fr', xs: '1fr' }, gap: 2 }}>
                <TextField
                  label="Danh mục"
                  value={editingArticle.category}
                  onChange={(e) => setEditingArticle(curr => ({ ...curr, category: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="Tác giả"
                  value={editingArticle.author}
                  onChange={(e) => setEditingArticle(curr => ({ ...curr, author: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="Thời gian đọc"
                  value={editingArticle.readTime}
                  onChange={(e) => setEditingArticle(curr => ({ ...curr, readTime: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 2 }}>
                <TextField
                  label="Ngày đăng (Bỏ trống để tự tạo)"
                  value={editingArticle.date}
                  onChange={(e) => setEditingArticle(curr => ({ ...curr, date: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <FormControl fullWidth>
                  <InputLabel id="publish-select-label" style={{ color: 'rgba(248,250,252,0.5)' }}>Trạng thái xuất bản</InputLabel>
                  <Select
                    labelId="publish-select-label"
                    value={editingArticle.isPublished ? 'true' : 'false'}
                    label="Trạng thái xuất bản"
                    onChange={(e) => setEditingArticle(curr => ({ ...curr, isPublished: e.target.value === 'true' }))}
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(248,250,252,0.23)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fb7185' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fb7185' },
                      '.MuiSvgIcon-root': { color: 'rgba(248,250,252,0.5)' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#0c0c0d',
                          border: '1px solid rgba(251, 113, 133, 0.22)',
                          color: '#fff'
                        }
                      }
                    }}
                  >
                    <MenuItem value="true">Published (Đã xuất bản)</MenuItem>
                    <MenuItem value="false">Draft (Bản nháp)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Tóm tắt ngắn"
                value={editingArticle.synopsis}
                onChange={(e) => setEditingArticle(curr => ({ ...curr, synopsis: e.target.value }))}
                multiline
                minRows={2}
                fullWidth
                InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                inputProps={{ style: { color: '#fff' } }}
              />

              <TextField
                label="Nội dung bài viết chi tiết"
                value={editingArticle.content}
                onChange={(e) => setEditingArticle(curr => ({ ...curr, content: e.target.value }))}
                multiline
                minRows={6}
                fullWidth
                InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                inputProps={{ style: { color: '#fff' } }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '120px 1fr', xs: '1fr' }, gap: 3, alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', mb: 1 }}>Ảnh bìa hiện tại:</Typography>
                  {editingArticle.image ? (
                    <img src={editingArticle.image} alt={editingArticle.title} style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.1)' }} />
                  ) : (
                    <Box sx={{ width: 100, height: 60, background: 'rgba(248,250,252,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(248,250,252,0.1)' }}>
                      <ArticleIcon sx={{ color: 'rgba(248,250,252,0.3)', fontSize: '24px' }} />
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', mb: 1 }}>Tải lên ảnh bìa mới:</Typography>
                  <Button component="label" className="outline-button" startIcon={<UploadIcon />}>
                    Chọn ảnh bìa bài viết
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setArticleImageFile(e.target.files[0])
                        }
                      }}
                    />
                  </Button>
                  {articleImageFile && (
                    <Typography sx={{ color: '#fb7185', fontSize: '12px', mt: 1 }}>
                      Sẵn sàng tải lên: {articleImageFile.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(248,250,252,0.08)', px: 3, py: 2, gap: 1.5 }}>
          <Button
            className="outline-button"
            onClick={() => setArticleModalOpen(false)}
            sx={{ minHeight: '38px !important', px: '22px !important', fontSize: '13px !important' }}
          >
            Hủy
          </Button>
          <Button
            className="pulse-button"
            onClick={handleArticleDetailSave}
            disabled={busy === 'detail-save'}
            sx={{ minHeight: '38px !important', px: '22px !important', fontSize: '13px !important' }}
          >
            Lưu Bài Viết
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* 3. CATEGORY CMS EDIT MODAL */}
      {/* ======================================================== */}
      <Dialog
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0c0c0d',
            border: '1px solid rgba(251, 113, 133, 0.22)',
            boxShadow: '0 28px 90px rgba(0, 0, 0, 0.7)',
            color: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(244, 63, 94, 0.1), transparent 34%)',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(248,250,252,0.08)', fontWeight: 900, pb: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Be Vietnam Pro', fontWeight: 950, color: '#fff' }}>
            {isCreatingCategory ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {editingCategory && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 2.5 }}>
                <TextField
                  label="Tên danh mục"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(curr => ({ ...curr, name: e.target.value, slug: curr.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="Slug danh mục"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory(curr => ({ ...curr, slug: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="Thứ tự hiển thị"
                  type="number"
                  value={editingCategory.displayOrder}
                  onChange={(e) => setEditingCategory(curr => ({ ...curr, displayOrder: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
                <FormControl fullWidth>
                  <InputLabel id="category-status-select-label" style={{ color: 'rgba(248,250,252,0.5)' }}>Trạng thái</InputLabel>
                  <Select
                    labelId="category-status-select-label"
                    value={editingCategory.isActive ? 'true' : 'false'}
                    label="Trạng thái"
                    onChange={(e) => setEditingCategory(curr => ({ ...curr, isActive: e.target.value === 'true' }))}
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(248,250,252,0.23)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fb7185' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fb7185' },
                      '.MuiSvgIcon-root': { color: 'rgba(248,250,252,0.5)' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#0c0c0d',
                          border: '1px solid rgba(251, 113, 133, 0.22)',
                          color: '#fff'
                        }
                      }
                    }}
                  >
                    <MenuItem value="true">Hoạt động (Hiển thị)</MenuItem>
                    <MenuItem value="false">Ẩn (Không hiển thị)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Mô tả danh mục"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory(curr => ({ ...curr, description: e.target.value }))}
                  multiline
                  minRows={3}
                  fullWidth
                  InputLabelProps={{ style: { color: 'rgba(248,250,252,0.5)' } }}
                  inputProps={{ style: { color: '#fff' } }}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(248,250,252,0.08)', px: 3, py: 2, gap: 1.5 }}>
          <Button
            className="outline-button"
            onClick={() => setCategoryModalOpen(false)}
            sx={{ minHeight: '38px !important', px: '22px !important', fontSize: '13px !important' }}
          >
            Hủy
          </Button>
          <Button
            className="pulse-button"
            onClick={handleCategorySave}
            disabled={busy === 'category-save'}
            sx={{ minHeight: '38px !important', px: '22px !important', fontSize: '13px !important' }}
          >
            Lưu Danh Mục
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* 4. ADMIN ORDER DETAIL & WORKFLOW PROCESS MODAL */}
      {/* ======================================================== */}
      <Dialog
        open={orderDetailModalOpen}
        onClose={() => setOrderDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0c0c0d',
            border: '1px solid rgba(251, 113, 133, 0.22)',
            boxShadow: '0 28px 90px rgba(0, 0, 0, 0.7)',
            color: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(244, 63, 94, 0.1), transparent 34%)',
          }
        }}
      >
        {viewingOrder && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(248,250,252,0.08)', fontWeight: 900, pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontFamily: 'Be Vietnam Pro', fontWeight: 950, color: '#fff' }}>
                  Xử lý đơn hàng #{viewingOrder.orderNumber}
                </Typography>
                <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'rgba(248,250,252,0.5)' }}>
                  Ngày tạo: {formatDate(viewingOrder.createdAt)}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.2fr 0.8fr', xs: '1fr' }, gap: 3, mt: 1 }}>
                
                {/* Left Side: Items & Shipping */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  
                  {/* Items List */}
                  <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', mb: 2 }}>
                      Sản phẩm đã đặt ({viewingOrder.items?.length || 0})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {viewingOrder.items?.map((item) => (
                        <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'rgba(248,250,252,0.02)', p: 1.5, borderRadius: '4px', border: '1px solid rgba(248,250,252,0.05)' }}>
                          <Box
                            component="img"
                            src={item.productImage || '/images/cars/default.png'}
                            alt={item.productName}
                            sx={{ width: 60, height: 45, objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.1)' }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
                              {item.productName}
                            </Typography>
                            <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', mt: 0.5 }}>
                              Màu sắc: {item.selectedColor || 'Mặc định'} / Kích thước: {item.selectedSize || 'Mặc định'}
                            </Typography>
                          </Box>
                          <Typography sx={{ color: 'rgba(248,250,252,0.8)', fontSize: '12px', textAlign: 'right' }}>
                            {item.quantity} x {formatMoney(item.price)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Shipping Address */}
                  <Box sx={{ p: 2, bgcolor: 'rgba(248,250,252,0.02)', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.05)' }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', mb: 1.5 }}>
                      Thông tin giao hàng
                    </Typography>
                    <Typography sx={{ color: 'rgba(248,250,252,0.7)', fontSize: '13px', lineHeight: 1.6 }}>
                      <strong>Người nhận:</strong> {viewingOrder.shippingAddress?.fullName || viewingOrder.guestName || 'Khách vãng lai'}<br />
                      <strong>Số điện thoại:</strong> {viewingOrder.shippingAddress?.phone || viewingOrder.guestPhone || '-'}<br />
                      <strong>Email:</strong> {viewingOrder.guestEmail || 'Không có email'}<br />
                      <strong>Địa chỉ nhận:</strong> {[
                        viewingOrder.shippingAddress?.street,
                        viewingOrder.shippingAddress?.district,
                        viewingOrder.shippingAddress?.city
                      ].filter(Boolean).join(', ') || 'Chưa cập nhật địa chỉ'}
                    </Typography>
                    {viewingOrder.cancelReason && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '4px' }}>
                        <Typography sx={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>Lý do hủy đơn:</Typography>
                        <Typography sx={{ color: 'rgba(248,250,252,0.8)', fontSize: '13px', mt: 0.5 }}>{viewingOrder.cancelReason}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Right Side: Total summary & Action workflow */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  
                  {/* Financial breakdown */}
                  <Box sx={{ p: 2, bgcolor: 'rgba(251, 113, 133, 0.03)', borderRadius: '4px', border: '1px solid rgba(251, 113, 133, 0.1)' }}>
                    <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', mb: 2 }}>Tóm tắt thanh toán</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)' }}>Tạm tính:</Typography>
                        <Typography sx={{ color: '#fff' }}>{formatMoney(viewingOrder.subtotal)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)' }}>Phí vận chuyển:</Typography>
                        <Typography sx={{ color: '#fff' }}>{formatMoney(viewingOrder.shippingFee)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)' }}>Thuế (VAT):</Typography>
                        <Typography sx={{ color: '#fff' }}>{formatMoney(viewingOrder.tax)}</Typography>
                      </Box>
                      {viewingOrder.discount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <Typography sx={{ color: '#fb7185' }}>Giảm giá:</Typography>
                          <Typography sx={{ color: '#fb7185' }}>-{formatMoney(viewingOrder.discount)}</Typography>
                        </Box>
                      )}
                      <Divider sx={{ my: 1, borderColor: 'rgba(248,250,252,0.08)' }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Tổng cộng:</Typography>
                        <Typography sx={{ color: '#fb7185', fontWeight: '950', fontSize: '20px' }}>{formatMoney(viewingOrder.total)}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Operational workflow panel */}
                  <Box sx={{ p: 2, bgcolor: 'rgba(248,250,252,0.02)', borderRadius: '4px', border: '1px solid rgba(248,250,252,0.05)', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Quy trình xử lý nghiệp vụ</Typography>
                    
                    {/* Order status operations */}
                    <Box>
                      <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                        1. Trạng thái vận hành đơn
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Typography sx={{ fontSize: '13px' }}>Hiện tại:</Typography>
                        <Chip
                          label={orderStatusStyles[viewingOrder.status]?.label || viewingOrder.status}
                          sx={{
                            color: orderStatusStyles[viewingOrder.status]?.color || '#fff',
                            bgcolor: orderStatusStyles[viewingOrder.status]?.bg || 'rgba(255,255,255,0.06)',
                            fontWeight: 'bold',
                            height: '24px',
                            fontSize: '11px'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {viewingOrder.status === 'PENDING' && (
                          <>
                            <Button
                              className="pulse-button small"
                              disabled={busy === `order-${viewingOrder.id}`}
                              onClick={() => updateOrder(viewingOrder, { status: 'PROCESSING' })}
                              fullWidth
                            >
                              Duyệt & Xử lý đơn (Processing)
                            </Button>
                            <Button
                              className="outline-button"
                              disabled={busy === `order-${viewingOrder.id}`}
                              onClick={() => {
                                const reason = window.prompt('Nhập lý do hủy đơn:');
                                if (reason !== null) {
                                  updateOrder(viewingOrder, { status: 'CANCELLED', cancelReason: reason || 'Admin cancelled' });
                                }
                              }}
                              sx={{ color: '#fb7185', borderColor: 'rgba(251,113,133,0.3)', '&:hover': { borderColor: '#fb7185', background: 'rgba(251,113,133,0.05)' } }}
                              fullWidth
                            >
                              Hủy đơn hàng (Cancel)
                            </Button>
                          </>
                        )}
                        {viewingOrder.status === 'PROCESSING' && (
                          <>
                            <Button
                              className="pulse-button small"
                              disabled={busy === `order-${viewingOrder.id}`}
                              onClick={() => updateOrder(viewingOrder, { status: 'SHIPPING' })}
                              fullWidth
                            >
                              Bắt đầu giao hàng (Shipping)
                            </Button>
                            <Button
                              className="outline-button"
                              disabled={busy === `order-${viewingOrder.id}`}
                              onClick={() => {
                                const reason = window.prompt('Nhập lý do hủy đơn:');
                                if (reason !== null) {
                                  updateOrder(viewingOrder, { status: 'CANCELLED', cancelReason: reason || 'Admin cancelled' });
                                }
                              }}
                              sx={{ color: '#fb7185', borderColor: 'rgba(251,113,133,0.3)' }}
                              fullWidth
                            >
                              Hủy đơn hàng (Cancel)
                            </Button>
                          </>
                        )}
                        {viewingOrder.status === 'SHIPPING' && (
                          <>
                            <Button
                              className="pulse-button small"
                              disabled={busy === `order-${viewingOrder.id}`}
                              onClick={() => updateOrder(viewingOrder, { status: 'DELIVERED' })}
                              fullWidth
                            >
                              Xác nhận đã giao hàng (Delivered)
                            </Button>
                            <Button
                              className="outline-button"
                              disabled={busy === `order-${viewingOrder.id}`}
                              onClick={() => {
                                const reason = window.prompt('Nhập lý do hủy đơn:');
                                if (reason !== null) {
                                  updateOrder(viewingOrder, { status: 'CANCELLED', cancelReason: reason || 'Admin cancelled' });
                                }
                              }}
                              sx={{ color: '#fb7185', borderColor: 'rgba(251,113,133,0.3)' }}
                              fullWidth
                            >
                              Hủy đơn hàng (Cancel)
                            </Button>
                          </>
                        )}
                        {['DELIVERED', 'CANCELLED'].includes(viewingOrder.status) && (
                          <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', py: 1, border: '1px dashed rgba(248,250,252,0.08)' }}>
                            Đơn hàng đã kết thúc vòng đời.
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Payment status operations */}
                    <Box>
                      <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                        2. Trạng thái thanh toán
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Typography sx={{ fontSize: '13px' }}>Hiện tại:</Typography>
                        <Chip
                          label={paymentStatusStyles[viewingOrder.paymentStatus]?.label || viewingOrder.paymentStatus}
                          sx={{
                            color: paymentStatusStyles[viewingOrder.paymentStatus]?.color || '#fff',
                            bgcolor: paymentStatusStyles[viewingOrder.paymentStatus]?.bg || 'rgba(255,255,255,0.06)',
                            fontWeight: 'bold',
                            height: '24px',
                            fontSize: '11px'
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {['PENDING', 'UNPAID', 'FAILED'].includes(viewingOrder.paymentStatus || 'PENDING') && (
                          <Button
                            className="pulse-button small"
                            disabled={busy === `order-${viewingOrder.id}`}
                            onClick={() => updateOrder(viewingOrder, { paymentStatus: 'PAID' })}
                            fullWidth
                            sx={{ backgroundImage: 'linear-gradient(135deg, #10b981, #059669) !important' }}
                          >
                            Xác nhận đã thanh toán (Paid)
                          </Button>
                        )}
                        {viewingOrder.paymentStatus === 'PAID' && (
                          <Button
                            className="outline-button"
                            disabled={busy === `order-${viewingOrder.id}`}
                            onClick={() => updateOrder(viewingOrder, { paymentStatus: 'REFUNDED' })}
                            fullWidth
                            sx={{ color: '#c084fc', borderColor: 'rgba(192,132,252,0.3)', '&:hover': { borderColor: '#c084fc', background: 'rgba(192,132,252,0.05)' } }}
                          >
                            Xác nhận hoàn tiền (Refunded)
                          </Button>
                        )}
                        {viewingOrder.paymentStatus === 'REFUNDED' && (
                          <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', py: 1, border: '1px dashed rgba(248,250,252,0.08)' }}>
                            Đã hoàn tiền đơn hàng.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(248,250,252,0.08)', px: 3, py: 2 }}>
              <Button
                className="outline-button"
                onClick={() => setOrderDetailModalOpen(false)}
                sx={{ minHeight: '38px !important', px: '24px !important', fontSize: '13px !important' }}
              >
                Đóng cửa sổ
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ======================================================== */}
      {/* 5. TICKET DETAIL MODAL */}
      {/* ======================================================== */}
      <Dialog
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(251, 113, 133, 0.25)',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(251, 113, 133, 0.1)',
            minWidth: '500px',
            maxWidth: '600px',
          }
        }}
      >
        <DialogTitle style={{ color: '#fff', fontFamily: 'Be Vietnam Pro', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          Chi Tiết Yêu Cầu Hỗ Trợ #{viewingTicket?.id}
        </DialogTitle>
        <DialogContent style={{ color: '#fff', display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
          <Box style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '10px 8px', fontSize: '13.5px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Plus Jakarta Sans' }}>Khách hàng:</span>
            <span style={{ fontWeight: 'bold' }}>{viewingTicket?.fullName}</span>

            <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Plus Jakarta Sans' }}>Email:</span>
            <span style={{ fontFamily: 'JetBrains Mono', color: '#fb7185' }}>{viewingTicket?.email}</span>

            <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Plus Jakarta Sans' }}>Thời gian gửi:</span>
            <span>{viewingTicket ? new Date(viewingTicket.createdAt).toLocaleString('vi-VN') : ''}</span>

            <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Plus Jakarta Sans' }}>Trạng thái:</span>
            <span>
              <Chip
                label={viewingTicket?.status === 'OPEN' ? 'Chưa xử lý' : 'Đã giải quyết'}
                sx={{
                  background: viewingTicket?.status === 'OPEN' ? 'rgba(251,113,133,0.12)' : 'rgba(74,222,128,0.12)',
                  color: viewingTicket?.status === 'OPEN' ? '#fb7185' : '#4ade80',
                  fontWeight: 'bold',
                  height: '22px',
                  fontSize: '11px',
                }}
              />
            </span>
          </Box>
          
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: 'Plus Jakarta Sans' }}>Chủ đề:</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{viewingTicket?.subject}</span>
          </Box>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: 'Plus Jakarta Sans', marginBottom: '4px' }}>Nội dung chi tiết:</span>
            <span style={{ fontSize: '13.5px', whiteSpace: 'pre-wrap', fontFamily: 'Plus Jakarta Sans', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
              {viewingTicket?.message}
            </span>
          </Box>
        </DialogContent>
        <DialogActions style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px' }}>
          <Button
            onClick={() => handleResolveTicket(viewingTicket?.id, viewingTicket?.status)}
            sx={{
              backgroundColor: viewingTicket?.status === 'OPEN' ? 'rgba(74,222,128,0.12)' : 'transparent',
              border: viewingTicket?.status === 'OPEN' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.15)',
              color: viewingTicket?.status === 'OPEN' ? '#4ade80' : 'rgba(255,255,255,0.7)',
              fontWeight: 'bold',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              textTransform: 'uppercase',
              mr: 'auto',
              '&:hover': {
                backgroundColor: viewingTicket?.status === 'OPEN' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)',
              }
            }}
          >
            {viewingTicket?.status === 'OPEN' ? 'Đánh dấu đã giải quyết' : 'Mở lại yêu cầu'}
          </Button>
          <Button
            onClick={() => setTicketModalOpen(false)}
            sx={{
              color: '#fb7185',
              fontWeight: 'bold',
              fontFamily: 'JetBrains Mono',
              fontSize: '12px',
              textTransform: 'uppercase',
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>,
  )
}
