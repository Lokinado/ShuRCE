import { Button, Group, Pill, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { RootState } from "../state/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchClient } from '../openapi-client';
import { notifications } from '@mantine/notifications';
import { update } from '../state/roles/RolesSlice';
import CreateRoleModal from "./modals/CreateRoleModal";
import { Permission } from "../backend-types";
import { RolesMapping } from "../Types/RolesMapping";

const Roles = () => {
  const [isLoading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  let roles = useSelector((state: RootState) => state.rolesReducer.roles);
  const dispatch = useDispatch();

  useEffect(()=>{
    fetchClient.POST("/v1/roles/all", {}).then((value) =>{
      if(value.error){
        setLoading(false)
        notifications.show({
          title: 'Can not load roles',
          message: 'User has insufficient permissions to load all roles',
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
    if(!roles) roles = []

    const renderPills = (permissions: Permission[]) => {
        return permissions.map((perm) => <Pill>{Object.keys(RolesMapping).find(key => RolesMapping[key] === perm)}</Pill>)
    }

    const rows = roles.map((role) => (
      <Table.Tr key={role.id}>
        <Table.Td>{role.name}</Table.Td>
        <Table.Td>{renderPills(role.permissions)}</Table.Td>
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
        <CreateRoleModal 
          opened={opened}
          onClose={close}
        />
        {roles.length === 0 ? <Group justify='center'>There are no roles. Add role with button above.</Group> : 
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Permissions</Table.Th>
                <Table.Th>Operation</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>}
      </>
    )
  }
}

export default Roles;