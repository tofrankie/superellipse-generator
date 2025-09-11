import { CopyIcon, DownloadIcon } from '@primer/octicons-react'
import { Box, Button, FormControl, Heading, Stack, Text, TextInput } from '@primer/react'
import { useCallback, useMemo, useState } from 'react'
import {
  calculateArea,
  generateSuperellipseSVG,
  getBounds,
  superellipsePoints,
} from '../utils/superellipse'

interface SuperellipseParams {
  a: number
  b: number
  n: number
  segments: number
  svgWidth: number
  svgHeight: number
  padding: number
}

const defaultParams: SuperellipseParams = {
  a: 100,
  b: 100,
  n: 3,
  segments: 256,
  svgWidth: 300,
  svgHeight: 300,
  padding: 0,
}

export default function Generator() {
  const [params, setParams] = useState<SuperellipseParams>(defaultParams)
  const [svgString, setSvgString] = useState<string>('')
  const [showCode, setShowCode] = useState(false)

  const points = useMemo(() => {
    try {
      return superellipsePoints(params.a, params.b, params.n, params.segments)
    }
    catch (error) {
      console.error('生成超椭圆点集时出错:', error)
      return []
    }
  }, [params.a, params.b, params.n, params.segments])

  const { area, bounds } = useMemo(() => {
    try {
      const area = calculateArea(params.a, params.b, params.n)
      const bounds = getBounds(params.a, params.b, params.n)
      return { area, bounds }
    }
    catch {
      return { area: 0, bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } }
    }
  }, [params.a, params.b, params.n])

  const svgPath = useMemo(() => {
    if (points.length === 0)
      return ''

    const precision = 3
    const fmt = (v: number) => Number(v.toFixed(precision))

    let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`
    for (let i = 1; i < points.length; i++) {
      d += ` L ${fmt(points[i].x)} ${fmt(points[i].y)}`
    }
    d += ' Z'
    return d
  }, [points])

  const updateParam = useCallback((key: keyof SuperellipseParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  const generateSVG = useCallback(() => {
    try {
      const svg = generateSuperellipseSVG({
        a: params.a,
        b: params.b,
        n: params.n,
        segments: params.segments,
        stroke: '#0969da',
        strokeWidth: 2,
        fill: '#f6f8fa',
        widthPx: params.svgWidth,
        heightPx: params.svgHeight,
        padding: params.padding,
      })
      setSvgString(svg)
      setShowCode(true)
    }
    catch (error) {
      console.error('生成SVG时出错:', error)
    }
  }, [params])

  const downloadSVG = useCallback(() => {
    if (!svgString)
      return

    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `superellipse_a${params.a}_b${params.b}_n${params.n}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [svgString, params])

  const copySVG = useCallback(async () => {
    if (!svgString)
      return

    try {
      await navigator.clipboard.writeText(svgString)
      // 可以在这里添加更好的用户反馈
      console.warn('已复制到剪贴板')
    }
    catch (error) {
      console.error('复制失败:', error)
    }
  }, [svgString])

  const getShapeDescription = (n: number) => {
    if (n < 0.5)
      return '尖锐星形'
    if (n < 1)
      return '尖锐菱形'
    if (n < 1.5)
      return '圆角菱形'
    if (n < 2)
      return '圆角方形'
    if (n === 2)
      return '椭圆'
    if (n < 3)
      return '圆角矩形'
    if (n < 5)
      return '接近矩形'
    return '矩形'
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="horizontal" gap="spacious" align="start">
        {/* 左侧：参数控制 */}
        <Stack.Item grow>
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 2,
              bg: 'canvas.default',
            }}
          >
            <Heading as="h2" sx={{ mb: 3 }}>
              参数
            </Heading>

            <Stack gap="normal">
              <FormControl>
                <FormControl.Label>
                  半长轴 a:
                  {params.a}
                </FormControl.Label>
                <input
                  type="range"
                  value={params.a}
                  onChange={e => updateParam('a', Number(e.target.value))}
                  min={10}
                  max={200}
                  step={1}
                  style={{ width: '100%' }}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  半短轴 b:
                  {params.b}
                </FormControl.Label>
                <input
                  type="range"
                  value={params.b}
                  onChange={e => updateParam('b', Number(e.target.value))}
                  min={10}
                  max={200}
                  step={1}
                  style={{ width: '100%' }}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  形状参数 n:
                  {params.n.toFixed(2)}
                </FormControl.Label>
                <input
                  type="range"
                  value={params.n}
                  onChange={e => updateParam('n', Number(e.target.value))}
                  min={0.1}
                  max={10}
                  step={0.1}
                  style={{ width: '100%' }}
                />
                <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                  形状:
                  {' '}
                  {getShapeDescription(params.n)}
                </Text>
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  采样点数:
                  {params.segments}
                </FormControl.Label>
                <input
                  type="range"
                  value={params.segments}
                  onChange={e => updateParam('segments', Number(e.target.value))}
                  min={32}
                  max={1024}
                  step={32}
                  style={{ width: '100%' }}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  SVG 宽度:
                  {params.svgWidth}
                  px
                </FormControl.Label>
                <input
                  type="range"
                  value={params.svgWidth}
                  onChange={e => updateParam('svgWidth', Number(e.target.value))}
                  min={100}
                  max={800}
                  step={10}
                  style={{ width: '100%' }}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  SVG 高度:
                  {params.svgHeight}
                  px
                </FormControl.Label>
                <input
                  type="range"
                  value={params.svgHeight}
                  onChange={e => updateParam('svgHeight', Number(e.target.value))}
                  min={100}
                  max={800}
                  step={10}
                  style={{ width: '100%' }}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>
                  边距:
                  {params.padding}
                  px
                </FormControl.Label>
                <input
                  type="range"
                  value={params.padding}
                  onChange={e => updateParam('padding', Number(e.target.value))}
                  min={0}
                  max={50}
                  step={1}
                  style={{ width: '100%' }}
                />
              </FormControl>
            </Stack>

            <Box sx={{ mt: 4, p: 3, bg: 'canvas.subtle', borderRadius: 2 }}>
              <Stack gap="condensed">
                <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>属性信息</Text>
                <Text sx={{ fontSize: 1 }}>
                  面积:
                  {area.toFixed(2)}
                </Text>
                <Text sx={{ fontSize: 1 }}>
                  形状宽度:
                  {(bounds.maxX - bounds.minX).toFixed(2)}
                </Text>
                <Text sx={{ fontSize: 1 }}>
                  形状高度:
                  {(bounds.maxY - bounds.minY).toFixed(2)}
                </Text>
                <Text sx={{ fontSize: 1 }}>
                  SVG大小:
                  {' '}
                  {params.svgWidth}
                  {' '}
                  ×
                  {' '}
                  {params.svgHeight}
                  px
                </Text>
                <Text sx={{ fontSize: 1 }}>
                  边距:
                  {params.padding}
                  px
                </Text>
                <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                  边界: [
                  {bounds.minX.toFixed(2)}
                  ,
                  {' '}
                  {bounds.maxX.toFixed(2)}
                  ] × [
                  {bounds.minY.toFixed(2)}
                  ,
                  {bounds.maxY.toFixed(2)}
                  ]
                </Text>
              </Stack>
            </Box>
          </Box>
        </Stack.Item>

        <Stack.Item grow>
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 2,
              bg: 'canvas.default',
            }}
          >
            <Heading as="h2" sx={{ mb: 3 }}>
              预览
            </Heading>

            <Box
              sx={{
                mb: 3,
                p: 3,
                bg: 'canvas.default',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px',
              }}
            >
              {points.length > 0 && (
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    backgroundImage:
                      'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)',
                    backgroundPosition: '0 0, 5px 5px',
                    backgroundSize: '10px 10px',
                  }}
                >
                  <svg
                    width={params.svgWidth}
                    height={params.svgHeight}
                    viewBox={`${(bounds.minX - params.padding - 1).toFixed(2)} ${(
                      bounds.minY
                      - params.padding
                      - 1
                    ).toFixed(2)} ${(bounds.maxX - bounds.minX + params.padding * 2 + 2).toFixed(
                      2,
                    )} ${(bounds.maxY - bounds.minY + params.padding * 2 + 2).toFixed(2)}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      d={svgPath}
                      fill="#f6f8fa"
                      stroke="#0969da"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </Box>
              )}
            </Box>

            <Stack direction="horizontal" gap="normal" wrap="wrap">
              <Button onClick={generateSVG} variant="primary">
                生成 SVG
              </Button>
              <Button onClick={downloadSVG} disabled={!svgString}>
                <DownloadIcon />
                {' '}
                下载
              </Button>
              <Button onClick={copySVG} disabled={!svgString}>
                <CopyIcon />
                {' '}
                复制代码
              </Button>
            </Stack>

            {/* SVG代码显示 */}
            {showCode && svgString && (
              <Box sx={{ mt: 3 }}>
                <Text sx={{ fontSize: 1, fontWeight: 'bold', mb: 2 }}>SVG代码:</Text>
                <TextInput
                  value={svgString}
                  readOnly
                  sx={{
                    fontSize: 1,
                    fontFamily: 'mono',
                    bg: 'canvas.subtle',
                  }}
                />
              </Box>
            )}
          </Box>
        </Stack.Item>
      </Stack>

      {/* 数学说明 */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          bg: 'canvas.default',
        }}
      >
        <Stack gap="normal">
          <Heading as="h2">说明</Heading>
          <Text sx={{ fontSize: 1 }}>超椭圆的隐式方程为: |x/a|^n + |y/b|^n = 1</Text>
          <Text sx={{ fontSize: 1 }}>其中 a, b &gt; 0 为半轴，n &gt; 0 控制形状：</Text>
          <Box as="ul" sx={{ fontSize: 1, pl: 3 }}>
            <li>n = 2: 椭圆</li>
            <li>n &gt; 2: 更接近"带圆角的矩形"</li>
            <li>0 &lt; n &lt; 2: 更尖锐的形状</li>
            <li>n → ∞: 矩形</li>
            <li>n → 0: 星形</li>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
