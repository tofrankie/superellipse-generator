import { BaseStyles, ThemeProvider } from '@primer/react'
import { STORAGE_KEYS } from '@/constants'
import Index from '@/pages/index'

export default function App() {
  const initialColorMode = getInitialColorMode()

  return (
    <ThemeProvider colorMode={initialColorMode}>
      <BaseStyles>
        <Index />
      </BaseStyles>
    </ThemeProvider>
  )
}

function getInitialColorMode() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.COLOR_MODE)
  return savedTheme === 'night' ? 'night' : 'day'
}
