import { Container, Group, Text } from '@mantine/core'

const NavBar = () => {

  // This is a placeholder - later you'll want to get this from your Redux store
  const isLoggedIn = true
  const username = 'Admin'

  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" h="100%">
        <Text size="lg" fw={700}>
          ShuRCE
        </Text>

        {isLoggedIn && 
          <Text size="sm">
            {username}
          </Text>
        }
      </Group>
    </Container>
  )
}

export default NavBar
