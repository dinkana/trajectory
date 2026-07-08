<script setup lang="ts">
import { ref } from 'vue'
import type { SkillTree } from '@/types'

const props = defineProps<{
  tree: SkillTree
  viewBox: { x: number, y: number, w: number, h: number }
  completedNodes: string[]
  pulsingEdges: string[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'node-click', nodeId: string): void
}>()

const svgRef = ref<SVGSVGElement | null>(null)
defineExpose({ svgRef })

const NODE_W = 160
const NODE_H = 48

function getRectEdgePoint(cx: number, cy: number, tx: number, ty: number) {
  const dx = tx - cx
  const dy = ty - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const halfW = NODE_W / 2
  const halfH = NODE_H / 2
  let scale = 1
  if (Math.abs(dx) * halfH > Math.abs(dy) * halfW) {
    scale = halfW / Math.abs(dx)
  } else {
    scale = halfH / Math.abs(dy)
  }
  return { x: cx + dx * scale, y: cy + dy * scale }
}

function getEdgePath(fromId: string, toId: string): string {
  const fromNode = props.tree.nodes.find(n => n.id === fromId)
  const toNode = props.tree.nodes.find(n => n.id === toId)
  if (!fromNode || !toNode) return ''
  const start = getRectEdgePoint(fromNode.x, fromNode.y, toNode.x, toNode.y)
  const end = getRectEdgePoint(toNode.x, toNode.y, fromNode.x, fromNode.y)
  const dx = end.x - start.x
  const cpOffset = Math.min(Math.abs(dx) * 0.4, 60)
  const cp1x = start.x + (dx > 0 ? cpOffset : -cpOffset)
  const cp2x = end.x - (dx > 0 ? cpOffset : -cpOffset)
  return `M${start.x},${start.y} C${cp1x},${start.y} ${cp2x},${end.y} ${end.x},${end.y}`
}

function isCompleted(nodeId: string): boolean {
  return props.completedNodes.includes(nodeId)
}

function isUnlocked(nodeId: string): boolean {
  const incoming = props.tree.edges.filter(e => e.to === nodeId)
  if (incoming.length === 0) return true
  return incoming.every(e => props.completedNodes.includes(e.from))
}

function getNodeFill(nodeId: string): string {
  const node = props.tree.nodes.find(n => n.id === nodeId)
  if (isCompleted(nodeId)) return '#10b981'
  if (node?.color) return node.color
  if (!isUnlocked(nodeId)) return props.isDark ? '#1f2937' : '#f3f4f6'
  return props.isDark ? '#1f2937' : '#ffffff'
}

function getNodeStroke(nodeId: string): string {
  if (isCompleted(nodeId)) return '#059669'
  const node = props.tree.nodes.find(n => n.id === nodeId)
  if (node?.color) return node.color
  if (!isUnlocked(nodeId)) return props.isDark ? '#374151' : '#d1d5db'
  return '#3b82f6'
}

function getNodeTextColor(nodeId: string): string {
  const node = props.tree.nodes.find(n => n.id === nodeId)
  if (isCompleted(nodeId) || node?.color) return '#ffffff'
  if (!isUnlocked(nodeId)) return props.isDark ? '#6b7280' : '#9ca3af'
  return props.isDark ? '#f3f4f6' : '#111827'
}
</script>

<template>
  <svg
    ref="svgRef"
    class="w-full h-full touch-none"
    :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
    overflow="visible"
  >
    <rect id="bg-tracker" x="-10000" y="-10000" width="20000" height="20000" fill="transparent" />
    <defs>
      <pattern id="grid-tracker" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" :stroke="isDark ? '#374151' : '#d1d5db'" stroke-width="0.5" opacity="0.4" />
      </pattern>
    </defs>
    <rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid-tracker)" />

    <g>
      <template v-for="edge in tree.edges" :key="edge.id">
        <path
          :d="getEdgePath(edge.from, edge.to)"
          fill="none"
          :stroke="isCompleted(edge.from) ? (isDark ? '#34d399' : '#10b981') : (isDark ? '#4b5563' : '#9ca3af')"
          stroke-width="3"
          stroke-linecap="butt"
        />
        <path
          v-if="pulsingEdges.includes(edge.id)"
          :d="getEdgePath(edge.from, edge.to)"
          fill="none"
          stroke="#34d399"
          stroke-width="4"
          stroke-linecap="round"
          class="edge-pulse"
        />
      </template>
    </g>

    <g
      v-for="node in tree.nodes"
      :key="node.id"
      :transform="`translate(${node.x},${node.y})`"
      class="transition-transform cursor-pointer"
      @click.stop="emit('node-click', node.id)"
    >
      <rect
        x="-80" y="-24" width="160" height="48" rx="24"
        stroke-width="2"
        :fill="getNodeFill(node.id)"
        :stroke="getNodeStroke(node.id)"
      />
      <text
        x="0" y="5"
        text-anchor="middle"
        class="text-sm font-semibold pointer-events-none select-none"
        :fill="getNodeTextColor(node.id)"
      >
        {{ node.title.length > 18 ? node.title.substring(0, 18) + '...' : node.title }}
      </text>

      <g v-if="isCompleted(node.id)" transform="translate(60, 0)">
        <circle cx="0" cy="0" r="10" fill="#ffffff" class="opacity-20" />
        <path d="M-4 0 L-1 3 L4 -3" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <g v-if="!isCompleted(node.id) && !isUnlocked(node.id)" transform="translate(60, 0)" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
        <rect x="-4.5" y="-1" width="9" height="7" rx="1.5" fill="currentColor" />
        <path d="M-2.5 -1 V-3.5 A2.5 2.5 0 0 1 2.5 -3.5 V-1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </g>
    </g>
  </svg>
</template>