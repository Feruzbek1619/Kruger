/**
 * Motion One helpers — единое место для анимаций.
 *
 * - reduceMotion(): true если у юзера включён prefers-reduced-motion
 * - revealOnScroll(): анимирует .kr-reveal элементы при попадании во вьюпорт
 * - countUp(): плавно увеличивает число от 0 до target при появлении
 *
 * Reveal использует CSS transition + IntersectionObserver — это
 * надёжнее WAAPI/Motion (которые иногда зависают из-за конфликта с
 * Lenis-driver на mobile). Safety-net через 2.5с принудительно
 * показывает всё, что осталось скрытым.
 */
import { animate } from 'motion'

export function reduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function reveal(el: HTMLElement) {
  el.classList.add('is-revealed')
}

export function revealOnScroll(root: Document | HTMLElement = document) {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('.kr-reveal'))
  if (!elements.length) return

  if (reduceMotion()) {
    elements.forEach(reveal)
    return
  }

  // Safety-net: через 2.5с откроем всё что осталось — на случай если
  // IntersectionObserver не сработал по любой причине.
  const safetyTimer = window.setTimeout(() => {
    elements.forEach((el) => {
      if (!el.classList.contains('is-revealed')) reveal(el)
    })
  }, 2500)

  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach(reveal)
    clearTimeout(safetyTimer)
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        reveal(entry.target as HTMLElement)
        io.unobserve(entry.target)
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
  )

  elements.forEach((el) => io.observe(el))
}

interface CountUpOptions { duration?: number; suffix?: string }

export function countUp(el: HTMLElement, target: string | number, opts: CountUpOptions = {}) {
  const raw = String(target).trim()
  const match = raw.match(/^(\d+(?:[.,]\d+)?)([a-zA-Zа-яА-Я+]*)$/)
  if (!match) {
    el.textContent = raw
    return
  }
  const num = parseFloat(match[1].replace(',', '.'))
  const suffix = opts.suffix ?? match[2] ?? ''
  if (reduceMotion()) {
    el.textContent = raw
    return
  }
  const duration = opts.duration ?? 1.4
  animate(
    (progress: number) => {
      const v = num * progress
      const formatted = num >= 100 ? Math.round(v).toString() : v.toFixed(1).replace(/\.0$/, '')
      el.textContent = formatted + suffix
    },
    { duration, easing: 'ease-out' },
  )
}

export function bindCountUps(root: Document | HTMLElement = document) {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-countup]'))
  if (!els.length) return

  if (typeof IntersectionObserver === 'undefined') {
    els.forEach((el) => countUp(el, el.dataset.countup ?? el.textContent ?? ''))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        const target = el.dataset.countup ?? el.textContent ?? ''
        countUp(el, target)
        io.unobserve(el)
      })
    },
    { threshold: 0.5 },
  )

  els.forEach((el) => io.observe(el))
}
