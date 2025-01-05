import { Button, Group, Table } from "@mantine/core";
import CreateUserModal from "./modals/CreateUserModal"
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { RootState } from "../state/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchClient } from '../openapi-client';
import { notifications } from '@mantine/notifications';
import { update } from '../state/users/UsersSlice';

const Users = () => {
  const [isLoading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  let users = useSelector((state: RootState) => state.usersReducer.users);
  const dispatch = useDispatch();

  useEffect(()=>{
    fetchClient.POST("/v1/users/all", {}).then((value) =>{
      if(value.error){
        setLoading(false)
        notifications.show({
          title: 'Can not load users',
          message: 'User has insufficient permissions to load all users',
        })
      }
      if(value.data){
        setLoading(false)
        dispatch(update(value.data))
      }
    });
  }, [dispatch])

  if(isLoading) return "Loading..."
  else {
    if(!users) users = []

    const rows = users.map((user) => (
      <Table.Tr key={user.id}>
        <Table.Td>{user.email}</Table.Td>
        <Table.Td>{user.role ? user.role.name : "No role assigned"}</Table.Td>
        <Table.Td>
          <Button variant="filled">Edit</Button>
          <Button variant="filled" color="red">Delete</Button>
        </Table.Td>
      </Table.Tr>
    ));

    return (
      <>
        <Group justify="flex-end" mt="md">
          <Button onClick={open}>+</Button>
        </Group> 
        <CreateUserModal 
          opened={opened}
          onClose={close}
        />
        {users.length === 0 ? <Group justify='center'>There are no users. Add user with button above.</Group> : 
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Operation</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>}
      </>
    )
  }
}

export default Users;