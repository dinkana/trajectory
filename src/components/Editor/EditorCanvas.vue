<script setup lang="ts">
import { ref } from 'vue'
import type { SkillTree } from '@/types'

defineProps<{
  tree: SkillTree
  viewBox: { x: number, y: number, w: number, h: number }
  ghostLinePath: string
  isCreating: boolean
  draggingNode: string | null
  selectedNodeId: string | null
  isDark: boolean
  getEdgePath: (from: string, to: string) => string
}>()

const emit = defineEmits<{
  (e: 'canvas-mousedown', event: MouseEvent): void
  (e: 'node-mousedown', event: MouseEvent, node: any): void
  (e: 'handle-mousedown', event: MouseEvent, node: any): void
  (e: 'mousemove', event: MouseEvent): void
  (e: 'mouseup', event: MouseEvent): void
  (e: 'wheel', event: WheelEvent): void
  (e: 'touchstart', event: TouchEvent): void
  (e: 'node-touchstart', event: TouchEvent, node: any): void
  (e: 'touchmove', event: TouchEvent): void
  (e: 'touchend', event: TouchEvent): void
  (e: 'node-dblclick', event: MouseEvent, node: any): void
}>()

const svgRef = ref<SVGSVGElement | null>(null)
defineExpose({ svgRef })
</script>

<template>
  <div class="flex-1 overflow-hidden relative touch-none" :class="{ 'cursor-crosshair': isCreating, 'cursor-grab': !isCreating && !draggingNode }">
    <svg 
      ref="svgRef"
      class="w-full h-full touch-none" 
      :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
      @mousedown="$emit('canvas-mousedown', $event)"
      @mousemove="$emit('mousemove', $event)"
      @mouseup="$emit('mouseup', $event)"
      @mouseleave="$emit('mouseup', $event)"
      @wheel.prevent="$emit('wheel', $event)"
      @touchstart.prevent="$emit('touchstart', $event)"
      @touchmove.prevent="$emit('touchmove', $event)"
      @touchend.prevent="$emit('touchend', $event)"
      @contextmenu.prevent
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5" class="text-gray-300 dark:text-gray-800"/>
        </pattern>
      </defs>
      <rect id="bg-editor" x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid)"/>
      
      <g>
        <path v-for="edge in tree.edges" :key="edge.id" :d="getEdgePath(edge.from, edge.to)" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-gray-500 dark:text-gray-500"/>
      </g>
      
      <path v-if="ghostLinePath" :d="ghostLinePath" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6,6" stroke-linecap="round" class="pointer-events-none"/>
      
      <g 
        v-for="node in tree.nodes" 
        :key="node.id" 
        :data-node-id="node.id" 
        :transform="`translate(${node.x},${node.y})`" 
        class="node-group" 
        :class="draggingNode === node.id ? 'cursor-grabbing' : 'cursor-grab'"
        @mousedown="$emit('node-mousedown', $event, node)"
        @dblclick="$emit('node-dblclick', $event, node)"
        @touchstart="$emit('node-touchstart', $event, node)"
      >
        <rect 
          x="-70" y="-24" width="140" height="48" rx="12" 
          class="transition-all duration-200"
          :class="{
            'stroke-blue-500 dark:stroke-blue-400 stroke-2 shadow-lg': selectedNodeId === node.id,
            'stroke-gray-400 dark:stroke-gray-600 stroke-1.5 shadow-sm': selectedNodeId !== node.id
          }"
          :fill="node.color || (isDark ? '#1f2937' : '#ffffff')"
        />
        <text 
          x="0" y="5" text-anchor="middle" 
          class="text-sm font-semibold pointer-events-none select-none"
          :fill="node.color ? '#ffffff' : (isDark ? '#f3f4f6' : '#111827')"
        >
          {{ node.title.length > 16 ? node.title.substring(0, 16) + '...' : node.title }}
        </text>
        <circle 
          cx="70" cy="0" r="6" 
          class="fill-blue-500 dark:fill-blue-400 stroke-white dark:stroke-gray-800 stroke-2 cursor-crosshair opacity-0 hover:opacity-100 transition-opacity"
          :class="{ 'opacity-100': selectedNodeId === node.id }"
          @mousedown="$emit('handle-mousedown', $event, node)"
        />
      </g>
    </svg>
  </div>
</template>