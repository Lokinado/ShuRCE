import { TextInput, PasswordInput, Button, Paper, Stack, Center, Text } from '@mantine/core';
import { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
  };

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

            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
                onClick={() => {/* Handle forgot password */}}
              >
                Forgot password?
              </Text>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}

export default Login;