import { useEffect, useState } from 'react'
import { fetchClient } from '../openapi-client';
import { notifications } from '@mantine/notifications';
import { useDispatch, useSelector } from 'react-redux';
import { update } from '../state/execution-templates/TemplatesSlice';
import { RootState } from '../state/store';
import { Group, Table } from '@mantine/core';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import CreateExecutionTemplateModal from './modals/CreateExecutionTemplateModal';

const ExecutionTemplates = () => {
  const [isLoading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  let templates = useSelector((state: RootState) => state.templatesReducer.templates);
  const dispatch = useDispatch();

  useEffect(()=>{
    fetchClient.GET("/v1/templates/my", {}).then((value) =>{
      if(value.error){
        setLoading(false)
        notifications.show({
          title: 'Can not load execution templates',
          message: 'User has insufficient permissions to load all execution templates',
        })
      }
      if(value.data){
        setLoading(false)
        dispatch(update(value.data))
      }
    });
  }, [dispatch])

  if(isLoading) {
    return(<>Loading...</>) // TODO: Add loading gif component
  } else {
    if(!templates) templates = []

    const rows = templates.map((template) => (
      <Table.Tr key={template.id}>
        <Table.Td>{template.name}</Table.Td>
        <Table.Td><Button variant="subtle">File preview</Button></Table.Td>
        <Table.Td>{new Date(template.date_created).toLocaleString()}</Table.Td>
        <Table.Td><Button variant="filled" color="red">Delete</Button></Table.Td>
      </Table.Tr>
    ));

    return (
      <div>
        <Group justify="flex-end" mt="md">
          <Button onClick={open}>+</Button>
        </Group>    
        <CreateExecutionTemplateModal 
          opened={opened}
          onClose={close}
        />
        {templates.length === 0 ? <Group justify='center'>There are no execution templates available. Add execution template with button above.</Group> : 
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Dockerfile</Table.Th>
              <Table.Th>Date created</Table.Th>
              <Table.Th>Operation</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>}
      </div>
    )
  }
}

export default ExecutionTemplates;