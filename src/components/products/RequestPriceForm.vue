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
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle class="font-display text-xl">{{ title }}</DialogTitle>
        <p class="text-sm text-text-muted">{{ productName }} · {{ productSku }}</p>
      </DialogHeader>
      <form class="grid gap-4 mt-2" novalidate @submit="submit">
        <Input v-model="form.name"  :label="labels.name"  :placeholder="labels.namePh"  :error="errs.name"  required autocomplete="name" />
        <Input v-model="form.email" type="email" :label="labels.email" :placeholder="labels.emailPh" :error="errs.email" required autocomplete="email" />
        <div class="grid grid-cols-2 gap-3">
          <Input v-model="form.phone" type="tel" :label="labels.phone" :placeholder="labels.phonePh" autocomplete="tel" />
          <Input v-model="form.qty"   :label="labels.qty"   :placeholder="labels.qtyPh" />
        </div>
        <Checkbox v-model="form.consent" required :error="errs.consent">
          {{ labels.consent }}
        </Checkbox>
        <Button type="submit" :loading="loading" full-width>
          {{ loading ? labels.sending : labels.submit }}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
