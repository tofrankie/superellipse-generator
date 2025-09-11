import { CommentIcon, MarkGithubIcon, MoonIcon, SunIcon } from '@primer/octicons-react'
import { Box, Button, IconButton, PageHeader, Stack, useTheme } from '@primer/react'
import { GITHUB_ISSUES_URL, GITHUB_REPO_URL, STORAGE_KEYS } from '@/constants'

export default function AppHeader() {
  const { colorMode, setColorMode } = useTheme()

  const toggleTheme = () => {
    const newColorMode = colorMode === 'day' ? 'night' : 'day'
    setColorMode(newColorMode)
    localStorage.setItem(STORAGE_KEYS.COLOR_MODE, newColorMode)
  }

  const handleFeedbackClick = () => {
    window.open(GITHUB_ISSUES_URL, '_blank')
  }

  const handleGithubClick = () => {
    window.open(GITHUB_REPO_URL, '_blank')
  }

  return (
    <Box
      as="header"
      sx={{
        flexShrink: 0,
        borderBottom: '1px solid',
        borderColor: 'border.default',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'canvas.subtle',
      }}
    >
      <PageHeader
        role="banner"
        aria-label="Superellipse Generator"
        sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', px: 4 }}
      >
        <PageHeader.TitleArea>
          <PageHeader.Title>Superellipse Generator</PageHeader.Title>
        </PageHeader.TitleArea>

        <PageHeader.Actions>
          <Stack direction="horizontal" align="center" gap="condensed">
            <Button variant="primary" leadingVisual={CommentIcon} onClick={handleFeedbackClick}>
              反馈
            </Button>

            <IconButton
              icon={colorMode === 'day' ? MoonIcon : SunIcon}
              aria-label={`切换为${colorMode === 'day' ? '深色' : '浅色'}模式`}
              variant="invisible"
              size="small"
              onClick={toggleTheme}
            />

            <IconButton
              aria-label="GitHub Homepage"
              icon={MarkGithubIcon}
              variant="invisible"
              onClick={handleGithubClick}
            />
          </Stack>
        </PageHeader.Actions>
      </PageHeader>
    </Box>
  )
}
