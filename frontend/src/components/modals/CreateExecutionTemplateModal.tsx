import { useState } from 'react'
import { notifications } from '@mantine/notifications';
import { Checkbox, FileInput, Group, Modal, TextInput, Tooltip } from '@mantine/core';
import { Button } from '@mantine/core';


type CreateExecutionTemplateModalProps = {
  opened: boolean;
  onClose: () => void;
}

const CreateExecutionTemplateModal: React.FunctionComponent<CreateExecutionTemplateModalProps> = ({
  opened,
  onClose
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [dockerfile, setDockerfile] = useState<File | null>(null);
  const [dockerfileError, setDockerfileError] = useState('');

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

    if(invalid) return;

    try{
      //TODO: Remove magic strings
      const formData = new FormData(event.currentTarget);
      const resp = await fetch("/v1/templates/create", {
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

  return (
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
        <Tooltip label="Global execution templates could be accessed by anyone with get global templates permission">
          <Checkbox
            name="is_global"
            label="Is global"
            mt={'md'}
          />
        </Tooltip>
        <Group justify="flex-end" mt="md">
          <Button type="submit">Create</Button>
        </Group>
      </form>
    </Modal>
  )
}

export default CreateExecutionTemplateModal;