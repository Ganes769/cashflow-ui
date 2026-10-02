import type { XeroAddress, XeroContact, XeroPhone } from '@/api/types'

export function xeroPhone(phones: XeroPhone[] | null | undefined): string {
  const preferred = phones?.find((p) => p.phone_type === 'DEFAULT' && p.phone_number) ?? phones?.find((p) => p.phone_number)
  if (!preferred?.phone_number) return ''
  return [preferred.phone_country_code, preferred.phone_area_code, preferred.phone_number].filter(Boolean).join(' ')
}

export function xeroCity(addresses: XeroAddress[] | null | undefined): string {
  const preferred = addresses?.find((a) => a.address_type === 'STREET' && a.city) ?? addresses?.find((a) => a.city)
  if (!preferred) return ''
  return [preferred.city, preferred.region].filter(Boolean).join(', ')
}

export function xeroContactName(contact: XeroContact): string {
  const person = contact.contact_persons?.find((p) => p.first_name || p.last_name)
  const fromPerson = [person?.first_name, person?.last_name].filter(Boolean).join(' ')
  if (fromPerson) return fromPerson
  return [contact.first_name, contact.last_name].filter(Boolean).join(' ')
}
