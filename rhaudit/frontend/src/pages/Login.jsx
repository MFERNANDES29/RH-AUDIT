import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const EMPRESAS = ['Stellantis Betim', 'Stellantis Goiana', 'Leap Motors / Mopar']

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [empresa, setEmpresa] = useState(EMPRESAS[0])
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(email, senha, empresa)
      if (data.primeiro_acesso) {
        navigate('/trocar-senha')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1E3A5F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">RH Audit</h1>
          <p className="text-gray-500 text-sm mt-1">Zeentech — Gestão de RH e Auditoria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@zeentech.com.br" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select value={empresa} onChange={e => setEmpresa(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {EMPRESAS.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#1E3A5F] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#152C47] transition disabled:opacity-50 mt-2">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Senha provisória: <span className="font-mono font-semibold">Zeen@2026!</span>
        </p>
      </div>
    </div>
  )
}
