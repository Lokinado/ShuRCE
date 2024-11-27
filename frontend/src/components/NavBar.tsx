import { Container, Group, Stack, Text } from '@mantine/core'
import { RootState } from '../state/store';
import { useSelector } from 'react-redux';

const NavBar = () => {

  // This is a placeholder - later you'll want to get this from your Redux store
  const user = useSelector((state: RootState) => state.authReducer.user);

  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" h="100%">
        <Text size="lg" fw={700}>
          ShuRCE
        </Text>

        <Stack justify="center" gap={0}>
          <Text size="sm">
            Welcome <b>{user?.email}!</b>
          </Text>
          <Text size="sm">
            Role: <b>{user?.role?.name}</b>
          </Text>
        </Stack>
      </Group>
    </Container>
  )
}

export default NavBar
