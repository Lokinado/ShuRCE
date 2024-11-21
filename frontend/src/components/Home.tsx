import { AppShell, Stack } from '@mantine/core'
import NavBar from './NavBar'
import { Route, Routes } from 'react-router-dom'
import ExecutionTemplates from './ExecutionTemplates'
import StyledLink from './StyledLink'
import { IconTemplate } from '@tabler/icons-react'

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
            <StyledLink Icon={IconTemplate} to="execution-templates" text="Execution Templates"/>
            <StyledLink Icon={IconTemplate} to="aaaa" text="Execution Templates"/>
            <StyledLink Icon={IconTemplate} to="bbbb" text="Execution Templates"/>
            <StyledLink Icon={IconTemplate} to="cccc" text="Execution Templates"/>
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