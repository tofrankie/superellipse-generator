import { CopyIcon, DownloadIcon } from '@primer/octicons-react'
import { Box, Button, Heading, Stack, Text, TextInput, useTheme } from '@primer/react'
import { useCallback, useMemo, useState } from 'react'
import { DimensionInput, SliderWithInput, StyleControl } from '@/components'
import { generateSuperellipseSVG, getBounds, superellipsePoints } from '@/utils/superellipse'

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
  const { colorScheme } = useTheme()
  const [params, setParams] = useState<SuperellipseParams>(defaultParams)
  const [background, setBackground] = useState<BackgroundSettings>(defaultBackground)
  const [style, setStyle] = useState<StyleSettings>(defaultStyle)
  const [svgString, setSvgString] = useState<string>('')
  const [showCode, setShowCode] = useState(false)

  // 颜色选择器状态
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false)
  const [showFillColorPicker, setShowFillColorPicker] = useState(false)
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false)

  // 根据颜色模式决定棋盘格颜色
  // 浅色模式: 传统的白/灰 (#e1e4e8)
  // 深色模式: 深灰/更深灰 (#30363d) 以减少视觉突兀感
  const checkerColor = colorScheme === 'dark' ? '#30363d' : '#e1e4e8'

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
    <Box
      sx={{
        maxWidth: '1200px',
        mx: 'auto',
        px: 4,
        py: 4,
        display: 'flex',
        flexDirection: ['column', 'column', 'row'], // Mobile: Stack, Desktop: Row
        gap: 4,
        alignItems: 'start',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: background.type === 'transparent' ? 'transparent' : background.color,
        backgroundImage:
          background.type === 'transparent'
            ? `linear-gradient(45deg, ${checkerColor} 25%, transparent 25%, transparent 75%, ${checkerColor} 75%), linear-gradient(45deg, ${checkerColor} 25%, transparent 25%, transparent 75%, ${checkerColor} 75%)`
            : 'none',
        backgroundPosition: '0 0, 8px 8px',
        backgroundSize: '16px 16px',
        transition: 'background 0.2s ease',
        boxShadow: 'shadow.small',
      }}
    >
      {/* 左侧：预览与输出 (Main Content) */}
      <Stack
        gap="spacious"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: '100%',
          p: 4, // Add padding for internal content
        }}
      >
        <Box
          sx={{
            height: 'fit-content',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              flex: 1,
              mb: 3,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              position: 'relative',
              // Background and border styles moved to outer container
            }}
          >
            {points.length > 0 && (
              <Box
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%', // 限制在容器内
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width={params.svgWidth}
                  height={params.svgHeight}
                  viewBox={`${bounds.minX.toFixed(2)} ${bounds.minY.toFixed(2)} ${(
                    bounds.maxX - bounds.minX
                  ).toFixed(2)} ${(bounds.maxY - bounds.minY).toFixed(2)}`}
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '100%',
                    display: 'block',
                  }}
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

          {/* SVG代码显示 */}
          {showCode && svgString && (
            <Box sx={{ mt: 3 }}>
              <Text sx={{ fontSize: 1, fontWeight: 'bold', mb: 2, display: 'block' }}>
                SVG 代码:
              </Text>
              <TextInput
                value={svgString}
                readOnly
                sx={{
                  width: '100%',
                  fontFamily: 'mono',
                  bg: 'canvas.subtle',
                }}
              />
            </Box>
          )}
        </Box>
      </Stack>

      <Box
        sx={{
          width: ['100%', '100%', '350px'],
          flexShrink: 0,
          position: ['static', 'static', 'sticky'],
          top: '84px',
          maxHeight: ['none', 'none', 'calc(100vh - 104px)'],
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* 操作按钮区 */}
        <Box
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 2,
            bg: 'canvas.default',
            boxShadow: 'shadow.medium',
          }}
        >
          <Stack direction="horizontal" gap="condensed">
            <Button onClick={generateSVG} variant="primary" sx={{ flex: 2 }}>
              生成 SVG
            </Button>
            <Button onClick={downloadSVG} disabled={!svgString} sx={{ flex: 1, px: 2 }}>
              <DownloadIcon />
            </Button>
            <Button onClick={copySVG} disabled={!svgString} sx={{ flex: 1, px: 2 }}>
              <CopyIcon />
            </Button>
          </Stack>
        </Box>

        {/* 参数设置 */}
        <Box>
          <Box
            sx={{
              p: 4,
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 2,
              bg: 'canvas.default',
              boxShadow: 'shadow.medium',
            }}
          >
            <Heading as="h2" sx={{ mb: 3, fontSize: 3 }}>
              参数设置
            </Heading>
            <Stack gap="spacious">
              <Box>
                <Heading as="h2" sx={{ fontSize: 1, mb: 2, color: 'fg.muted' }}>
                  尺寸 (Dimensions)
                </Heading>
                <Stack gap="normal">
                  <Stack gap="normal">
                    <DimensionInput
                      label="画布"
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
                  </Stack>
                </Stack>
              </Box>

              <Box>
                <Heading as="h2" sx={{ fontSize: 1, mb: 2, color: 'fg.muted' }}>
                  形状 (Shape)
                </Heading>
                <Stack gap="normal">
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
                </Stack>
              </Box>

              <Box>
                <Heading as="h2" sx={{ fontSize: 1, mb: 2, color: 'fg.muted' }}>
                  外观 (Style)
                </Heading>
                <Stack gap="normal">
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
            </Stack>
          </Box>
        </Box>

        {/* 数学原理说明卡片 */}
        <Box
          sx={{
            p: 4,
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 2,
            bg: 'canvas.subtle', // 保持这一块稍微淡一点，或者也可以改成 canvas.default
          }}
        >
          <Heading as="h2" sx={{ fontSize: 2, mb: 2 }}>
            数学原理说明
          </Heading>
          <Stack gap="condensed">
            <Text sx={{ fontSize: 1 }}>
              超椭圆（Lamé curve）的隐式方程为:
              {' '}
              <code style={{ fontFamily: 'monospace' }}>|x/a|^n + |y/b|^n = 1</code>
            </Text>
            <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
              其中 a, b &gt; 0 为半轴长度，n &gt; 0 控制形状：
            </Text>
            <Box as="ul" sx={{ fontSize: 1, pl: 3, m: 0, color: 'fg.muted' }}>
              <li>n = 2: 普通椭圆</li>
              <li>n &gt; 2: 趋向于圆角矩形 (Squircle)</li>
              <li>0 &lt; n &lt; 2: 趋向于星形 (Astroid)</li>
              <li>n = 1: 菱形</li>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
