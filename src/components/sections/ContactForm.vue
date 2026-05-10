<script setup lang="ts">
import { reactive, ref } from 'vue'
import { z } from 'zod'
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

function clear() {
  errs.name = errs.email = errs.message = errs.consent = ''
}

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
    // Mock submit; real POST to Django + Telegram bot lands in Phase 12.
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
  <section class="bg-primary text-text-inverse">
    <div class="container-page py-14 md:py-20 grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
      <div>
        <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">{{ title }}</h2>
        <p class="text-text-inverse/85 mb-8">{{ subtitle }}</p>

        <form
          class="bg-bg text-text rounded-xl p-6 md:p-8 grid gap-4 md:gap-5"
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
            :rows="4"
            required
          />
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
            <Checkbox
              v-model="form.consent"
              required
              :error="errs.consent"
            >
              {{ labels.consent }}
            </Checkbox>
            <Button type="submit" :loading="loading" size="md">
              {{ loading ? labels.sending : labels.submit }}
            </Button>
          </div>
        </form>
      </div>
      <div class="hidden lg:flex items-center justify-center">
        <svg viewBox="0 0 600 380" class="w-full max-w-md text-text-inverse/15" aria-hidden="true">
          <ellipse cx="300" cy="320" rx="260" ry="20" fill="currentColor" />
          <path d="M80 240l40-100c10-25 35-45 65-45h230c30 0 55 20 65 45l40 100v60H80v-60Z" fill="var(--color-illus-dark)" opacity=".6"/>
          <rect x="100" y="195" width="120" height="55" rx="8" fill="white" opacity=".7"/>
          <rect x="380" y="195" width="120" height="55" rx="8" fill="white" opacity=".7"/>
          <circle cx="170" cy="290" r="35" fill="var(--color-illus-deep)"/>
          <circle cx="170" cy="290" r="14" fill="white" opacity=".4"/>
          <circle cx="430" cy="290" r="35" fill="var(--color-illus-deep)"/>
          <circle cx="430" cy="290" r="14" fill="white" opacity=".4"/>
        </svg>
      </div>
    </div>
  </section>
</template>
