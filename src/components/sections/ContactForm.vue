<script setup lang="ts">
import { reactive, ref } from 'vue'
import { z } from 'zod'
import { Send } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Button from '@/components/ui/Button.vue'
import { useToast } from '@/lib/useToast'

interface Props {
  title: string
  subtitle: string
  labels: {
    name: string
    namePh: string
    phone: string
    phonePh: string
    email: string
    emailPh: string
    message: string
    messagePh: string
    consent: string
    submit: string
    sending: string
    successToast: string
    errorToast: string
  }
  errors: {
    name: string
    emailRequired: string
    emailInvalid: string
    message: string
    consent: string
  }
}
const props = defineProps<Props>()
const toast = useToast()

const form = reactive({ name: '', phone: '', email: '', message: '', consent: false })
const errs = reactive({ name: '', email: '', message: '', consent: '' })
const loading = ref(false)

const schema = z.object({
  name: z.string().trim().min(1, props.errors.name),
  email: z.string().trim().min(1, props.errors.emailRequired).email(props.errors.emailInvalid),
  message: z.string().trim().min(1, props.errors.message),
  consent: z.literal(true, { errorMap: () => ({ message: props.errors.consent }) }),
})

function clear() { errs.name = errs.email = errs.message = errs.consent = '' }

async function submit(e: Event) {
  e.preventDefault()
  clear()
  const result = schema.safeParse(form)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const k = issue.path[0] as keyof typeof errs
      errs[k] = issue.message
    }
    return
  }
  loading.value = true
  try {
    await new Promise((r) => setTimeout(r, 800))
    toast.success(props.labels.successToast)
    form.name = ''
    form.phone = ''
    form.email = ''
    form.message = ''
    form.consent = false
  } catch {
    toast.error(props.labels.errorToast)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="relative bg-primary text-text-inverse overflow-hidden">
    <!-- Yellow brand stripe top -->
    <span class="absolute top-0 left-0 right-0 h-1 bg-brand-yellow" aria-hidden="true" />
    <!-- Diagonal yellow accent -->
    <div
      class="absolute -right-32 -bottom-40 w-72 h-[36rem] rotate-[18deg] bg-brand-yellow/[0.08] pointer-events-none"
      aria-hidden="true"
    />

    <div class="relative container-page py-14 md:py-20 grid gap-10 lg:grid-cols-[1.05fr_1fr] items-center">
      <!-- LEFT: title + form -->
      <div>
        <div class="flex items-center gap-3 mb-4">
          <span class="inline-block h-0.5 w-8 bg-brand-yellow" aria-hidden="true" />
          <p class="text-[10px] md:text-xs font-bold tracking-[0.22em] text-brand-yellow uppercase">Get in Touch</p>
        </div>
        <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 leading-[1.1]">
          {{ title }}
        </h2>
        <p class="text-text-inverse/85 mb-8 text-sm md:text-base">{{ subtitle }}</p>

        <form
          class="bg-bg text-text rounded-2xl p-6 md:p-8 grid gap-4 md:gap-5 shadow-xl"
          novalidate
          @submit="submit"
        >
          <div class="grid md:grid-cols-2 gap-4">
            <Input
              v-model="form.name"
              :label="labels.name"
              :placeholder="labels.namePh"
              :error="errs.name"
              required
              autocomplete="name"
            />
            <Input
              v-model="form.phone"
              type="tel"
              :label="labels.phone"
              :placeholder="labels.phonePh"
              autocomplete="tel"
            />
          </div>
          <Input
            v-model="form.email"
            type="email"
            :label="labels.email"
            :placeholder="labels.emailPh"
            :error="errs.email"
            required
            autocomplete="email"
          />
          <Input
            v-model="form.message"
            type="textarea"
            :label="labels.message"
            :placeholder="labels.messagePh"
            :error="errs.message"
            :rows="3"
            required
          />

          <!-- Bottom row: consent (left) + submit (right) — как в Figma -->
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-1 pt-2 border-t border-border-soft">
            <Checkbox
              v-model="form.consent"
              required
              :error="errs.consent"
              class="flex-1 sm:max-w-sm"
            >
              <span class="text-xs text-text-muted leading-snug">{{ labels.consent }}</span>
            </Checkbox>
            <Button type="submit" :loading="loading" size="md" class="shrink-0">
              <span>{{ loading ? labels.sending : labels.submit }}</span>
              <Send v-if="!loading" :size="16" :stroke-width="2" class="ml-1" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>

      <!-- RIGHT: technical car cutaway illustration (как в Figma — wireframe двигателя/EV) -->
      <div class="hidden lg:flex items-center justify-center" aria-hidden="true">
        <svg viewBox="0 0 600 380" class="w-full max-w-lg" fill="none" stroke="currentColor" stroke-width="1.5">
          <!-- Car body silhouette (transparent wireframe) -->
          <path
            d="M60 280 L100 180 Q120 140 160 130 L260 120 Q300 110 340 115 L450 130 Q480 135 500 160 L540 220 L555 280 L555 305 Q555 315 545 315 L470 315 Q465 295 445 295 Q425 295 420 315 L180 315 Q175 295 155 295 Q135 295 130 315 L55 315 Q45 315 45 305 L45 280 Q45 275 60 280 Z"
            stroke="white"
            stroke-opacity="0.45"
          />
          <!-- Windows -->
          <path d="M170 165 L240 145 L320 145 L400 165 L420 220 L160 220 Z" stroke="white" stroke-opacity="0.3" />
          <path d="M285 145 L285 220" stroke="white" stroke-opacity="0.3" />

          <!-- Wheels -->
          <circle cx="143" cy="305" r="32" stroke="white" stroke-opacity="0.5" />
          <circle cx="143" cy="305" r="22" stroke="white" stroke-opacity="0.35" />
          <circle cx="143" cy="305" r="8" fill="white" fill-opacity="0.2" stroke="none" />
          <circle cx="433" cy="305" r="32" stroke="white" stroke-opacity="0.5" />
          <circle cx="433" cy="305" r="22" stroke="white" stroke-opacity="0.35" />
          <circle cx="433" cy="305" r="8" fill="white" fill-opacity="0.2" stroke="none" />

          <!-- Engine block (left side, technical) -->
          <rect x="100" y="195" width="80" height="60" rx="3" stroke="white" stroke-opacity="0.5" />
          <rect x="110" y="205" width="22" height="40" rx="1" stroke="white" stroke-opacity="0.3" />
          <rect x="138" y="205" width="22" height="40" rx="1" stroke="white" stroke-opacity="0.3" />
          <line x1="121" y1="195" x2="121" y2="190" stroke="white" stroke-opacity="0.35" />
          <line x1="149" y1="195" x2="149" y2="190" stroke="white" stroke-opacity="0.35" />

          <!-- EV battery pack (centre/right, transparent rectangle) -->
          <rect x="195" y="240" width="220" height="48" rx="3" stroke="white" stroke-opacity="0.4" />
          <line x1="225" y1="240" x2="225" y2="288" stroke="white" stroke-opacity="0.25" />
          <line x1="265" y1="240" x2="265" y2="288" stroke="white" stroke-opacity="0.25" />
          <line x1="305" y1="240" x2="305" y2="288" stroke="white" stroke-opacity="0.25" />
          <line x1="345" y1="240" x2="345" y2="288" stroke="white" stroke-opacity="0.25" />
          <line x1="385" y1="240" x2="385" y2="288" stroke="white" stroke-opacity="0.25" />

          <!-- Yellow + red wiring lines (брендовые цвета на разрезе) -->
          <path d="M165 215 Q200 200 220 235" style="stroke: var(--color-brand-yellow)" stroke-opacity="0.85" stroke-width="2" />
          <path d="M180 220 Q220 215 250 235" style="stroke: var(--color-brand-yellow)" stroke-opacity="0.7" stroke-width="2" />
          <circle cx="220" cy="235" r="3" style="fill: var(--color-brand-yellow)" stroke="none" />
          <circle cx="250" cy="235" r="3" style="fill: var(--color-brand-yellow)" stroke="none" />

          <path d="M415 215 Q450 200 460 175" style="stroke: var(--color-primary)" stroke-opacity="0.9" stroke-width="2" />
          <path d="M400 230 Q440 215 480 195" style="stroke: var(--color-primary)" stroke-opacity="0.7" stroke-width="2" />
          <circle cx="460" cy="175" r="3" style="fill: var(--color-primary)" stroke="none" />
          <circle cx="480" cy="195" r="3" style="fill: var(--color-primary)" stroke="none" />

          <!-- Drivetrain shaft -->
          <line x1="180" y1="265" x2="190" y2="265" stroke="white" stroke-opacity="0.5" stroke-width="3" />
          <line x1="415" y1="265" x2="425" y2="265" stroke="white" stroke-opacity="0.5" stroke-width="3" />

          <!-- Tech labels (mini ticks) -->
          <g stroke="white" stroke-opacity="0.3" stroke-width="0.8">
            <line x1="220" y1="240" x2="220" y2="220" />
            <line x1="220" y1="220" x2="240" y2="220" />
            <line x1="385" y1="240" x2="385" y2="218" />
            <line x1="385" y1="218" x2="370" y2="218" />
          </g>
        </svg>
      </div>
    </div>
  </section>
</template>
