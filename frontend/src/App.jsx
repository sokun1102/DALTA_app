import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'
import CheckoutPage from './pages/CheckoutPage'
import ShowroomPage from './pages/ShowroomPage'
import TechPage from './pages/TechPage'
import ProductDetailPage from './pages/ProductDetailPage'
import PartsPage from './pages/PartsPage'
import ArticlesPage from './pages/ArticlesPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import AboutPage from './pages/AboutPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import WishlistPage from './pages/WishlistPage'
import AdminPage from './pages/AdminPage'
import ContactPage from './pages/ContactPage'
import { clearAuthToken, getAuthToken, setAuthToken } from './services/authToken'
import { clearGuestCart } from './utils/cart'
import { apiFetch } from './services/apiClient'
import './App.css'

function scrollToPageTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  })
}

export default function App() {
  const [page, setPage] = useState(() => {
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    if (path === '/reset-password' && params.get('token')) {
      return 'reset-password'
    }
    if (params.get('checkout')) return 'checkout'
    if (path === '/checkout') return 'checkout'
    if (path === '/profile') return 'profile'
    if (path === '/login') return 'login'
    if (path === '/register') return 'register'
    if (path === '/forgot-password') return 'forgot-password'
    if (path === '/showroom') return 'showroom'
    if (path === '/tech') return 'tech'
    if (path === '/parts') return 'parts'
    if (path === '/articles') return 'articles'
    if (path === '/about') return 'about'
    if (path === '/contact') return 'contact'
    if (path === '/cart') return 'cart'
    if (path === '/orders') return 'orders'
    if (path === '/wishlist') return 'wishlist'
    if (path === '/admin') return 'admin'
    if (path.startsWith('/parts/')) return 'product-detail'
    if (path.startsWith('/articles/')) return 'article-detail'
    return 'home'
  })
  const [selectedProduct, setSelectedProduct] = useState(() => {
    const path = window.location.pathname
    if (path.startsWith('/parts/')) {
      const id = path.split('/parts/')[1]
      return { id }
    }
    return null
  })
  const [selectedArticle, setSelectedArticle] = useState(() => {
    const path = window.location.pathname
    if (path.startsWith('/articles/')) {
      const id = path.split('/articles/')[1]
      return { id }
    }
    return null
  })
  const [user, setUser] = useState(() => {
    const token = getAuthToken()
    return token ? { email: 'Thành viên AEROTEC' } : null
  })

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Navigate helper to change both React state and Browser URL
  const navigate = (targetPage, replace = false, extraData = null) => {
    setPage(targetPage)
    if (extraData !== null) {
      if (targetPage === 'product-detail') {
        setSelectedProduct(extraData)
      } else if (targetPage === 'article-detail') {
        setSelectedArticle(extraData)
      }
    }
    let newPath = targetPage === 'home' ? '/' : `/${targetPage}`
    if (targetPage === 'product-detail' && extraData?.id) {
      newPath = `/parts/${extraData.id}`
    } else if (targetPage === 'article-detail' && extraData?.id) {
      newPath = `/articles/${extraData.id}`
    }
    if (replace) {
      window.history.replaceState({ page: targetPage, extraData }, '', newPath)
    } else {
      window.history.pushState({ page: targetPage, extraData }, '', newPath)
    }
    scrollToPageTop()
  }

  // Handle browser back/forward buttons (Popstate) and unauthorized events
  useEffect(() => {
    const handlePopState = (event) => {
      const path = window.location.pathname
      const params = new URLSearchParams(window.location.search)
      const state = event.state || {}
      if (path === '/reset-password' && params.get('token')) {
        setPage('reset-password')
      } else if (params.get('checkout')) {
        setPage('checkout')
      } else if (path === '/checkout') {
        setPage('checkout')
      } else if (path === '/profile') {
        setPage('profile')
      } else if (path === '/login') {
        setPage('login')
      } else if (path === '/register') {
        setPage('register')
      } else if (path === '/forgot-password') {
        setPage('forgot-password')
      } else if (path === '/showroom') {
        setPage('showroom')
      } else if (path === '/tech') {
        setPage('tech')
      } else if (path === '/parts') {
        setPage('parts')
      } else if (path === '/articles') {
        setPage('articles')
      } else if (path === '/about') {
        setPage('about')
      } else if (path === '/contact') {
        setPage('contact')
      } else if (path === '/cart') {
        setPage('cart')
      } else if (path === '/orders') {
        setPage('orders')
      } else if (path === '/wishlist') {
        setPage('wishlist')
      } else if (path === '/admin') {
        setPage('admin')
      } else if (path.startsWith('/parts/')) {
        setPage('product-detail')
        const id = path.split('/parts/')[1]
        setSelectedProduct(state.extraData || { id })
      } else if (path.startsWith('/articles/')) {
        setPage('article-detail')
        const id = path.split('/articles/')[1]
        setSelectedArticle(state.extraData || { id })
      } else {
        setPage('home')
      }
      scrollToPageTop()
    }

    const handleUnauthorized = () => {
      setUser(null)
      navigate('home')
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('auth-unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('auth-unauthorized', handleUnauthorized)
    }
  }, [])

  // Verify auth token on initial app mount
  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      apiFetch('/users/profile', { auth: true })
        .then((profileData) => {
          if (profileData && profileData.email) {
            setUser(profileData)
          }
        })
        .catch((err) => {
          console.warn('Startup token validation failed:', err.message)
          // If apiFetch returns 401, it will trigger handleUnauthorized above.
          // Fallback check:
          if (err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('jwt') || err.message.toLowerCase().includes('token')) {
            clearAuthToken()
            setUser(null)
            navigate('home')
          }
        })
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('authToken')
    if (!token) return

    setAuthToken(token, true)
    clearGuestCart()
    apiFetch('/users/profile', { auth: true })
      .then((profileData) => setUser(profileData?.email ? profileData : { email: 'Google User' }))
      .catch(() => setUser({ email: 'Google User' }))
    window.history.replaceState({}, '', '/')
  }, [])

  const handleLogout = () => {
    clearAuthToken()
    setUser(null)
    navigate('home')
  }

  if (page === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(u) => {
          clearGuestCart()
          setUser(u)
          if (u?.role === 'admin') {
            navigate('admin')
          } else {
            navigate('home')
          }
        }}
        onGoRegister={() => navigate('register')}
        onForgotPassword={() => navigate('forgot-password')}
        onGoHome={() => navigate('home')}
      />
    )
  }

  if (page === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={() => navigate('login')}
        onGoLogin={() => navigate('login')}
        onGoHome={() => navigate('home')}
      />
    )
  }

  if (page === 'forgot-password') {
    return <ForgotPasswordPage onGoLogin={() => navigate('login')} onGoHome={() => navigate('home')} />
  }

  if (page === 'reset-password') {
    return <ResetPasswordPage onGoLogin={() => navigate('login')} onGoHome={() => navigate('home')} />
  }

  if (page === 'profile') {
    return (
      <ProfilePage
        user={user}
        onLogout={handleLogout}
        onGoHome={() => navigate('home')}
      />
    )
  }

  if (page === 'checkout') {
    return (
      <CheckoutPage
        user={user}
        onGoHome={() => navigate('parts')}
        onGoProfile={() => navigate('profile')}
        onGoOrders={() => navigate('orders')}
        onGoLogin={() => navigate('login')}
      />
    )
  }

  if (page === 'showroom') {
    return (
      <ShowroomPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  if (page === 'tech') {
    return (
      <TechPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  if (page === 'articles') {
    return (
      <ArticlesPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  if (page === 'parts') {
    return (
      <PartsPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  if (page === 'about') {
    return (
      <AboutPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  if (page === 'contact') {
    return (
      <ContactPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  if (page === 'cart') {
    return (
      <CartPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  if (page === 'orders') {
    return (
      <OrdersPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'wishlist') {
    return (
      <WishlistPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'admin') {
    return (
      <AdminPage
        user={user}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'product-detail') {
    return (
      <ProductDetailPage
        user={user}
        selectedProduct={selectedProduct}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  if (page === 'article-detail') {
    return (
      <ArticleDetailPage
        user={user}
        selectedArticle={selectedArticle}
        onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
        onOpenLogin={() => navigate('login')}
        onOpenRegister={() => navigate('register')}
        onOpenProfile={() => navigate('profile')}
        onLogout={handleLogout}
        onGoCheckout={() => navigate('checkout')}
      />
    )
  }

  return (
    <HomePage
      user={user}
      onNavigate={(targetPage, extraData) => navigate(targetPage, false, extraData)}
      onOpenLogin={() => navigate('login')}
      onOpenRegister={() => navigate('register')}
      onOpenProfile={() => navigate('profile')}
      onLogout={handleLogout}
      onGoCheckout={() => navigate('checkout')}
    />
  )
}
