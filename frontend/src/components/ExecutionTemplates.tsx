import { useEffect, useState } from 'react'
import { fetchClient } from '../openapi-client';
import { notifications } from '@mantine/notifications';
import { useDispatch, useSelector } from 'react-redux';
import { update } from '../state/execution-templates/TemplatesSlice';
import { RootState } from '../state/store';
import { FileInput, Group, Modal, Table, TextInput } from '@mantine/core';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const ExecutionTemplates = () => {
  const [isLoading, setLoading] = useState(true);
  const [dockerfile, setDockerfile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [dockerfileError, setDockerfileError] = useState('');
  const [nameError, setNameError] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  let templates = useSelector((state: RootState) => state.templatesReducer.templates);
  const dispatch = useDispatch();

  useEffect(()=>{
    console.log("Try to fetch templates")
    fetchClient.GET("/templates/all", {}).then((value) =>{
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

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
  }

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    let invalid = false;

    if(!dockerfile) {
      setDockerfileError('No dockerfile chosen')
      invalid = true;
    }

    if(!name){
      setNameError('No name entered')
      invalid = true;
    }

    // TODO: Remove magic numbers
    if(name.length < 4){
      setNameError('Name must be at least 4 characters long')
      invalid = true;
    }

    if(name.length > 15){
      setNameError('Name must be at most 15 characters long')
      invalid = true;
    }

    console.log(dockerfileError, nameError)

    if(invalid) return;

    try{
      //TODO: Remove magic strings
      const formData = new FormData(event.currentTarget);
      const resp = await fetch("/templates/create", {
        method: 'POST',
        body: formData
      });

      if(!resp.ok){
        const error_object = await resp.json()
        console.log(error_object.detail)
        if(error_object.detail){
          if(Array.isArray(error_object.detail)){
            // TODO: Refactor this mess
            throw Error(error_object.detail[0].loc[1] + ": " + error_object.detail[0].msg)
          } else {
            throw Error(error_object.detail)
          }
        } else {
          throw Error("Unknown error")
        }
      }

      notifications.show({
        title: 'Execution template created successfully!',
        message: `Created new execution template with name ${name}`,
      })

      close()
    } catch (error) {
      const error_object = (error as Error)
      notifications.show({
        title: 'Execution template has failed',
        message: error_object.message,
        color: 'red',
      })
    }
  }

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
        <Modal 
          opened={opened} 
          onClose={close}
          title="New Execution Template" 
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }} 
          centered
        >
          <form 
            action="/templates/create" 
            encType="multipart/form-data" 
            method="post" 
            onSubmit={handleSubmit}
          >
            <TextInput
              name='name'
              type='text'
              error={nameError}
              data-autofocus 
              withAsterisk
              value={name}
              onChange={handleInputChange(setName)}
              label="Execution template name" 
              placeholder="enter name"
            />
            <FileInput
              mt='md'
              label="Dockerfile"
              name='dockerfile'
              error={dockerfileError}
              withAsterisk
              clearable
              value={dockerfile} 
              onChange={setDockerfile}
              description="Specify how ShuRCE should prepare execution environment"
              placeholder="Choose Dockerfile"
            />
            <Group justify="flex-end" mt="md">
              <Button type="submit">Create</Button>
            </Group>
          </form>
        </Modal>
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
        </Table>
      </div>
    )
  }
}

export default ExecutionTemplates;