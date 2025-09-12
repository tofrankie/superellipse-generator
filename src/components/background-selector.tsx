import { Box, Button, FormControl, TextInput } from '@primer/react'
import { useCallback, useState } from 'react'

export type BackgroundType = 'transparent' | 'color'

interface BackgroundSelectorProps {
  backgroundType: BackgroundType
  backgroundColor: string
  onChange: (type: BackgroundType, color: string) => void
}

export default function BackgroundSelector({
  backgroundType,
  backgroundColor,
  onChange,
}: BackgroundSelectorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleTypeChange = useCallback(
    (type: BackgroundType) => {
      onChange(type, backgroundColor)
    },
    [backgroundColor, onChange],
  )

  const handleColorChange = useCallback(
    (color: string) => {
      onChange('color', color)
    },
    [onChange],
  )

  return (
    <FormControl>
      <FormControl.Label>背景</FormControl.Label>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant={backgroundType === 'transparent' ? 'primary' : 'invisible'}
          size="small"
          onClick={() => handleTypeChange('transparent')}
        >
          透明
        </Button>

        <Button
          variant={backgroundType === 'color' ? 'primary' : 'invisible'}
          size="small"
          onClick={() => handleTypeChange('color')}
        >
          颜色
        </Button>

        {backgroundType === 'color' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ position: 'relative' }}>
              <Button
                variant="invisible"
                size="small"
                onClick={() => setShowColorPicker(!showColorPicker)}
                sx={{
                  'width': '32px',
                  'height': '32px',
                  'p': 0,
                  'minWidth': '32px',
                  'background': backgroundColor,
                  'border': '1px solid',
                  'borderColor': 'border.default',
                  '&:hover': {
                    background: backgroundColor,
                  },
                }}
                title="选择颜色"
              />
              {showColorPicker && (
                <Box
                  as="input"
                  type="color"
                  value={backgroundColor}
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
            <TextInput
              value={backgroundColor}
              onChange={e => handleColorChange(e.target.value)}
              sx={{
                width: '80px',
                fontSize: 1,
              }}
            />
          </Box>
        )}
      </Box>
    </FormControl>
  )
}
