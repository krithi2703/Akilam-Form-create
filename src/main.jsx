// index.js
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Added import
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter> 
    <div>
      <App />
    </div>
  </BrowserRouter> // Added BrowserRouter
)
