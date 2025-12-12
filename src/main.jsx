import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './index.css'

createRoot(document.getElementById('root')).render(
    // StrictMode disabled temporarily for OAuth (causes double API calls)
    // <StrictMode>
    <BrowserRouter>
        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>
    </BrowserRouter>
    // </StrictMode>,
)
