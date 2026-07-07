import type { SkillTree } from '@/types'

export function encodeData(data: any): string {
  const json = JSON.stringify(data)
  const base64 = btoa(unescape(encodeURIComponent(json)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeData(encoded: string): { trees: SkillTree[] } | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const json = decodeURIComponent(escape(atob(base64)))
    const data = JSON.parse(json)
    
    if (data.nodes && Array.isArray(data.nodes)) {
      return { trees: [data as SkillTree] }
    }
    if (data.trees && Array.isArray(data.trees)) {
      return { trees: data.trees }
    }
    return null
  } catch (e) {
    console.error('Failed to decode data', e)
    return null
  }
}

export function encodeTree(tree: SkillTree): string {
  return encodeData(tree)
}

export function decodeTree(encoded: string): SkillTree | null {
  const result = decodeData(encoded)
  return result?.trees[0] || null
}