import { useEffect, useRef, useState, type PropsWithChildren, type TransitionEvent } from 'react'
import { cn } from '../../lib/utils'

interface SectionRevealProps {
  className?: string
  delayMs?: number
  y?: number
  once?: boolean
}

export function SectionReveal({
  className,
  delayMs = 0,
  y = 16,
  once = true,
  children,
}: PropsWithChildren<SectionRevealProps>) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  /** WebKit (Safari/iOS) congela GIFs dentro de ancestrais com transform; removemos após a animação. */
  const [transformDone, setTransformDone] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      queueMicrotask(() => {
        setVisible(true)
        setTransformDone(true)
      })
      return
    }

    const node = rootRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once])

  useEffect(() => {
    if (!visible) {
      queueMicrotask(() => setTransformDone(false))
    }
  }, [visible])

  useEffect(() => {
    if (!visible || transformDone) return
    const ms = delayMs + 580
    const id = window.setTimeout(() => setTransformDone(true), ms)
    return () => window.clearTimeout(id)
  }, [visible, transformDone, delayMs])

  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (!visible) return
    if (e.propertyName !== 'opacity' && e.propertyName !== 'transform') return
    setTransformDone(true)
  }

  const transform =
    !visible ? `translate3d(0,${y}px,0)` : transformDone ? 'none' : 'translate3d(0,0,0)'

  const motionEase = 'var(--motion-ease)'
  const style = transformDone
    ? {
        opacity: visible ? 1 : 0,
        transform,
        transitionProperty: 'opacity' as const,
        transitionDuration: '540ms',
        transitionTimingFunction: motionEase,
        transitionDelay: `${delayMs}ms`,
      }
    : {
        opacity: visible ? 1 : 0,
        transform,
        transitionProperty: 'opacity, transform' as const,
        transitionDuration: '540ms, 540ms',
        transitionTimingFunction: `${motionEase}, ${motionEase}`,
        transitionDelay: `${delayMs}ms, ${delayMs}ms`,
      }

  return (
    <div
      ref={rootRef}
      className={cn(!transformDone && visible ? 'will-change-transform' : undefined, className)}
      onTransitionEnd={onTransitionEnd}
      style={style}
    >
      {children}
    </div>
  )
}
