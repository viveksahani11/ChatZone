import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import Navbar from './components/Navbar'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/UseThemeStore'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) return (

    <div className='flex justify-center items-center h-screen'>
      <Loader className="size-10 animate-spin" />
    </div>
  );

  

  return (
        
    <div data-theme={theme} >
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <Homepage /> : <LoginPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <LoginPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Homepage />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Homepage />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App