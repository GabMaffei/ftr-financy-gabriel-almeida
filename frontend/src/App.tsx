import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Categories } from './pages/Categories'
import { Transactions } from './pages/Transactions'

// Componente para rotas que exigem login (ex: Dashboard)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente para rotas que NÃO exigem login (ex: Login, Cadastro)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/categorias" element={
        <ProtectedRoute>
          <Layout><Categories /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/transacoes" element={
        <ProtectedRoute>
          <Layout><Transactions /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App