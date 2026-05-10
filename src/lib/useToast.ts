import { reactive, readonly } from 'vue'

type Kind = 'info' | 'success' | 'error'
interface Toast {
  id: number
  kind: Kind
  message: string
}

const state = reactive<{ list: Toast[] }>({ list: [] })
let nextId = 1

function push(kind: Kind, message: string, ttl = 4000) {
  const id = nextId++
  state.list.push({ id, kind, message })
  if (ttl > 0) setTimeout(() => dismiss(id), ttl)
  return id
}

function dismiss(id: number) {
  const idx = state.list.findIndex((t) => t.id === id)
  if (idx >= 0) state.list.splice(idx, 1)
}

export function useToast() {
  return {
    toasts: readonly(state.list) as unknown as Toast[],
    info: (m: string, ttl?: number) => push('info', m, ttl),
    success: (m: string, ttl?: number) => push('success', m, ttl),
    error: (m: string, ttl?: number) => push('error', m, ttl),
    dismiss,
  }
}
