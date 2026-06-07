import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'
import './index.css'
import App from './App.jsx'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e11d48',
    },
    secondary: {
      main: '#fb7185',
    },
    background: {
      default: '#050505',
      paper: '#0f0f14',
    },
    text: {
      primary: '#f8fafc',
      secondary: 'rgba(248, 250, 252, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Be Vietnam Pro", "JetBrains Mono", sans-serif',
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
