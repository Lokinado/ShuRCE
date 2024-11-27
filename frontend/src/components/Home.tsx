import { AppShell, Stack } from '@mantine/core'
import NavBar from './NavBar'
import { Route, Routes } from 'react-router-dom'
import ExecutionTemplates from './ExecutionTemplates'
import StyledLink from './StyledLink'
import { IconTemplate, IconUserCog, IconSparkles, IconArchive, IconSettings, IconFileCode } from '@tabler/icons-react'


const Home = () => {
  return (
    <div>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm' }}
        padding="md"
      >
        <AppShell.Navbar>
          <Stack gap="xs">
            <StyledLink Icon={IconFileCode} to="/" text="Single file execution"/>
            <StyledLink Icon={IconTemplate} to="execution-templates" text="Execution Templates"/>
            <StyledLink Icon={IconUserCog} to="users" text="Users"/>
            <StyledLink Icon={IconUserCog} to="roles" text="Roles"/>
            <StyledLink Icon={IconSparkles} to="jobs" text="Jobs"/>
            <StyledLink Icon={IconArchive} to="archive" text="Archive"/>
            <StyledLink Icon={IconSettings} to="settings" text="Settings"/>
          </Stack>
        </AppShell.Navbar>
        <AppShell.Header>
          <NavBar />
        </AppShell.Header>
        <AppShell.Main>
            <Routes>
              <Route path="/" element={<>Hello World!</>}/>
              <Route path="/execution-templates" element={<ExecutionTemplates />}/>
            </Routes>
        </AppShell.Main>
      </AppShell>
    </div>
  )
}

export default Home