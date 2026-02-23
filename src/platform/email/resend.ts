import { RESEND_CONFIG, SITE_CONFIG } from '@/lib/env'
import { Resend } from 'resend'

export const resend = new Resend(RESEND_CONFIG.apiKey)

export const FROM_EMAIL = SITE_CONFIG.brand.email

export const FROM_NAME = SITE_CONFIG.brand.name

/** Convenience sender string: "BroLab Entertainment <contact@brolabentertainment.com>" */
export const FROM = `${FROM_NAME} <${FROM_EMAIL}>`
