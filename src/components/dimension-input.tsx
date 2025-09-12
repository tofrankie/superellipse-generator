import { LockIcon, UnlockIcon } from '@primer/octicons-react'
import { Box, Button, FormControl, TextInput } from '@primer/react'
import { useCallback, useState } from 'react'

interface DimensionInputProps {
  label: string
  width: number
  height: number
  min: number
  max: number
  onChange: (width: number, height: number) => void
}

export default function DimensionInput({
  label,
  width,
  height,
  min,
  max,
  onChange,
}: DimensionInputProps) {
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true)
  const [aspectRatio] = useState(width / height)

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      if (aspectRatioLocked) {
        const newHeight = Math.round(newWidth / aspectRatio)
        onChange(newWidth, newHeight)
      }
      else {
        onChange(newWidth, height)
      }
    },
    [aspectRatioLocked, aspectRatio, height, onChange],
  )

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      if (aspectRatioLocked) {
        const newWidth = Math.round(newHeight * aspectRatio)
        onChange(newWidth, newHeight)
      }
      else {
        onChange(width, newHeight)
      }
    },
    [aspectRatioLocked, aspectRatio, width, onChange],
  )

  const handleInputChange = useCallback(
    (type: 'width' | 'height', value: string) => {
      const numValue = Number(value)
      if (!Number.isNaN(numValue) && numValue >= min && numValue <= max) {
        if (type === 'width') {
          handleWidthChange(numValue)
        }
        else {
          handleHeightChange(numValue)
        }
      }
    },
    [min, max, handleWidthChange, handleHeightChange],
  )

  return (
    <FormControl>
      <FormControl.Label>{label}</FormControl.Label>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextInput
            value={width.toString()}
            onChange={e => handleInputChange('width', e.target.value)}
            sx={{
              width: '80px',
              fontSize: 1,
            }}
          />
          <Box as="span" sx={{ fontSize: 1, color: 'fg.muted' }}>
            W
          </Box>
        </Box>

        <Button
          variant="invisible"
          size="small"
          onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
          sx={{
            width: '24px',
            height: '24px',
            p: 0,
            minWidth: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 1,
          }}
          title={aspectRatioLocked ? '解锁宽高比例' : '锁定宽高比例'}
        >
          {aspectRatioLocked ? <LockIcon size={16} /> : <UnlockIcon size={16} />}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextInput
            value={height.toString()}
            onChange={e => handleInputChange('height', e.target.value)}
            sx={{
              width: '80px',
              fontSize: 1,
            }}
          />
          <Box as="span" sx={{ fontSize: 1, color: 'fg.muted' }}>
            H
          </Box>
        </Box>
      </Box>
    </FormControl>
  )
}
