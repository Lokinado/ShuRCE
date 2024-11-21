import { Alert, Button, Center, Paper, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { login } from '../state/auth/AuthSlice'
import { useDispatch } from 'react-redux'
import { fetchClient } from '../openapi-client'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [detail, setDetail] = useState<string | null>(null)
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Refactor this mess
    let {
      data,
      error,
    } = await fetchClient.POST("/token", {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        username: email,
        password: password,
        scope: "",
      },
      bodySerializer(body) {
        const payload = {
          username: body["username"],
          password: body["password"]
        }
        return new URLSearchParams(payload).toString();
      },
    });

    if(data === null){
      const response = await fetchClient.GET("/users/me/", {});
      if(response.data){
        dispatch(login(response.data))
        return;
      }
      data = response.data
      error = response.error
    }

    if(error) {
      if(error.detail){
        if("detail" in error){
          setDetail(error.detail.toString())
        } else if(error.detail.length == 1){
          setDetail(error.detail[0].msg)
        } else {
          const errorMessage = ["Found multiple errors:"];

          error.detail.forEach((message)=>{
            errorMessage.push(message.msg, "\n")
          })

          setDetail(errorMessage.join(""))
        }
      } else {
        setDetail("Unknown error")
      }
      return; 
    }
  }

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (detail) {
      setDetail(null)
    }
    setter(e.target.value)
  }
  
  return (
    <Center h="100vh" bg="var(--mantine-color-gray-0)">
      <Paper 
        shadow="md" 
        p="xl" 
        w={400} 
        radius="md"
        bg="var(--mantine-color-white)"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <Text 
              size="xl" 
              fw={600} 
              ta="center" 
              c="var(--mantine-color-dark-9)"
            >
              Welcome Back
            </Text>

            {detail && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Error"
                color="red"
                variant="filled"
                withCloseButton
                onClose={() => setDetail(null)}
              >
                {detail}
              </Alert>
            )}

            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={handleInputChange(setEmail)}
              styles={(theme) => ({
                label: {
                  color: theme.colors.dark[9]
                }
              })}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={handleInputChange(setPassword)}
              styles={(theme) => ({
                label: {
                  color: theme.colors.dark[9]
                }
              })}
            />

            <Button 
              type="submit" 
              fullWidth
              variant="filled"
            >
              Log in
            </Button>

            <Text 
              c="var(--mantine-color-dimmed)" 
              size="sm" 
              ta="center"
            >
              <Text 
                component="span" 
                c="var(--mantine-primary-color)"
                style={{ cursor: 'pointer' }}
                onClick={() => { /* Handle forgot password */ }}
              >
                Forgot password?
              </Text>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}

export default Login