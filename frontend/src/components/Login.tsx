import { Alert, Button, Center, Paper, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [detail, setDetail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const body = `grant_type=password&username=${email}&password=${password}`

    const request = new Request("/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body
    });

    const response = await fetch(request)
    const data = await response.json()

    if (!response.ok) {
      // setDetail('Invalid email or password')
      return
    }

    console.log(response)
    console.log(await response.json())
  }

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    // if (detail) {
      // setDetail(null)
    // }
    // console.log(e.target.value)
    // setter(e.target.value)
  }
  console.log("WTF")
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