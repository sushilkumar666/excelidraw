import { createRoot } from 'react-dom/client'
import './index.css'
import Signup from './components/Signup.tsx'
import Signin from './components/Signin.tsx'
import Home from './pages/Home.tsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import RoomOption from './pages/RoomOption.tsx'
import RoomCanvas from './pages/RoomCanvas.tsx'

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} >
      <Route path="" element={<Home />} />
      <Route path="signup" element={<Signup />} />
      <Route path='signin' element={<Signin />} />
      <Route path='roomoption' element={<RoomOption />} />
      <Route path='room/:slug' element={<RoomCanvas />} />
    </Route>
  )
)




createRoot(document.getElementById('root')!).render(
  // <Router>
  //   <Routes>
  //     <Route path="/" element={<CanvaRoom />} />
  //     {/* <Route path="/signin" element={<Signin />} />
  //     <Route path="/signup" element={<Signup />} /> */}
  //   </Routes>
  // </Router>
  <RouterProvider router={router} />

)
