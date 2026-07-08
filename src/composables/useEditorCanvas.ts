import { ref, computed, type Ref } from 'vue'
import type { SkillTree, SkillNode } from '@/types'

export function useEditorCanvas(
  tree: Ref<SkillTree>,
  svgRef: Ref<SVGSVGElement | null>,
  pushHistory: () => void
) {
  const GRID_SIZE = 20
  const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE

  const viewBox = ref({ x: 0, y: 0, w: 1200, h: 800 })
  const isPanning = ref(false)
  const panStart = ref({ x: 0, y: 0 })
  
  const isCreating = ref(false)
  const selectedNodeId = ref<string | null>(null)
  const connectingFrom = ref<string | null>(null)
  const ghostLine = ref({ x1: 0, y1: 0, x2: 0, y2: 0 })
  const draggingNode = ref<string | null>(null)
  const dragStart = ref({ x: 0, y: 0 })
  const nodeStartPos = ref({ x: 0, y: 0 })
  const hasDragged = ref(false)
  
  const touchStartDist = ref(0)
  const touchStartViewBox = ref({ x: 0, y: 0, w: 0, h: 0 })

  const ghostLinePath = computed(() => {
    if (!connectingFrom.value) return ''
    const fromNode = tree.value.nodes.find(n => n.id === connectingFrom.value)
    if (!fromNode) return ''
    const x1 = fromNode.x, y1 = fromNode.y
    const x2 = ghostLine.value.x2, y2 = ghostLine.value.y2
    const midX = (x1 + x2) / 2
    return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`
  })

  function getSVGPointFromClient(clientX: number, clientY: number) {
    if (!svgRef.value) return { x: 0, y: 0 }
    const pt = svgRef.value.createSVGPoint()
    pt.x = clientX; pt.y = clientY
    const svgP = pt.matrixTransform(svgRef.value.getScreenCTM()?.inverse())
    return { x: svgP.x, y: svgP.y }
  }

  function getEdgePath(fromId: string, toId: string): string {
    const fromNode = tree.value.nodes.find(n => n.id === fromId)
    const toNode = tree.value.nodes.find(n => n.id === toId)
    if (!fromNode || !toNode) return ''
    const x1 = fromNode.x, y1 = fromNode.y
    const x2 = toNode.x, y2 = toNode.y
    const midX = (x1 + x2) / 2
    return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`
  }

  function autoLayout() {
    if (tree.value.nodes.length === 0) return
    pushHistory()
    const nodes = tree.value.nodes
    const edges = tree.value.edges
    const incomingMap = new Map<string, string[]>()
    nodes.forEach(n => incomingMap.set(n.id, []))
    edges.forEach(e => incomingMap.get(e.to)?.push(e.from))
    const levelMap = new Map<string, number>()
    const visited = new Set<string>()
    function computeLevel(nodeId: string): number {
      if (levelMap.has(nodeId)) return levelMap.get(nodeId)!
      if (visited.has(nodeId)) return 0
      visited.add(nodeId)
      const parents = incomingMap.get(nodeId) || []
      if (parents.length === 0) { levelMap.set(nodeId, 0); return 0 }
      let maxParentLevel = 0
      for (const parentId of parents) maxParentLevel = Math.max(maxParentLevel, computeLevel(parentId))
      const level = maxParentLevel + 1
      levelMap.set(nodeId, level)
      return level
    }
    nodes.forEach(n => computeLevel(n.id))
    const layers = new Map<number, SkillNode[]>()
    nodes.forEach(n => {
      const level = levelMap.get(n.id) || 0
      if (!layers.has(level)) layers.set(level, [])
      layers.get(level)!.push(n)
    })
    const horizontalSpacing = 220, verticalSpacing = 130, startY = 80
    layers.forEach((layerNodes, level) => {
      const layerWidth = (layerNodes.length - 1) * horizontalSpacing
      const startX = 600 - layerWidth / 2
      layerNodes.forEach((node, index) => {
        node.x = snap(startX + index * horizontalSpacing)
        node.y = snap(startY + level * verticalSpacing)
      })
    })
    const allYs = nodes.map(n => n.y)
    const minY = Math.min(...allYs)
    const offsetX = 600 - (Math.min(...nodes.map(n => n.x)) + Math.max(...nodes.map(n => n.x))) / 2
    const offsetY = 100 - minY
    nodes.forEach(n => { n.x = snap(n.x + offsetX); n.y = snap(n.y + offsetY) })
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y)
    viewBox.value = { x: Math.min(...xs) - 200, y: Math.min(...ys) - 100, w: Math.max(...xs) - Math.min(...xs) + 400, h: Math.max(...ys) - Math.min(...ys) + 200 }
  }

  function processMove(clientX: number, clientY: number) {
    if (isPanning.value) {
      const dx = (clientX - panStart.value.x) * (viewBox.value.w / window.innerWidth)
      const dy = (clientY - panStart.value.y) * (viewBox.value.h / window.innerHeight)
      viewBox.value.x -= dx; viewBox.value.y -= dy
      panStart.value = { x: clientX, y: clientY }; return
    }
    if (draggingNode.value) {
      const { x, y } = getSVGPointFromClient(clientX, clientY)
      const dx = x - dragStart.value.x, dy = y - dragStart.value.y
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasDragged.value = true
      const node = tree.value.nodes.find(n => n.id === draggingNode.value)
      if (node) { node.x = snap(nodeStartPos.value.x + dx); node.y = snap(nodeStartPos.value.y + dy) }
      return
    }
    if (connectingFrom.value) {
      const { x, y } = getSVGPointFromClient(clientX, clientY)
      ghostLine.value.x2 = x; ghostLine.value.y2 = y
    }
  }

  function processEnd(clientX: number, clientY: number) {
    if (isPanning.value) { isPanning.value = false; return }
    if (draggingNode.value) {
      if (hasDragged.value) pushHistory()
      draggingNode.value = null; hasDragged.value = false; return
    }
    if (connectingFrom.value) {
      const target = document.elementFromPoint(clientX, clientY) as Element
      const nodeGroup = target?.closest('.node-group')
      const targetNodeId = nodeGroup?.getAttribute('data-node-id')
      if (targetNodeId && targetNodeId !== connectingFrom.value) {
        const exists = tree.value.edges.some(e => e.from === connectingFrom.value && e.to === targetNodeId)
        if (!exists) {
          pushHistory()
          tree.value.edges.push({ id: crypto.randomUUID(), from: connectingFrom.value, to: targetNodeId })
        }
      }
      connectingFrom.value = null
    }
  }

  function handleCanvasMouseDown(e: MouseEvent) {
    const target = e.target as Element
    const isBg = target.tagName === 'svg' || (target.tagName === 'rect' && target.id === 'bg-editor')
    if (isBg) {
      if (isCreating.value) {
        const { x, y } = getSVGPointFromClient(e.clientX, e.clientY)
        pushHistory()
        tree.value.nodes.push({ id: crypto.randomUUID(), title: 'Новый этап', x: snap(x), y: snap(y) })
        isCreating.value = false
      } else {
        isPanning.value = true; panStart.value = { x: e.clientX, y: e.clientY }
        selectedNodeId.value = null
      }
    }
  }

  function handleNodeMouseDown(e: MouseEvent, node: SkillNode) {
    e.stopPropagation(); e.preventDefault()
    draggingNode.value = node.id; hasDragged.value = false
    const { x, y } = getSVGPointFromClient(e.clientX, e.clientY)
    dragStart.value = { x, y }; nodeStartPos.value = { x: node.x, y: node.y }
    selectedNodeId.value = node.id
  }

  function handleHandleMouseDown(e: MouseEvent, node: SkillNode) {
    e.stopPropagation(); e.preventDefault()
    connectingFrom.value = node.id
    const { x, y } = getSVGPointFromClient(e.clientX, e.clientY)
    ghostLine.value = { x1: node.x, y1: node.y, x2: x, y2: y }
  }

  function handleMouseMove(e: MouseEvent) { processMove(e.clientX, e.clientY) }
  function handleMouseUp(e: MouseEvent) { processEnd(e.clientX, e.clientY) }

  function handleWheel(e: WheelEvent) {
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    const newW = viewBox.value.w * zoomFactor, newH = viewBox.value.h * zoomFactor
    const rect = svgRef.value?.getBoundingClientRect()
    if (!rect) return
    const mx = (e.clientX - rect.left) / rect.width, my = (e.clientY - rect.top) / rect.height
    viewBox.value.x += (viewBox.value.w - newW) * mx; viewBox.value.y += (viewBox.value.h - newH) * my
    viewBox.value.w = newW; viewBox.value.h = newH
  }

  function getTouchDistance(touches: TouchList) {
    return Math.sqrt((touches[0].clientX - touches[1].clientX) ** 2 + (touches[0].clientY - touches[1].clientY) ** 2)
  }

  function handleCanvasTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      const target = e.target as Element
      const isBg = target.tagName === 'svg' || (target.tagName === 'rect' && target.id === 'bg-editor')
      if (isBg) {
        if (isCreating.value) {
          const { x, y } = getSVGPointFromClient(e.touches[0].clientX, e.touches[0].clientY)
          pushHistory()
          tree.value.nodes.push({ id: crypto.randomUUID(), title: 'Новый этап', x: snap(x), y: snap(y) })
          isCreating.value = false
        } else {
          isPanning.value = true; panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
          selectedNodeId.value = null
        }
      }
    } else if (e.touches.length === 2) {
      isPanning.value = false; touchStartDist.value = getTouchDistance(e.touches);
      touchStartViewBox.value = { ...viewBox.value }
    }
  }

  function handleNodeTouchStart(e: TouchEvent, node: SkillNode) {
    e.stopPropagation()
    draggingNode.value = node.id; hasDragged.value = false
    const touch = e.touches[0]
    const { x, y } = getSVGPointFromClient(touch.clientX, touch.clientY)
    dragStart.value = { x, y }; nodeStartPos.value = { x: node.x, y: node.y }
    selectedNodeId.value = node.id
  }

  function handleCanvasTouchMove(e: TouchEvent) {
    if (e.touches.length === 1) processMove(e.touches[0].clientX, e.touches[0].clientY)
    else if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches), scale = touchStartDist.value / dist
      const newW = touchStartViewBox.value.w * scale, newH = touchStartViewBox.value.h * scale
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2, cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const rect = svgRef.value?.getBoundingClientRect()
      if (!rect) return
      const mx = (cx - rect.left) / rect.width, my = (cy - rect.top) / rect.height
      viewBox.value.x = touchStartViewBox.value.x + (touchStartViewBox.value.w - newW) * mx
      viewBox.value.y = touchStartViewBox.value.y + (touchStartViewBox.value.h - newH) * my
      viewBox.value.w = newW; viewBox.value.h = newH
    }
  }

  function handleCanvasTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      const touch = e.changedTouches[0]
      processEnd(touch?.clientX ?? 0, touch?.clientY ?? 0)
    }
  }

  return {
    viewBox, isCreating, selectedNodeId, connectingFrom, ghostLine, draggingNode, isPanning,
    ghostLinePath, getEdgePath, autoLayout,
    handleCanvasMouseDown, handleNodeMouseDown, handleHandleMouseDown,
    handleMouseMove, handleMouseUp, handleWheel,
    handleCanvasTouchStart, handleNodeTouchStart, handleCanvasTouchMove, handleCanvasTouchEnd
  }
}