import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

interface AnimatedCounterProps {
  value: number
  decimals?: number
  durationMs?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  decimals = 0,
  durationMs = 900,
  prefix = '',
  suffix = '',
  className,
}: AnimatedCounterProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const [renderValue, setRenderValue] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      queueMicrotask(() => setRenderValue(value))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.35 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [value])

  useEffect(() => {
    if (!started) return
    let raf = 0
    const startedAt = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startedAt
      const progress = Math.min(1, elapsed / durationMs)
      const eased = 1 - (1 - progress) * (1 - progress)
      setRenderValue(value * eased)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [durationMs, started, value])

  const formatted = useMemo(() => {
    const numberFormatter = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    return `${prefix}${numberFormatter.format(renderValue)}${suffix}`
  }, [decimals, prefix, renderValue, suffix])

  return (
    <span ref={rootRef} className={cn('metric-mono', className)}>
      {formatted}
    </span>
  )
}
