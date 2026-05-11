<script setup lang="ts">
import { reactive, ref } from 'vue'
import { z } from 'zod'
import Input from '@/components/ui/Input.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Button from '@/components/ui/Button.vue'
import { useToast } from '@/lib/useToast'

interface Props {
  topics: string[]
  topicLabel: string
  topicPh: string
  companyLabel: string
  companyPh: string
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

const form = reactive({
  topic: '',
  name: '',
  company: '',
  phone: '',
  email: '',
  message: '',
  consent: false,
})
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
    Object.assign(form, { topic: '', name: '', company: '', phone: '', email: '', message: '', consent: false })
  } catch {
    toast.error(props.labels.errorToast)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form
    class="bg-bg text-text rounded-xl p-6 md:p-8 grid gap-4 md:gap-5 border border-border-soft"
    novalidate
    @submit="submit"
  >
    <label class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-text">{{ topicLabel }}</span>
      <select
        v-model="form.topic"
        class="w-full h-12 rounded-md bg-bg-soft border-2 border-input hover:border-muted-foreground/50 focus:border-primary focus:bg-bg px-4 text-base text-text transition-colors focus:outline-none"
      >
        <option value="" disabled>{{ topicPh }}</option>
        <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
      </select>
    </label>

    <div class="grid md:grid-cols-2 gap-4">
      <Input v-model="form.name"    :label="labels.name"    :placeholder="labels.namePh" :error="errs.name" required autocomplete="name" />
      <Input v-model="form.company" :label="companyLabel"   :placeholder="companyPh" autocomplete="organization" />
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <Input v-model="form.phone" type="tel"   :label="labels.phone" :placeholder="labels.phonePh" autocomplete="tel" />
      <Input v-model="form.email" type="email" :label="labels.email" :placeholder="labels.emailPh" :error="errs.email" required autocomplete="email" />
    </div>

    <Input v-model="form.message" type="textarea" :label="labels.message" :placeholder="labels.messagePh" :error="errs.message" :rows="5" required />

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
      <Checkbox v-model="form.consent" required :error="errs.consent">{{ labels.consent }}</Checkbox>
      <Button type="submit" :loading="loading" size="md">{{ loading ? labels.sending : labels.submit }}</Button>
    </div>
  </form>
</template>
