import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function TrocarSenha() {
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (nova !== confirma) { toast.error('As senhas não coincidem'); return }
    if (nova.length < 8)   { toast.error('Mínimo 8 caracteres'); return }
    try {
      await authAPI.changePassword({ senha_atual: atual, nova_senha: nova })
      toast.success('Senha alterada com sucesso!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao alterar senha')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-[#1E3A5F] mb-2">Primeiro acesso</h1>
        <p className="text-sm text-gray-500 mb-6">Defina sua senha pessoal para continuar.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ['Senha provisória', atual, setAtual],
            ['Nova senha (mín. 8 caracteres)', nova, setNova],
            ['Confirmar nova senha', confirma, setConfirma],
          ].map(([label, val, setter]) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="password" value={val} onChange={e => setter(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <button type="submit"
            className="w-full bg-[#1E3A5F] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#152C47] transition mt-2">
            Salvar e entrar
          </button>
        </form>
      </div>
    </div>
  )
}
