import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import Login from './components/Login'
import Home from './components/Home'
import { RootState } from './state/store'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchClient } from './openapi-client'
import { login } from './state/auth/AuthSlice'

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
  const [isLoading, setLoading] = useState(true);
  const isLoggedIn = useSelector((state: RootState) => state.isLoggedIn);
  const dispatch = useDispatch();
  
  useEffect(()=>{
    fetchClient.GET("/users/me/", {}).then((value) =>{
      if(value.error){
        setLoading(false)
      }
      if(value.data){
        console.log(value.data)
        setLoading(false)
        dispatch(login(value.data))
      }
    });
  })

  if(isLoading) {
    return(<>Loading...</>) // TODO: Add loading gif component
  } else {
    return (
      <MantineProvider theme={theme} defaultColorScheme="light">
        {isLoggedIn ? <Home /> : <Login />}
      </MantineProvider>
    )
  }
}

export default App
