import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import heroCar from '../assets/sport-car-hero.png'

export default function AccountShell({
  eyebrow,
  title,
  copy,
  children,
  onGoHome,
  sideTitle = 'Bảng điều khiển',
  sideCopy = 'Quản lý thông tin cá nhân, địa chỉ nhận hàng đã lưu và lịch sử đơn hàng tại tài khoản bảo mật AEROTEC.',
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#f8fafc',
        background:
          'radial-gradient(circle at 78% 18%, rgba(225,29,72,0.22), transparent 28%), radial-gradient(circle at 12% 72%, rgba(245,158,11,0.14), transparent 32%), #050505',
      }}
    >
      <Box
        sx={{
          borderBottom: '1px solid rgba(248,250,252,0.1)',
          background: 'rgba(5,5,5,0.72)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ minHeight: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
        >
          <Box sx={{ display: 'grid', lineHeight: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 950 }}>AEROTEC</Typography>
            <Typography sx={{ color: '#fb7185', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', mt: 0.5 }}>
              performance
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onGoHome}
            sx={{
              minHeight: 40,
              color: '#f8fafc',
              border: '1px solid rgba(248,250,252,0.18)',
              borderRadius: 1,
              px: 2,
              fontWeight: 800,
              textTransform: 'none',
            }}
          >
            Trang chủ
          </Button>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          minHeight: 'calc(100vh - 74px)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(360px, 0.84fr) minmax(520px, 1.16fr)' },
          gap: { xs: 3, lg: 5 },
          alignItems: 'center',
          py: { xs: 4, md: 7 },
        }}
      >
        <Box sx={{ position: 'relative', minHeight: { xs: 360, lg: 650 }, overflow: 'hidden', borderRadius: 1 }}>
          <Box
            component="img"
            src={heroCar}
            alt="Phụ tùng hiệu năng AEROTEC"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '62% center',
              filter: 'brightness(0.78) contrast(1.08) saturate(1.16)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(5,5,5,0.92), rgba(5,5,5,0.54) 48%, rgba(5,5,5,0.18)), linear-gradient(0deg, rgba(5,5,5,0.86), transparent 42%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.22,
              background:
                'repeating-linear-gradient(102deg, transparent 0 72px, rgba(248,250,252,0.12) 73px 75px, transparent 76px 148px)',
            }}
          />
          <Box sx={{ position: 'absolute', left: { xs: 22, md: 34 }, right: 24, bottom: { xs: 24, md: 38 } }}>
            <Chip
              label="Truy cập tài khoản"
              sx={{
                height: 30,
                color: '#fecdd3',
                border: '1px solid rgba(244,63,94,0.44)',
                background: 'rgba(225,29,72,0.16)',
                fontWeight: 900,
              }}
            />
            <Typography
              component="h1"
              sx={{
                mt: 2,
                maxWidth: 520,
                fontSize: { xs: 42, md: 72 },
                lineHeight: 0.96,
                fontWeight: 950,
              }}
            >
              {sideTitle}
            </Typography>
            <Typography sx={{ mt: 2, maxWidth: 500, color: 'rgba(248,250,252,0.72)', lineHeight: 1.7 }}>
              {sideCopy}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: 620,
            justifySelf: { xs: 'stretch', lg: 'center' },
            p: { xs: 2.5, md: 4 },
            border: '1px solid rgba(248,250,252,0.12)',
            borderRadius: 1,
            background: 'linear-gradient(180deg, rgba(248,250,252,0.08), rgba(248,250,252,0.035)), #080808',
            boxShadow: '0 28px 90px rgba(0,0,0,0.42)',
          }}
        >
          <Chip
            label={eyebrow}
            sx={{
              height: 28,
              color: '#fecdd3',
              border: '1px solid rgba(244,63,94,0.38)',
              background: 'rgba(225,29,72,0.14)',
              fontWeight: 900,
            }}
          />
          <Typography component="h2" sx={{ mt: 2, fontSize: { xs: 34, md: 46 }, lineHeight: 1, fontWeight: 950 }}>
            {title}
          </Typography>
          <Typography sx={{ mt: 1.5, mb: 3, color: 'rgba(248,250,252,0.64)', lineHeight: 1.7 }}>
            {copy}
          </Typography>
          {children}
        </Box>
      </Container>
    </Box>
  )
}
