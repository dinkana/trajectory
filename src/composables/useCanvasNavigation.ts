import { ref, type Ref } from 'vue'

export function useCanvasNavigation(svgRef: Ref<SVGSVGElement | null>) {
  const viewBox = ref({ x: 0, y: 0, w: 1000, h: 600 })
  const isPanning = ref(false)
  const panStart = ref({ x: 0, y: 0 })
  const touchStartDist = ref(0)
  const touchStartViewBox = ref({ x: 0, y: 0, w: 0, h: 0 })

  function handleMouseDown(e: MouseEvent, onBgClick?: () => void) {
    const target = e.target as Element
    const isBg = target.tagName === 'svg' || (target.tagName === 'rect' && target.id === 'bg')
    if (isBg) {
      isPanning.value = true
      panStart.value = { x: e.clientX, y: e.clientY }
      onBgClick?.()
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isPanning.value) return
    const dx = (e.clientX - panStart.value.x) * (viewBox.value.w / window.innerWidth)
    const dy = (e.clientY - panStart.value.y) * (viewBox.value.h / window.innerHeight)
    viewBox.value.x -= dx; viewBox.value.y -= dy
    panStart.value = { x: e.clientX, y: e.clientY }
  }

  function handleMouseUp() { isPanning.value = false }

  function handleWheel(e: WheelEvent) {
    e.preventDefault()
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

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      isPanning.value = true; panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      isPanning.value = false; touchStartDist.value = getTouchDistance(e.touches); touchStartViewBox.value = { ...viewBox.value }
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 1 && isPanning.value) {
      const dx = (e.touches[0].clientX - panStart.value.x) * (viewBox.value.w / window.innerWidth)
      const dy = (e.touches[0].clientY - panStart.value.y) * (viewBox.value.h / window.innerHeight)
      viewBox.value.x -= dx; viewBox.value.y -= dy
      panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
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

  function handleTouchEnd(e: TouchEvent) { if (e.touches.length === 0) isPanning.value = false }

  function fitToNodes(nodes: { x: number, y: number }[], padding = 150) {
    if (nodes.length === 0) return
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y)
    viewBox.value = { x: Math.min(...xs) - padding, y: Math.min(...ys) - padding, w: Math.max(...xs) - Math.min(...xs) + padding * 2, h: Math.max(...ys) - Math.min(...ys) + padding * 2 }
  }

  function focusAvailable(nodes: { id: string, x: number, y: number }[], isUnlocked: (id: string) => boolean, isCompleted: (id: string) => boolean) {
    const availableNodes = nodes.filter(n => isUnlocked(n.id) && !isCompleted(n.id))
    if (availableNodes.length === 0) { fitToNodes(nodes); return }
    fitToNodes(availableNodes, 200)
  }

  return { viewBox, isPanning, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, fitToNodes, focusAvailable }
}