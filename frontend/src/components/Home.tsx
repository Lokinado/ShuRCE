import { AppShell, Button, Stack } from '@mantine/core'
import NavBar from './NavBar'

const Home = () => {
  return (
    <div>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm' }}
        padding="md"
      >
        <AppShell.Navbar p="md">
          <Stack gap="xs">
            <Button variant="subtle" fullWidth style={{ borderBottom: '1px solid #E9ECEF' }}>
              Role management
            </Button>
            <Button variant="subtle" fullWidth style={{ borderBottom: '1px solid #E9ECEF' }}>
              Single file execution
            </Button>
            <Button variant="subtle" fullWidth style={{ borderBottom: '1px solid #E9ECEF' }}>
              User management
            </Button>
            <Button variant="subtle" fullWidth style={{ borderBottom: '1px solid #E9ECEF' }}>
              Statistics
            </Button>
            <Button variant="subtle" fullWidth style={{ borderBottom: '1px solid #E9ECEF' }}>
              Jobs
            </Button>
          </Stack>
        </AppShell.Navbar>
        <AppShell.Header>
          <NavBar />
        </AppShell.Header>
        <AppShell.Main>

        </AppShell.Main>
      </AppShell>
    </div>
  )
}

export default Home