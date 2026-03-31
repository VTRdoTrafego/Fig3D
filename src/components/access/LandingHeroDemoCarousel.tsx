import { useEffect, useMemo, useState } from 'react'
import { cn } from '../../lib/utils'

const SLIDE_COUNT = 4
const ROTATE_MS = 5000

interface LandingHeroDemoCarouselProps {
  sources: string[]
}

export function LandingHeroDemoCarousel({ sources }: LandingHeroDemoCarouselProps) {
  const slides = useMemo(() => {
    const base = sources.slice(0, SLIDE_COUNT)
    if (base.length >= SLIDE_COUNT) return base
    const pad = base[0] ?? ''
    return Array.from({ length: SLIDE_COUNT }, (_, i) => base[i] ?? pad)
  }, [sources])

  const sourcesKey = slides.join('\0')

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [sourcesKey])

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDE_COUNT)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [])

  const url = slides[index] ?? slides[0] ?? ''

  return (
    <div
      role="region"
      aria-label="Demonstrações GIF 3D alternando entre quatro modelos"
      className="rounded-2xl border border-[rgba(139,92,255,0.22)] bg-[radial-gradient(120%_80%_at_50%_20%,rgba(109,75,255,0.12),rgba(8,9,12,0.92))] p-2 shadow-[var(--shadow-panel)] sm:p-3"
    >
      <img
        key={index}
        src={url}
        alt={`Demonstração ${index + 1} — GIF 3D Fig3D`}
        className="mx-auto h-[min(52vw,300px)] w-full max-w-full object-contain sm:h-[min(44vw,320px)] lg:h-[360px]"
        loading="eager"
        decoding="sync"
      />
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
        {slides.map((_, i) => (
          <span
            key={`hero-demo-dot-${i}`}
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-colors duration-300',
              i === index ? 'bg-violet-300' : 'bg-[rgba(255,255,255,0.22)]',
            )}
          />
        ))}
      </div>
    </div>
  )
}
