import { Box, Button, Stack, TextInput } from '@primer/react'
import { useCallback } from 'react'
import Switch from '@/components/switch'

interface StyleControlProps {
  label: string
  enabled: boolean
  onToggle: () => void
  color?: string
  onColorChange?: (color: string) => void
  showColorPicker?: boolean
  onShowColorPickerChange?: (show: boolean) => void
  width?: number
  onWidthChange?: (width: number) => void
  widthMin?: number
  widthMax?: number
  widthStep?: number
  widthUnit?: string
}

export default function StyleControl({
  label,
  enabled,
  onToggle,
  color,
  onColorChange,
  showColorPicker,
  onShowColorPickerChange,
  width,
  onWidthChange,
  widthMin = 0,
  widthMax = 20,
  widthStep = 0.5,
  widthUnit = 'px',
}: StyleControlProps) {
  const handleColorChange = useCallback(
    (newColor: string) => {
      onColorChange?.(newColor)
    },
    [onColorChange],
  )

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      onWidthChange?.(newWidth)
    },
    [onWidthChange],
  )

  const toggleColorPicker = useCallback(() => {
    onShowColorPickerChange?.(!showColorPicker)
  }, [showColorPicker, onShowColorPickerChange])

  return (
    <Box>
      <Stack direction="horizontal" gap="condensed" align="center" sx={{ mb: enabled ? 2 : 0 }}>
        <Box sx={{ fontSize: 1, fontWeight: 'bold', flexGrow: 1 }}>{label}</Box>
        <Switch checked={enabled} onChange={onToggle} ariaLabelledBy={`${label}-switch`} />
      </Stack>

      {enabled && (
        <Stack gap="normal" sx={{ pl: 0 }}>
          <Stack direction="horizontal" gap="normal" align="center">
            {color && onColorChange && (
              <Stack direction="horizontal" gap="condensed" align="center">
                <TextInput
                  value={color}
                  onChange={e => handleColorChange(e.target.value)}
                  sx={{
                    width: '100px',
                    fontSize: 1,
                  }}
                />
                <Box sx={{ position: 'relative' }}>
                  <Button
                    variant="invisible"
                    size="small"
                    onClick={toggleColorPicker}
                    sx={{
                      'width': '32px',
                      'height': '32px',
                      'p': 0,
                      'minWidth': '32px',
                      'background': color,
                      'border': '1px solid',
                      'borderRadius': '50%',
                      'borderColor': 'border.default',
                      'boxShadow': 'shadow.small',
                      '&:hover': {
                        background: color,
                        borderColor: 'border.dull',
                      },
                    }}
                  />
                  {showColorPicker && (
                    <Box
                      as="input"
                      type="color"
                      value={color}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleColorChange(e.target.value)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '32px',
                        height: '32px',
                        opacity: 0,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                      }}
                    />
                  )}
                </Box>
              </Stack>
            )}

            {width !== undefined && onWidthChange && (
              <Stack direction="horizontal" gap="condensed" align="center">
                <TextInput
                  type="number"
                  value={width}
                  onChange={e => handleWidthChange(Number(e.target.value))}
                  min={widthMin}
                  max={widthMax}
                  step={widthStep}
                  sx={{
                    width: '60px',
                    fontSize: 1,
                  }}
                />
                <Box sx={{ fontSize: 1, color: 'fg.muted' }}>{widthUnit}</Box>
              </Stack>
            )}
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
