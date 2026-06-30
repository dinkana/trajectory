import type { SkillTree } from '@/types'

export function encodeTree(tree: SkillTree): string {
  const json = JSON.stringify(tree)
  const base64 = btoa(unescape(encodeURIComponent(json)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeTree(encoded: string): SkillTree | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const json = decodeURIComponent(escape(atob(base64)))
    return JSON.parse(json) as SkillTree
  } catch (e) {
    console.error('Failed to decode tree', e)
    return null
  }
}