import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthWrapper } from './context/auth.context.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme' // Import de ton fichier de configuration centralisé

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthWrapper>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </AuthWrapper>
    </BrowserRouter>
  </React.StrictMode>,
)