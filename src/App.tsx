import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CRMProvider } from './contexts/CRMContext'
import { Toaster } from 'sonner'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import Customers from './components/Customers'
import Sales from './components/Sales'
import FollowUps from './components/FollowUps'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CRMProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="sales" element={<Sales />} />
              <Route path="followups" element={<FollowUps />} />
            </Route>
          </Routes>
        </CRMProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
