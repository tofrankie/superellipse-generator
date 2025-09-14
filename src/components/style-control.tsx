import { Box, Button, Checkbox, FormControl, Stack, TextInput } from '@primer/react'
import { useCallback } from 'react'

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
    <FormControl>
      <FormControl.Label>{label}</FormControl.Label>
      <Stack direction="horizontal" gap="normal" align="center">
        <Stack.Item>
          <Stack direction="horizontal" gap="condensed" align="center">
            <Checkbox checked={enabled} onChange={onToggle} />
            <Box sx={{ fontSize: 1, color: 'fg.muted' }}>
              {enabled ? `启用${label}` : `禁用${label}`}
            </Box>
          </Stack>
        </Stack.Item>

        {enabled && (
          <>
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
                      '&:hover': {
                        background: color,
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
          </>
        )}
      </Stack>
    </FormControl>
  )
}
