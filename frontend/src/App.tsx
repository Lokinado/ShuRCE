import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import Login from './components/Login'
import Home from './components/Home'

const theme = createTheme({
  primaryColor: 'blue',

  // You can customize these values based on your needs
  colors: {

    // Add custom colors if needed
  },
  fontFamily: 'Your preferred font, sans-serif',
  defaultRadius: 'md'

  // Add more theme customizations as needed
})

const App = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}

export default App
