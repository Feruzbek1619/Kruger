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

    <div class="relative container-page py-16 md:py-24 grid gap-10 lg:grid-cols-2 items-center">
      <!-- LEFT: title + form -->
      <div>
        <div class="flex items-center gap-3 mb-4">
          <span class="inline-block h-0.5 w-8 bg-brand-yellow" aria-hidden="true" />
          <p class="text-xs md:text-sm font-bold tracking-[0.22em] text-text-inverse uppercase">СВЯЖИТЕСЬ С НАМИ</p>
        </div>
        <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 leading-[1.1]">
          {{ title }}
        </h2>
        <p class="text-text-inverse mb-8 text-sm md:text-base">{{ subtitle }}</p>

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

          <!-- Bottom row: consent + submit — stack on mobile, row on md+ -->
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-1 pt-2 border-t border-border-soft">
            <Checkbox
              v-model="form.consent"
              required
              :error="errs.consent"
              class="flex-1 md:max-w-sm"
            >
              <span class="text-xs text-text-muted leading-snug">{{ labels.consent }}</span>
            </Checkbox>
            <Button type="submit" :loading="loading" size="md" class="w-full md:w-auto md:shrink-0">
              <span>{{ loading ? labels.sending : labels.submit }}</span>
              <Send v-if="!loading" :size="16" :stroke-width="2" class="ml-1" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>

      <!-- RIGHT: EV cutaway photo (extends to right edge of section) -->
      <div class="hidden lg:flex items-center justify-start -mr-[max(2rem,calc((100vw-80rem)/2))]" aria-hidden="true">
        <img
          src="/electric-vehicle.webp"
          alt=""
          loading="lazy"
          class="w-full max-w-none object-contain"
        />
      </div>
    </div>
  </section>
</template>
