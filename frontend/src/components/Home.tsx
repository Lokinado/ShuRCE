import { AppShell, Stack } from '@mantine/core'
import NavBar from './NavBar'
import { Route, Routes } from 'react-router-dom'
import ExecutionTemplates from './ExecutionTemplates'
import StyledLink from './StyledLink'
import { IconTemplate, IconUserCog, IconSparkles, IconArchive, IconSettings, IconFileCode, IconUsersGroup } from '@tabler/icons-react'
import SingleFileExecution from './SingleFileExecution'
import Jobs from './Jobs'
import Users from './Users'


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
            <StyledLink Icon={IconUsersGroup} to="manage" text="Users"/>
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
              <Route path="/" element={<SingleFileExecution/>}/>
              <Route path="/execution-templates" element={<ExecutionTemplates />}/>
              <Route path="/jobs" element={<Jobs />}/>
              <Route path="/manage" element={<Users />}/>
            </Routes>
        </AppShell.Main>
      </AppShell>
    </div>
  )
}

export default Home