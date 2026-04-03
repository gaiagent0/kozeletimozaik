export const SIZE = 5
export const CENTER = Math.floor((SIZE * SIZE) / 2)

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function makeBoard(words) {
  const picked = shuffle(words).slice(0, SIZE * SIZE)
  picked[CENTER] = 'FREE'
  return picked
}

export function checkWin(selected) {
  const wins = new Set()
  for (let r = 0; r < SIZE; r++) {
    const row = Array.from({ length: SIZE }, (_, c) => r * SIZE + c)
    if (row.every(i => selected.has(i))) row.forEach(i => wins.add(i))
  }
  for (let c = 0; c < SIZE; c++) {
    const col = Array.from({ length: SIZE }, (_, r) => r * SIZE + c)
    if (col.every(i => selected.has(i))) col.forEach(i => wins.add(i))
  }
  const d1 = Array.from({ length: SIZE }, (_, i) => i * SIZE + i)
  const d2 = Array.from({ length: SIZE }, (_, i) => i * SIZE + (SIZE - 1 - i))
  if (d1.every(i => selected.has(i))) d1.forEach(i => wins.add(i))
  if (d2.every(i => selected.has(i))) d2.forEach(i => wins.add(i))
  return wins
}

export function launchConfetti() {
  const colors = ['#aa0424', '#3f6748', '#ffdad8', '#c0eec6', '#ce2939', '#fbf9f6']
  const existing = document.getElementById('confetti-layer')
  if (existing) existing.remove()
  const layer = document.createElement('div')
  layer.id = 'confetti-layer'
  layer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;'
  document.body.appendChild(layer)
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('div')
    const isCircle = Math.random() > 0.6
    p.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:-14px;
      width:${6 + Math.random() * 7}px;
      height:${isCircle ? 6 + Math.random() * 7 : 4 + Math.random() * 5}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${isCircle ? '50%' : '2px'};
      animation:confetti-fall ${1.5 + Math.random() * 2.5}s ${Math.random() * 1}s linear forwards;
      transform:rotate(${Math.random() * 360}deg);
      opacity:1;
    `
    layer.appendChild(p)
  }
  setTimeout(() => layer.remove(), 5000)
}
