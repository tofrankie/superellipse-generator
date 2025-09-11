import { BaseStyles, ThemeProvider } from '@primer/react'
import Index from './pages/index'

export default function App() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <Index />
      </BaseStyles>
    </ThemeProvider>
  )
}
