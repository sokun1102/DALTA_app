import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { videoStages } from '../utils/constants'

export default function TeardownStory() {
  return (
    <section className="teardown-story" id="engineering">
      <Container maxWidth="xl">
        <Box className="story-heading">
          <Chip className="scarlet-chip" label="Engineering story" />
          <Typography component="h2" className="section-title">
            Three stages. One machine.
          </Typography>
          <Typography className="section-copy">
            Ba clip được tách thành ba đoạn nối tiếp: tổng thể xe, hệ động cơ,
            rồi bánh/phanh. Mỗi đoạn có nội dung riêng nên không còn vùng đen
            vô nghĩa.
          </Typography>
        </Box>
      </Container>

      {videoStages.map((stage, index) => (
        <article className="story-stage" key={stage.id}>
          <Container maxWidth="xl" className="story-stage-inner">
            <Box className="story-copy">
              <Chip className="scarlet-chip" label={`Stage ${stage.number}`} />
              <Typography component="h3" className="story-title">
                {stage.title}
              </Typography>
              <Typography className="story-subtitle">{stage.subtitle}</Typography>
              <Typography className="story-text">{stage.narrative}</Typography>
              <Box className="story-points">
                {stage.points.map((point) => (
                  <span key={point}>{point}</span>
                ))}
              </Box>
            </Box>

            <Box className="story-video" aria-label={stage.title}>
              <div className="speed-grid" />
              <video
                className="teardown-video"
                src={stage.src}
                autoPlay
                muted
                loop
                playsInline
                preload={index === 0 ? 'auto' : 'metadata'}
              />
              <div className="video-vignette" />
              <div className="video-caption">
                <span>{stage.number}</span>
                <strong>{stage.title}</strong>
                <small>{stage.subtitle}</small>
              </div>
            </Box>
          </Container>
        </article>
      ))}
    </section>
  )
}
