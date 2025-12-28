import { Box } from '@primer/react'

interface SwitchProps {
  checked: boolean
  onChange: () => void
  ariaLabelledBy: string
  disabled?: boolean
}

export default function Switch({ checked, onChange, ariaLabelledBy, disabled }: SwitchProps) {
  return (
    <Box
      as="button"
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
          // Prevent default submission if inside a form, though separate logic usually handles that
          e.preventDefault()
          onChange()
        }
      }}
      sx={{
        'appearance': 'none',
        'border': 'none',
        'background': 'none',
        'p': 0,
        'cursor': disabled ? 'not-allowed' : 'pointer',
        'position': 'relative',
        'width': '40px', // Standard switch size
        'height': '24px',
        'borderRadius': '24px',
        // Primer colors:
        // Checked: success.emphasis (green)
        // Unchecked: neutral.emphasis (gray)
        'bg': checked ? 'success.emphasis' : 'neutral.emphasis',
        'transition': 'background 0.2s ease',
        'display': 'inline-flex',
        'alignItems': 'center',
        'opacity': disabled ? 0.5 : 1,
        '&:hover': {
          // Slightly darker on hover if needed, or keep same. Primer usually darkens slightly.
          bg: checked ? 'success.emphasis' : 'neutral.emphasis',
          opacity: disabled ? 0.5 : 0.9,
        },
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px #0969da', // Focus ring
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '2px', // (24 - 20) / 2
          left: checked ? '18px' : '2px', // 40 - 20 - 2
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          bg: 'white', // Knob is always white usually
          border: '1px solid', // Optional border for contrast in some themes
          borderColor: 'transparent',
          transition: 'left 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy effect
          boxShadow: 'shadow.small',
        }}
      />
    </Box>
  )
}
