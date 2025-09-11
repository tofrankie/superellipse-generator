// TypeScript - 超椭圆核心数学函数
export interface Point {
  x: number
  y: number
}

/**
 * 生成超椭圆上的点集合
 * @param a 半长轴 (x方向)
 * @param b 半短轴 (y方向)
 * @param n 形状参数 (n=2为椭圆，n>2更接近矩形，0<n<2更尖锐)
 * @param segments 采样点数
 * @returns 点数组
 */
export function superellipsePoints(a: number, b: number, n: number, segments = 256): Point[] {
  if (a <= 0 || b <= 0)
    throw new Error('a 和 b 必须大于 0')
  if (n <= 0)
    throw new Error('n 必须大于 0')
  segments = Math.max(4, Math.floor(segments))

  const pts: Point[] = []
  const exp = 2 / n // 参数方程中使用的指数

  // 在 [0, 2π) 范围内采样 t
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)

    // 避免负数底数的分数次幂问题，使用 sign * |.|^exp
    const x = Math.sign(c) * Math.abs(c) ** exp * a
    const y = Math.sign(s) * Math.abs(s) ** exp * b

    pts.push({ x, y })
  }

  return pts
}

/**
 * 将点数组转换为SVG路径字符串
 * @param points 点数组
 * @param opts 选项
 * @param opts.close 是否闭合路径
 * @param opts.precision 数值精度
 * @returns SVG路径字符串
 */
export function superellipsePath(
  points: Point[],
  opts?: { close?: boolean, precision?: number },
): string {
  if (!points || points.length === 0)
    return ''
  const precision = opts?.precision ?? 3
  const fmt = (v: number) => Number(v.toFixed(precision))

  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${fmt(points[i].x)} ${fmt(points[i].y)}`
  }
  if (opts?.close ?? true)
    d += ' Z'
  return d
}

/**
 * 生成完整的SVG字符串
 * @param params 参数对象
 * @param params.a 半轴长度a
 * @param params.b 半轴长度b
 * @param params.n 形状参数n
 * @param params.segments 分段数
 * @param params.stroke 描边颜色
 * @param params.strokeWidth 描边宽度
 * @param params.fill 填充颜色
 * @param params.widthPx 宽度像素值
 * @param params.heightPx 高度像素值
 * @param params.padding 内边距
 * @param params.precision 数值精度
 * @returns SVG字符串
 */
export function generateSuperellipseSVG(params: {
  a: number
  b: number
  n: number
  segments?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
  widthPx?: number
  heightPx?: number
  padding?: number
  precision?: number
}): string {
  const {
    a,
    b,
    n,
    segments = 512,
    stroke = 'black',
    strokeWidth = 1,
    fill = 'none',
    widthPx,
    heightPx,
    padding = 0.0,
    precision = 3,
  } = params

  const pts = superellipsePoints(a, b, n, segments)

  // 计算viewBox边界
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX)
      minX = p.x
    if (p.x > maxX)
      maxX = p.x
    if (p.y < minY)
      minY = p.y
    if (p.y > maxY)
      maxY = p.y
  }
  // 考虑描边宽度的一半（描边向两边扩散）
  const strokeOffset = strokeWidth / 2

  minX -= padding + strokeOffset
  minY -= padding + strokeOffset
  maxX += padding + strokeOffset
  maxY += padding + strokeOffset

  const vbW = maxX - minX
  const vbH = maxY - minY

  const pathD = superellipsePath(pts, { close: true, precision })

  const viewBox = `${minX} ${minY} ${vbW} ${vbH}`
  const widthAttr = widthPx ? ` width="${widthPx}"` : ''
  const heightAttr = heightPx ? ` height="${heightPx}"` : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"${widthAttr}${heightAttr} viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">
  <path d="${pathD}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" />
</svg>`

  return svg
}

/**
 * 计算超椭圆的面积（近似值）
 * @param a 半长轴
 * @param b 半短轴
 * @param n 形状参数
 * @returns 面积
 */
export function calculateArea(a: number, b: number, n: number): number {
  // 使用数值积分近似计算面积
  const segments = 1000
  const points = superellipsePoints(a, b, n, segments)

  let area = 0
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]
    area += (p1.x * p2.y - p2.x * p1.y) / 2
  }

  return Math.abs(area)
}

/**
 * 获取超椭圆的边界框
 * @param a 半长轴
 * @param b 半短轴
 * @param n 形状参数
 * @returns 边界框 {minX, maxX, minY, maxY}
 */
export function getBounds(a: number, b: number, n: number) {
  const points = superellipsePoints(a, b, n, 256)

  if (points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const p of points) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }

  // 如果所有值仍然是Infinity，返回默认值
  if (
    !Number.isFinite(minX)
    || !Number.isFinite(maxX)
    || !Number.isFinite(minY)
    || !Number.isFinite(maxY)
  ) {
    return { minX: -a, maxX: a, minY: -b, maxY: b }
  }

  return { minX, maxX, minY, maxY }
}
