/**
 * Lenis smooth scroll — премиальный плавный скролл.
 * Subtle (lerp 0.1), не exaggerated. Уважает prefers-reduced-motion.
 *
 * Использование:
 *   <script>
 *     import { initLenis } from '@/lib/lenis'
 *     document.addEventListener('astro:page-load', initLenis)
 *   </script>
 */
import Lenis from 'lenis'

let instance: Lenis | null = null

export function initLenis() {
  if (typeof window === 'undefined') return
  // Уважаем reduced-motion — никакого smooth scroll
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Не запускаем повторно после view transition
  if (instance) {
    instance.destroy()
    instance = null
  }
  instance = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // out-expo, subtle
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    syncTouch: false,
  })
  function raf(time: number) {
    instance?.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
}

export function destroyLenis() {
  if (instance) {
    instance.destroy()
    instance = null
  }
}
