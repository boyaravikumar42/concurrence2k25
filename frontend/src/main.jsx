import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './components/pages/NotificationContext.jsx'
/* import { GoogleOAuthProvider } from '@react-oauth/google' */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
    <NotificationProvider>
      <App />
    </NotificationProvider>
     
   
        
     </BrowserRouter>
  </StrictMode>
)
