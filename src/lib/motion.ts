/**
 * Motion One helpers — единое место для анимаций.
 *
 * - reduceMotion(): true если у юзера включён prefers-reduced-motion
 * - revealOnScroll(): анимирует .kr-reveal элементы при попадании во вьюпорт
 * - countUp(): плавно увеличивает число от 0 до target при появлении
 *
 * Подключаем в Layout (один раз для страницы) — реагирует на новые
 * элементы через MutationObserver, чтобы переживать View Transitions.
 */
import { animate, inView } from 'motion'

export function reduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function revealOnScroll(root: Document | HTMLElement = document) {
  if (reduceMotion()) {
    root.querySelectorAll<HTMLElement>('.kr-reveal').forEach((el) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
    return
  }
  inView(
    root.querySelectorAll<HTMLElement>('.kr-reveal'),
    (info) => {
      const target = info.target as HTMLElement
      // Motion One v11 keyframes for DOM elements
      ;(animate as any)(
        target,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.5, easing: 'ease-out' },
      )
      return () => {}
    },
    { amount: 0.15 },
  )
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
  const els = root.querySelectorAll<HTMLElement>('[data-countup]')
  if (!els.length) return
  inView(
    els,
    (info) => {
      const el = info.target as HTMLElement
      const target = el.dataset.countup ?? el.textContent ?? ''
      countUp(el, target)
      return () => {}
    },
    { amount: 0.5 },
  )
}
