<script setup lang="ts">
import { reactive, ref } from 'vue'
import { z } from 'zod'
import Input from '@/components/ui/Input.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Button from '@/components/ui/Button.vue'
import { useToast } from '@/lib/useToast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/shadcn/dialog'

interface Props {
  productName: string
  productSku: string
  triggerLabel: string
  title: string
  labels: {
    name: string
    namePh: string
    email: string
    emailPh: string
    phone: string
    phonePh: string
    qty: string
    qtyPh: string
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
    consent: string
  }
}
const props = defineProps<Props>()
const toast = useToast()
const open = ref(false)

const form = reactive({ name: '', email: '', phone: '', qty: '', consent: false })
const errs = reactive({ name: '', email: '', consent: '' })
const loading = ref(false)

const schema = z.object({
  name: z.string().trim().min(1, props.errors.name),
  email: z.string().trim().min(1, props.errors.emailRequired).email(props.errors.emailInvalid),
  consent: z.literal(true, { errorMap: () => ({ message: props.errors.consent }) }),
})

async function submit(e: Event) {
  e.preventDefault()
  errs.name = errs.email = errs.consent = ''
  const r = schema.safeParse(form)
  if (!r.success) {
    for (const i of r.error.issues) {
      const k = i.path[0] as keyof typeof errs
      errs[k] = i.message
    }
    return
  }
  loading.value = true
  try {
    await new Promise((res) => setTimeout(res, 700))
    toast.success(props.labels.successToast)
    Object.assign(form, { name: '', email: '', phone: '', qty: '', consent: false })
    open.value = false
  } catch {
    toast.error(props.labels.errorToast)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger asChild>
      <Button variant="primary" size="md">{{ triggerLabel }}</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-xl p-0 overflow-hidden gap-0 border-border-soft">
      <!-- Brand stripe + header -->
      <div class="relative bg-bg-soft px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-border-soft">
        <span class="absolute top-0 left-0 right-0 h-1 bg-brand-yellow" aria-hidden="true" />
        <DialogHeader class="space-y-1">
          <div class="inline-flex items-center gap-2 mb-2">
            <span class="inline-block h-0.5 w-6 bg-primary" aria-hidden="true" />
            <span class="text-[10px] md:text-xs font-bold tracking-[0.18em] text-primary uppercase">Запрос цены</span>
          </div>
          <DialogTitle class="font-display text-2xl md:text-3xl font-extrabold leading-tight text-text">{{ title }}</DialogTitle>
          <p class="text-sm text-text-muted">
            <span class="font-medium text-text">{{ productName }}</span>
            <span class="mx-1.5 text-text-subtle">·</span>
            <span class="font-mono">{{ productSku }}</span>
          </p>
        </DialogHeader>
      </div>

      <form class="grid gap-4 px-6 md:px-8 py-6 md:py-7" novalidate @submit="submit">
        <Input v-model="form.name"  :label="labels.name"  :placeholder="labels.namePh"  :error="errs.name"  required autocomplete="name" />
        <Input v-model="form.email" type="email" :label="labels.email" :placeholder="labels.emailPh" :error="errs.email" required autocomplete="email" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input v-model="form.phone" type="tel" :label="labels.phone" :placeholder="labels.phonePh" autocomplete="tel" />
          <Input v-model="form.qty"   :label="labels.qty"   :placeholder="labels.qtyPh" />
        </div>
        <Checkbox v-model="form.consent" required :error="errs.consent">
          <span class="text-xs text-text-muted leading-snug">{{ labels.consent }}</span>
        </Checkbox>
        <Button type="submit" :loading="loading" full-width class="mt-1">
          {{ loading ? labels.sending : labels.submit }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
