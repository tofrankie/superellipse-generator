import { Box, FormControl, TextInput } from '@primer/react'
import { useCallback } from 'react'

interface SliderWithInputProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  unit?: string
  precision?: number
}

export default function SliderWithInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  precision = 0,
}: SliderWithInputProps) {
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value))
    },
    [onChange],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      if (!Number.isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue)
      }
    },
    [onChange, min, max],
  )

  const formatValue = (val: number) => {
    if (precision === 0) {
      return val.toString()
    }
    return val.toFixed(precision)
  }

  return (
    <FormControl>
      <FormControl.Label>
        {label}
        :
        {formatValue(value)}
        {unit}
      </FormControl.Label>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Box
            as="input"
            type="range"
            value={value}
            onChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            sx={{
              'width': '100%',
              'height': '6px',
              'borderRadius': '3px',
              'background': 'neutral.muted',
              'outline': 'none',
              'cursor': 'pointer',
              '&::-webkit-slider-thumb': {
                appearance: 'none',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'accent.fg',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: 'canvas.default',
              },
              '&::-moz-range-thumb': {
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'accent.fg',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: 'canvas.default',
              },
            }}
          />
        </Box>
        <TextInput
          value={formatValue(value)}
          onChange={handleInputChange}
          sx={{
            width: '80px',
            fontSize: 1,
          }}
        />
      </Box>
    </FormControl>
  )
}
