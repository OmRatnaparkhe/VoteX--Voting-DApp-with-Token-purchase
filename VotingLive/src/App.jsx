import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Web3Provider from './context/Web3Provider.jsx'
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes/routes.jsx'

function App() {
  return (
    <Web3Provider>
      <RouterProvider router={routes}/>
    </Web3Provider>
    
  )
}
export default App
