import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import TrocarSenha from './pages/TrocarSenha'

const qc = new QueryClient()

// Lazy pages
import { lazy, Suspense } from 'react'
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const Importacao     = lazy(() => import('./pages/Importacao'))
const Colaboradores  = lazy(() => import('./pages/Colaboradores'))
const Auditoria      = lazy(() => import('./pages/Auditoria'))
const Lancamentos    = lazy(() => import('./pages/Lancamentos'))
const Consolidacao   = lazy(() => import('./pages/Consolidacao'))
const Exportacao     = lazy(() => import('./pages/Exportacao'))
const Usuarios       = lazy(() => import('./pages/Usuarios'))
const Configuracoes  = lazy(() => import('./pages/Configuracoes'))

function Loading() { return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div> }

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/trocar-senha" element={<TrocarSenha />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"     element={<Suspense fallback={<Loading/>}><Dashboard /></Suspense>} />
            <Route path="/importacao"    element={<Suspense fallback={<Loading/>}><Importacao /></Suspense>} />
            <Route path="/colaboradores" element={<Suspense fallback={<Loading/>}><Colaboradores /></Suspense>} />
            <Route path="/auditoria"     element={<Suspense fallback={<Loading/>}><Auditoria /></Suspense>} />
            <Route path="/lancamentos"   element={<Suspense fallback={<Loading/>}><Lancamentos /></Suspense>} />
            <Route path="/consolidacao"  element={<Suspense fallback={<Loading/>}><Consolidacao /></Suspense>} />
            <Route path="/exportacao"    element={<Suspense fallback={<Loading/>}><Exportacao /></Suspense>} />
            <Route path="/usuarios"      element={<Suspense fallback={<Loading/>}><Usuarios /></Suspense>} />
            <Route path="/configuracoes" element={<Suspense fallback={<Loading/>}><Configuracoes /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
