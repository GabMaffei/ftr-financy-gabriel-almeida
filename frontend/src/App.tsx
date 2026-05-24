import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import { Layout } from './components/Layout'
import { Loader2 } from 'lucide-react'

// 👇 1. Importações usando Lazy Loading (Otimização de Performance)
const Login = lazy(() => import('./pages/Auth/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/Auth/Register').then(m => ({ default: m.Register })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })))
const Transactions = lazy(() => import('./pages/Transactions').then(m => ({ default: m.Transactions })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))

// Componente para rotas que exigem login (Dashboard, etc)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Componente para rotas que NÃO exigem login (Login, Cadastro)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

// 👇 2. Componente de Loading Global (Enquanto a página é descarregada)
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
)

function App() {
  return (
    // 👇 3. Suspense abraça as rotas e mostra o Loader durante o download do JS
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Rotas Protegidas */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/categorias" element={<ProtectedRoute><Layout><Categories /></Layout></ProtectedRoute>} />
        <Route path="/transacoes" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      </Routes>
    </Suspense>
  )
}

export default App