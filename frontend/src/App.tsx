import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';
import Login from './components/Login'
import Home from './components/Home'
import { RootState } from './state/store'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchClient } from './openapi-client'
import { login } from './state/auth/AuthSlice'
import { BrowserRouter } from 'react-router-dom'
import { Notifications } from '@mantine/notifications'

const theme = createTheme({})

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const isLoggedIn = useSelector((state: RootState) => state.authReducer.isLoggedIn);
  const dispatch = useDispatch();
  
  useEffect(()=>{
    fetchClient.GET("/v1/users/me/", {}).then((value) =>{
      if(value.error){
        setLoading(false)
      }
      if(value.data){
        setLoading(false)
        dispatch(login(value.data))
      }
    });
  }, [dispatch])

  if(isLoading) {
    return(<>Loading...</>) // TODO: Add loading gif component
  } else {
    return (
      <BrowserRouter basename="/">
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications />
          {isLoggedIn ? <Home /> : <Login />}
        </MantineProvider>
      </BrowserRouter>
    )
  }
}

export default App
