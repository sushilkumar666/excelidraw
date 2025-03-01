import Home from './pages/Home'
import Auth from './pages/Auth'
import './App.css'
import { Outlet } from 'react-router-dom'
const App = () => {
  return (
    <>

      <Outlet />
    </>
  )
}

export default App;