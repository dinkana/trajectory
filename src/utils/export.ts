import type { SkillTree } from '@/types'

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

function getEdgePath(fromX: number, fromY: number, toX: number, toY: number): string {
  const start = getRectEdgePoint(fromX, fromY, toX, toY)
  const end = getRectEdgePoint(toX, toY, fromX, fromY)
  const dx = end.x - start.x
  const cpOffset = Math.min(Math.abs(dx) * 0.4, 60)
  const cp1x = start.x + (dx > 0 ? cpOffset : -cpOffset)
  const cp2x = end.x - (dx > 0 ? cpOffset : -cpOffset)
  return `M${start.x},${start.y} C${cp1x},${start.y} ${cp2x},${end.y} ${end.x},${end.y}`
}

export async function exportPortfolioToPng(tree: SkillTree, completedNodes: string[], isDark: boolean) {
  const completedSet = new Set(completedNodes)
  const filteredNodes = tree.nodes.filter(n => completedSet.has(n.id))
  const filteredEdges = tree.edges.filter(e => completedSet.has(e.from) && completedSet.has(e.to))

  if (filteredNodes.length === 0) return

  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  tempSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg")

  const xs = filteredNodes.map(n => n.x)
  const ys = filteredNodes.map(n => n.y)
  const padding = 150
  const minX = Math.min(...xs) - padding
  const minY = Math.min(...ys) - padding - 80
  const maxX = Math.max(...xs) + padding
  const maxY = Math.max(...ys) + padding
  const width = maxX - minX
  const height = maxY - minY

  tempSvg.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`)
  tempSvg.setAttribute("width", String(width))
  tempSvg.setAttribute("height", String(height))

  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  bgRect.setAttribute("x", String(minX))
  bgRect.setAttribute("y", String(minY))
  bgRect.setAttribute("width", String(width))
  bgRect.setAttribute("height", String(height))
  bgRect.setAttribute("fill", isDark ? "#111827" : "#f9fafb")
  tempSvg.appendChild(bgRect)

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern")
  pattern.setAttribute("id", "grid-portfolio")
  pattern.setAttribute("width", "40")
  pattern.setAttribute("height", "40")
  pattern.setAttribute("patternUnits", "userSpaceOnUse")
  const patternPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
  patternPath.setAttribute("d", "M 40 0 L 0 0 0 40")
  patternPath.setAttribute("fill", "none")
  patternPath.setAttribute("stroke", isDark ? "#374151" : "#d1d5db")
  patternPath.setAttribute("stroke-width", "0.5")
  patternPath.setAttribute("opacity", "0.4")
  pattern.appendChild(patternPath)
  defs.appendChild(pattern)
  tempSvg.appendChild(defs)

  const gridRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  gridRect.setAttribute("x", String(minX))
  gridRect.setAttribute("y", String(minY))
  gridRect.setAttribute("width", String(width))
  gridRect.setAttribute("height", String(height))
  gridRect.setAttribute("fill", "url(#grid-portfolio)")
  tempSvg.appendChild(gridRect)

  const headerText = document.createElementNS("http://www.w3.org/2000/svg", "text")
  headerText.setAttribute("x", String(minX + 40))
  headerText.setAttribute("y", String(minY + 50))
  headerText.setAttribute("fill", isDark ? "#f3f4f6" : "#111827")
  headerText.setAttribute("font-size", "28")
  headerText.setAttribute("font-weight", "bold")
  headerText.setAttribute("font-family", "system-ui, -apple-system, sans-serif")
  headerText.textContent = tree.title
  tempSvg.appendChild(headerText)

  const dateText = document.createElementNS("http://www.w3.org/2000/svg", "text")
  dateText.setAttribute("x", String(minX + 40))
  dateText.setAttribute("y", String(minY + 80))
  dateText.setAttribute("fill", isDark ? "#9ca3af" : "#6b7280")
  dateText.setAttribute("font-size", "16")
  dateText.setAttribute("font-family", "system-ui, -apple-system, sans-serif")
  dateText.textContent = `SkillTree Portfolio • ${new Date().toLocaleDateString()}`
  tempSvg.appendChild(dateText)

  const edgesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  filteredEdges.forEach(edge => {
    const fromNode = filteredNodes.find(n => n.id === edge.from)
    const toNode = filteredNodes.find(n => n.id === edge.to)
    if (!fromNode || !toNode) return

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", getEdgePath(fromNode.x, fromNode.y, toNode.x, toNode.y))
    path.setAttribute("fill", "none")
    path.setAttribute("stroke", "#10b981")
    path.setAttribute("stroke-width", "3")
    path.setAttribute("stroke-linecap", "butt")
    edgesGroup.appendChild(path)
  })
  tempSvg.appendChild(edgesGroup)

  const nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  filteredNodes.forEach(node => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    g.setAttribute("transform", `translate(${node.x},${node.y})`)

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("x", "-80")
    rect.setAttribute("y", "-24")
    rect.setAttribute("width", "160")
    rect.setAttribute("height", "48")
    rect.setAttribute("rx", "24")
    rect.setAttribute("fill", "#10b981")
    rect.setAttribute("stroke", "#059669")
    rect.setAttribute("stroke-width", "2")
    g.appendChild(rect)

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("x", "0")
    text.setAttribute("y", "5")
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("fill", "#ffffff")
    text.setAttribute("font-size", "14")
    text.setAttribute("font-weight", "600")
    text.setAttribute("font-family", "system-ui, -apple-system, sans-serif")
    text.textContent = node.title.length > 18 ? node.title.substring(0, 18) + '...' : node.title
    g.appendChild(text)

    const checkG = document.createElementNS("http://www.w3.org/2000/svg", "g")
    checkG.setAttribute("transform", "translate(60, 0)")
    
    const checkCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    checkCircle.setAttribute("cx", "0")
    checkCircle.setAttribute("cy", "0")
    checkCircle.setAttribute("r", "10")
    checkCircle.setAttribute("fill", "#ffffff")
    checkCircle.setAttribute("opacity", "0.2")
    checkG.appendChild(checkCircle)

    const checkPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
    checkPath.setAttribute("d", "M-4 0 L-1 3 L4-3")
    checkPath.setAttribute("stroke", "#ffffff")
    checkPath.setAttribute("stroke-width", "2")
    checkPath.setAttribute("fill", "none")
    checkPath.setAttribute("stroke-linecap", "round")
    checkPath.setAttribute("stroke-linejoin", "round")
    checkG.appendChild(checkPath)
    g.appendChild(checkG)

    nodesGroup.appendChild(g)
  })
  tempSvg.appendChild(nodesGroup)

  let svgString = new XMLSerializer().serializeToString(tempSvg)
  const canvas = document.createElement('canvas')
  const scale = 2
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.scale(scale, scale)

  const img = new Image()
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    const link = document.createElement('a')
    link.download = `${tree.title.replace(/[^a-z0-9а-яё]/gi, '_')}_portfolio.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
  }
  img.src = url
}