import { Button, Group } from "@mantine/core";
import CreateUserModal from "./modals/CreateUserModal"
import { useDisclosure } from "@mantine/hooks";

const Users = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Group justify="flex-end" mt="md">
        <Button onClick={open}>+</Button>
      </Group> 
      <CreateUserModal 
        opened={opened}
        onClose={close}
      />
    </>
  )
}

export default Users;