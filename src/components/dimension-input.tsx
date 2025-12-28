import { LockIcon, UnlockIcon } from '@primer/octicons-react'
import { Box, FormControl, IconButton, TextInput } from '@primer/react'
import { useCallback, useMemo, useRef, useState } from 'react'

interface DimensionInputProps {
  label: string
  width: number
  height: number
  onChange: (width: number, height: number) => void
}

export default function DimensionInput({ label, width, height, onChange }: DimensionInputProps) {
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true)
  const [widthInput, setWidthInput] = useState(width.toString())
  const [heightInput, setHeightInput] = useState(height.toString())

  const aspectRatio = useMemo(() => {
    return width / height
  }, [width, height])

  const isWidthEditingRef = useRef(false)
  const isHeightEditingRef = useRef(false)
  const lockedAspectRatioRef = useRef(aspectRatio)
  const displayWidth = useMemo(() => {
    if (isWidthEditingRef.current) {
      return widthInput
    }
    if (widthInput === '') {
      if (aspectRatioLocked && heightInput === '') {
        return ''
      }
      return width.toString()
    }
    return widthInput
  }, [widthInput, width, aspectRatioLocked, heightInput])

  const displayHeight = useMemo(() => {
    if (isHeightEditingRef.current) {
      return heightInput
    }
    if (heightInput === '') {
      if (aspectRatioLocked && widthInput === '') {
        return ''
      }
      return height.toString()
    }
    return heightInput
  }, [heightInput, height, aspectRatioLocked, widthInput])

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      if (aspectRatioLocked) {
        const newHeight = Math.round(newWidth / lockedAspectRatioRef.current)
        onChange(newWidth, newHeight)
        setHeightInput(newHeight.toString())
      }
      else {
        onChange(newWidth, height)
      }
    },
    [aspectRatioLocked, height, onChange],
  )

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      if (aspectRatioLocked) {
        const newWidth = Math.round(newHeight * lockedAspectRatioRef.current)
        onChange(newWidth, newHeight)
        setWidthInput(newWidth.toString())
      }
      else {
        onChange(width, newHeight)
      }
    },
    [aspectRatioLocked, width, onChange],
  )

  const handleInputFocus = useCallback((type: 'width' | 'height') => {
    if (type === 'width') {
      isWidthEditingRef.current = true
    }
    else {
      isHeightEditingRef.current = true
    }
  }, [])

  const handleInputChange = useCallback(
    (type: 'width' | 'height', value: string) => {
      if (type === 'width') {
        setWidthInput(value)
      }
      else {
        setHeightInput(value)
      }

      if (value === '') {
        if (aspectRatioLocked) {
          if (type === 'width') {
            setHeightInput('')
          }
          else {
            setWidthInput('')
          }
          lockedAspectRatioRef.current = 1
        }
        else {
          const defaultValue = 1
          if (type === 'width') {
            handleWidthChange(defaultValue)
          }
          else {
            handleHeightChange(defaultValue)
          }
        }
      }
      else {
        const numValue = Number(value)
        if (!Number.isNaN(numValue) && numValue > 0) {
          if (type === 'width') {
            handleWidthChange(numValue)
          }
          else {
            handleHeightChange(numValue)
          }
        }
      }
    },
    [aspectRatioLocked, handleWidthChange, handleHeightChange],
  )

  const handleInputBlur = useCallback(
    (type: 'width' | 'height', value: string) => {
      if (type === 'width') {
        isWidthEditingRef.current = false
      }
      else {
        isHeightEditingRef.current = false
      }

      if (value === '' || Number.isNaN(Number(value)) || Number(value) <= 0) {
        if (aspectRatioLocked) {
          const isWidthEmpty = widthInput === ''
          const isHeightEmpty = heightInput === ''

          if (isWidthEmpty && isHeightEmpty) {
            const defaultValue = 1
            handleWidthChange(defaultValue)
            handleHeightChange(defaultValue)
          }
          else {
            if (type === 'width') {
              setWidthInput(width.toString())
            }
            else {
              setHeightInput(height.toString())
            }
          }
        }
        else {
          if (type === 'width') {
            setWidthInput(width.toString())
          }
          else {
            setHeightInput(height.toString())
          }
        }
      }
    },
    [
      width,
      height,
      aspectRatioLocked,
      widthInput,
      heightInput,
      handleWidthChange,
      handleHeightChange,
    ],
  )

  return (
    <FormControl>
      <FormControl.Label>{label}</FormControl.Label>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextInput
            value={displayWidth}
            onFocus={() => handleInputFocus('width')}
            onChange={e => handleInputChange('width', e.target.value)}
            onBlur={e => handleInputBlur('width', e.target.value)}
            sx={{
              width: '80px',
              fontSize: 1,
            }}
          />
          <Box as="span" sx={{ fontSize: 1, color: 'fg.muted' }}>
            W
          </Box>
        </Box>

        <IconButton
          icon={aspectRatioLocked ? LockIcon : UnlockIcon}
          aria-label={aspectRatioLocked ? '解锁宽高比例' : '锁定宽高比例'}
          variant="invisible"
          size="small"
          onClick={() => {
            const newLocked = !aspectRatioLocked
            setAspectRatioLocked(newLocked)
            if (newLocked) {
              lockedAspectRatioRef.current = aspectRatio
            }
          }}
          sx={{
            flexShrink: 0,
            color: 'fg.muted',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextInput
            value={displayHeight}
            onFocus={() => handleInputFocus('height')}
            onChange={e => handleInputChange('height', e.target.value)}
            onBlur={e => handleInputBlur('height', e.target.value)}
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
