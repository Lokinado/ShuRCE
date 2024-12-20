import { useEffect, useState } from 'react'
import { fetchClient } from '../openapi-client';
import { notifications } from '@mantine/notifications';
import { useDispatch, useSelector } from 'react-redux';
import { update } from '../state/execution-templates/TemplatesSlice';
import { RootState } from '../state/store';
import { ComboboxItem, FileInput, Group, Select } from '@mantine/core';
import { Button } from '@mantine/core';

const SingleFileExecution = () => {
  const [isLoading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ComboboxItem | null>(null);
  const [selectedTemplateError, setSelectedTemplateError] = useState('');
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [codeFileError, setCodeFileError] = useState('');
  let templates = useSelector((state: RootState) => state.templatesReducer.templates);

  const dispatch = useDispatch();

  useEffect(()=>{
    fetchClient.GET("/templates/my", {}).then((value) =>{
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

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    try{
      //TODO: Remove magic strings
      const formData = new FormData(event.currentTarget);

      if(!templates){
        console.log("Templates null")
        return
      }

      if(templates.length === 0){
        console.log("Templates empty")
        return
      }

      if(!selectedTemplate){
        setSelectedTemplateError("Template is requirerd.")
        return
      }

      // TODO: This may fail. Redo template selection
      const template_index = parseInt(selectedTemplate?.value.split(":")[0])-1
      formData.append("template_id",templates[template_index].id)
      formData.append("is_zipped","true")
      formData.append("contains_dockerfile","true")
      const resp = await fetch("/jobs/create", {
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
        title: 'Job created successfully!',
        message: `Created new job`,
      })
    } catch (error) {
      const error_object = (error as Error)
      notifications.show({
        title: 'Job creation has failed',
        message: error_object.message,
        color: 'red',
      })
    }
  }

  if(isLoading) {
    return(<>Loading...</>) // TODO: Add loading gif component
  } else {
    if(!templates) templates = []
    const template_select_items = templates?.map((template, index) => (index+1) + ": " + template.name)

    return (
      <div>
          <form 
            action="/jobs/create" 
            encType="multipart/form-data" 
            method="post" 
            onSubmit={handleSubmit}
          >
            <Select
              data={template_select_items}
              value={selectedTemplate ? selectedTemplate.value : null}
              label="Execution template"
              name="template"
              error={selectedTemplateError}
              onChange={(_value, option) => setSelectedTemplate(option)}
              placeholder="Choose execution template"
            />
            <FileInput
              mt='md'
              label="Code file"
              name='code_file'
              error={codeFileError}
              withAsterisk
              clearable
              value={codeFile} 
              onChange={setCodeFile}
              description="Upload code that ShuRCE will execute"
              placeholder="Choose code file"
            />
            <Group justify="flex-end" mt="md">
              <Button type="submit">Create</Button>
            </Group>
          </form>
      </div>
    )
  }
}

export default SingleFileExecution;