import { useState } from 'react'
import { notifications } from '@mantine/notifications';
import { Checkbox, Group, Modal, MultiSelect, TextInput, Tooltip } from '@mantine/core';
import { Button } from '@mantine/core';
import { fetchClient } from '../../openapi-client'
import { RolesMapping } from '../../Types/RolesMapping';


type CreateRoleModalProps = {
  opened: boolean;
  onClose: () => void;
}

const CreateRoleModal: React.FunctionComponent<CreateRoleModalProps> = ({
  opened,
  onClose
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionsError, setPermissionsError] = useState<string>('');

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Refactor this mess

    const perms = permissions.map((permission) => RolesMapping[permission])

    const {
      data,
      error,
    } = await fetchClient.POST("/v1/roles/create", {
      body: {
        name: name,
        permissions: perms
      }
    });

    if(data){
      setName('')
      setNameError('')
      setPermissions([])
      setPermissionsError('')

      notifications.show({
        title: 'Role created successfully!',
        message: `Created new Role with name ${name}`,
      })

      onClose()
    }

    if(error) {
      if(error.detail){
        const newNameError: string[] = [];
        const newPermissionsError: string[] = [];
        error.detail.forEach((message)=>{
          const propertyName = message.loc.pop()
          if(propertyName === "name") {
            newNameError.push(message.msg.split(", ")[1]);
          } else if (propertyName === "permissions"){
            newPermissionsError.push(message.msg.split(", ")[1]);
          }
        })
        setNameError(newNameError.join(" "))
        setPermissionsError(newPermissionsError.join(" "))
      }
      return; 
    }
  }

  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      title="New Role" 
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }} 
      centered
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
      <MultiSelect
        label="Role permissions"
        placeholder="Pick permissions"
        clearable
        searchable
        nothingFoundMessage="No permissions found..."
        data={Object.keys(RolesMapping)}
        error={permissionsError}
        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 }, shadow: 'md' }}
      />
      <Tooltip label="Global execution templates could be accessed by anyone with get global templates permission">
        <Checkbox
          name="is_global"
          label="Is global"
          mt={'md'}
        />
      </Tooltip>
      <Group justify="flex-end" mt="md">
        <Button
          type="submit"
          variant="filled"
          onClick={handleSubmit}
        >
          Create
        </Button>
      </Group>
    </Modal>
  )
}

export default CreateRoleModal;