'use server'

import { Resend } from 'resend'
import { z } from 'zod'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

type FormState =
  | { success: true }
  | { success: false; errors: Record<string, string[]>; values: Record<string, string> }
  | { success: false; error: string; values: Record<string, string> }
  | null

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: bots fill this hidden field, humans don't
  if (formData.get('website')) {
    return { success: true }
  }

  const values = {
    fullName: String(formData.get('fullName') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
  }

  // Verify Cloudflare Turnstile token
  const turnstileToken = formData.get('cf-turnstile-response')
  if (!turnstileToken || typeof turnstileToken !== 'string') {
    return { success: false, error: 'Please complete the security check.', values }
  }

  const turnstileResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    },
  )
  const turnstileData = await turnstileResponse.json() as { success: boolean }
  if (!turnstileData.success) {
    return { success: false, error: 'Security check failed. Please try again.', values }
  }

  // Validate fields
  const result = schema.safeParse(values)

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors, values }
  }

  const { fullName, email, message } = result.data

  // Send via Resend
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_ADDRESS!,
    to: process.env.CONTACT_RECIPIENT_EMAIL!,
    subject: `New message from ${fullName}`,
    text: `Name: ${fullName}\nEmail: ${email}\n\nMessage:\n${message}`,
    replyTo: email,
  })

  if (error) {
    console.error('[Resend]', error)
    return { success: false, error: 'Failed to send your message. Please try again later.', values }
  }

  return { success: true }
}
