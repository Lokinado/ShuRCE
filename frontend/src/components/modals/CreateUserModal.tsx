import { useEffect, useState } from 'react'
import { notifications } from '@mantine/notifications';
import { Checkbox, FileInput, Group, Modal, PasswordInput, Select, TextInput, Tooltip } from '@mantine/core';
import { Button } from '@mantine/core';
import { fetchClient } from '../../openapi-client'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { update } from '../../state/roles/RolesSlice';

type CreateUserModalProps = {
  opened: boolean;
  onClose: () => void;
}

const CreateUserModal: React.FunctionComponent<CreateUserModalProps> = ({
  opened,
  onClose
}) => {
  const [isLoading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [roleName, setRoleName] = useState<string | null>('');
  const roles = useSelector((state: RootState) => state.rolesReducer.roles);
  const dispatch = useDispatch();

  useEffect(()=>{
    fetchClient.POST("/roles/all", {}).then((value) =>{
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

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Refactor this mess

    let roleId: string | null = null;

    if(roleName !== null){
      if(roles){
        const result = roles.find((role) => role.name === roleName);
        if(result){
          roleId = result.id;
        }
      }
    }

    const {
      data,
      error,
    } = await fetchClient.POST("/users/register", {
      body: {
        email: email,
        password: password,
        role_id: roleId
      }
    });

    if(data){
      console.log(data)
      onClose()
    }

    if(error) {
      if(error.detail){
        if("detail" in error){
          console.log("CASE 1")
        } else if(error.detail.length == 1){
          console.log("CASE 2")
        } else {
          console.log("CASE 3")
        }
      } else {
        console.log("CASE 4")
      }
      return; 
    }
  }

  console.log(roles)
  console.log(roles?.map((role) => role.name))

  if(isLoading) return (<></>)
  else return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      title="New Execution Template" 
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }} 
      centered
    >
      <TextInput
        name='email'
        type='text'
        error={emailError}
        data-autofocus 
        withAsterisk
        value={email}
        onChange={handleInputChange(setEmail)}
        label="New users email" 
        placeholder="email@company.com"
      />
      <PasswordInput
        mt='md'
        name='password'
        type='password'
        error={passwordError}
        data-autofocus 
        withAsterisk
        value={password}
        onChange={handleInputChange(setPassword)}
        label="New users password" 
        placeholder="SecurePassword123!"
      />
      <Select
        label="Users role"
        placeholder="Pick role"
        data={roles?.map((role) => role.name)}
        value={roleName}
        onChange={setRoleName}
      />
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

export default CreateUserModal;