import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import { AppShell, MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import Login from './components/Login';
import NavBar from './components/NavBar';
import Home from './components/Home';

const theme = createTheme({
  primaryColor: 'blue',
  // You can customize these values based on your needs
  colors: {
    // Add custom colors if needed
  },
  fontFamily: 'Your preferred font, sans-serif',
  defaultRadius: 'md',
  // Add more theme customizations as needed
});

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
      padding="md"
      >
        <AppShell.Header>
          <NavBar />
        </AppShell.Header>
        <AppShell.Main>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </BrowserRouter>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}

export default App
