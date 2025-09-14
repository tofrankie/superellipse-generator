import { CopyIcon, DownloadIcon } from '@primer/octicons-react'
import { Box, Button, Heading, Stack, Text, TextInput } from '@primer/react'
import { useCallback, useMemo, useState } from 'react'
import { generateSuperellipseSVG, getBounds, superellipsePoints } from '../utils/superellipse'
import DimensionInput from './dimension-input'
import SliderWithInput from './slider-with-input'
import StyleControl from './style-control'

interface SuperellipseParams {
  a: number
  b: number
  n: number
  segments: number
  svgWidth: number
  svgHeight: number
}

interface BackgroundSettings {
  type: 'transparent' | 'color'
  color: string
}

interface StyleSettings {
  fillEnabled: boolean
  fillColor: string
  strokeEnabled: boolean
  strokeColor: string
  strokeWidth: number
}

const defaultParams: SuperellipseParams = {
  a: 100,
  b: 100,
  n: 3,
  segments: 256,
  svgWidth: 300,
  svgHeight: 300,
}

const defaultBackground: BackgroundSettings = {
  type: 'transparent',
  color: '#ffffff', // 默认白色背景
}

const defaultStyle: StyleSettings = {
  fillEnabled: true,
  fillColor: '#f6f8fa', // 默认浅灰色填充
  strokeEnabled: true,
  strokeColor: '#0969da', // 默认蓝色描边
  strokeWidth: 2,
}

export default function Generator() {
  const [params, setParams] = useState<SuperellipseParams>(defaultParams)
  const [background, setBackground] = useState<BackgroundSettings>(defaultBackground)
  const [style, setStyle] = useState<StyleSettings>(defaultStyle)
  const [svgString, setSvgString] = useState<string>('')
  const [showCode, setShowCode] = useState(false)

  // 颜色选择器状态
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false)
  const [showFillColorPicker, setShowFillColorPicker] = useState(false)
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false)

  const points = useMemo(() => {
    try {
      return superellipsePoints(params.a, params.b, params.n, params.segments)
    }
    catch (error) {
      console.error('生成超椭圆点集时出错:', error)
      return []
    }
  }, [params.a, params.b, params.n, params.segments])

  const { bounds } = useMemo(() => {
    try {
      const bounds = getBounds(params.a, params.b, params.n)
      return { bounds }
    }
    catch {
      return { bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } }
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

  const updateDimensions = useCallback((width: number, height: number) => {
    setParams(prev => ({ ...prev, svgWidth: width, svgHeight: height }))
  }, [])

  // 背景相关回调
  const handleBackgroundToggle = useCallback(() => {
    const newType = background.type === 'transparent' ? 'color' : 'transparent'
    setBackground({ ...background, type: newType })
  }, [background])

  const handleBackgroundColorChange = useCallback(
    (color: string) => {
      setBackground({ ...background, color })
    },
    [background],
  )

  // 填充相关回调
  const handleFillToggle = useCallback(() => {
    setStyle({ ...style, fillEnabled: !style.fillEnabled })
  }, [style])

  const handleFillColorChange = useCallback(
    (color: string) => {
      setStyle({ ...style, fillColor: color })
    },
    [style],
  )

  // 描边相关回调
  const handleStrokeToggle = useCallback(() => {
    setStyle({ ...style, strokeEnabled: !style.strokeEnabled })
  }, [style])

  const handleStrokeColorChange = useCallback(
    (color: string) => {
      setStyle({ ...style, strokeColor: color })
    },
    [style],
  )

  const handleStrokeWidthChange = useCallback(
    (width: number) => {
      setStyle({ ...style, strokeWidth: width })
    },
    [style],
  )

  const generateSVG = useCallback(() => {
    try {
      const svg = generateSuperellipseSVG({
        a: params.a,
        b: params.b,
        n: params.n,
        segments: params.segments,
        stroke: style.strokeEnabled ? style.strokeColor : 'none',
        strokeWidth: style.strokeEnabled ? style.strokeWidth : 0,
        fill: style.fillEnabled ? style.fillColor : 'none',
        widthPx: params.svgWidth,
        heightPx: params.svgHeight,
        padding: 0, // 移除边距，使 path 贴近四周
      })
      setSvgString(svg)
      setShowCode(true)
    }
    catch (error) {
      console.error('生成SVG时出错:', error)
    }
  }, [params, style])

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
              <DimensionInput
                label="SVG 尺寸"
                width={params.svgWidth}
                height={params.svgHeight}
                onChange={updateDimensions}
              />

              <DimensionInput
                label="半轴尺寸"
                width={params.a}
                height={params.b}
                onChange={(width, height) => {
                  updateParam('a', width)
                  updateParam('b', height)
                }}
              />

              <SliderWithInput
                label="形状参数 n"
                value={params.n}
                min={0.1}
                max={10}
                step={0.1}
                onChange={value => updateParam('n', value)}
                precision={2}
              />

              <SliderWithInput
                label="采样点数"
                value={params.segments}
                min={32}
                max={1024}
                step={32}
                onChange={value => updateParam('segments', value)}
              />

              <StyleControl
                label="背景"
                enabled={background.type === 'color'}
                onToggle={handleBackgroundToggle}
                color={background.color}
                onColorChange={handleBackgroundColorChange}
                showColorPicker={showBackgroundColorPicker}
                onShowColorPickerChange={setShowBackgroundColorPicker}
              />

              <StyleControl
                label="填充"
                enabled={style.fillEnabled}
                onToggle={handleFillToggle}
                color={style.fillColor}
                onColorChange={handleFillColorChange}
                showColorPicker={showFillColorPicker}
                onShowColorPickerChange={setShowFillColorPicker}
              />

              <StyleControl
                label="描边"
                enabled={style.strokeEnabled}
                onToggle={handleStrokeToggle}
                color={style.strokeColor}
                onColorChange={handleStrokeColorChange}
                showColorPicker={showStrokeColorPicker}
                onShowColorPickerChange={setShowStrokeColorPicker}
                width={style.strokeWidth}
                onWidthChange={handleStrokeWidthChange}
                widthMin={0}
                widthMax={20}
                widthStep={0.5}
                widthUnit="px"
              />
            </Stack>
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
                    backgroundColor:
                      background.type === 'transparent' ? 'transparent' : background.color,
                    backgroundImage:
                      background.type === 'transparent'
                        ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
                        : 'none',
                    backgroundPosition: '0 0, 5px 5px',
                    backgroundSize: '10px 10px',
                    border: background.type === 'transparent' ? '1px solid #d0d7de' : 'none',
                    borderRadius: '6px',
                  }}
                >
                  <svg
                    width={params.svgWidth}
                    height={params.svgHeight}
                    viewBox={`${bounds.minX.toFixed(2)} ${bounds.minY.toFixed(2)} ${(
                      bounds.maxX - bounds.minX
                    ).toFixed(2)} ${(bounds.maxY - bounds.minY).toFixed(2)}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      d={svgPath}
                      fill={style.fillEnabled ? style.fillColor : 'none'}
                      stroke={style.strokeEnabled ? style.strokeColor : 'none'}
                      strokeWidth={style.strokeEnabled ? style.strokeWidth : 0}
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
