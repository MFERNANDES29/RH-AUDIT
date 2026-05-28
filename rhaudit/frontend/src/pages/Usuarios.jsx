import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../services/api'
import toast from 'react-hot-toast'

const PERFIL_COLOR = { admin:'bg-red-100 text-red-700', rh:'bg-blue-100 text-blue-700', gestor:'bg-yellow-100 text-yellow-700', analista:'bg-green-100 text-green-700' }
const STATUS_COLOR = { ativo:'bg-green-100 text-green-700', inativo:'bg-gray-100 text-gray-500', pendente:'bg-yellow-100 text-yellow-700' }
const EMPRESAS = ['Stellantis Betim','Stellantis Goiana','Leap Motors / Mopar']

const EMPTY = { nome:'', email:'', password:'Zeen@2026!', perfil:'analista', empresas_acesso: EMPRESAS, permissoes:{} }

export default function Usuarios() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.list().then(r => r.data)
  })

  const { mutate: criar } = useMutation({
    mutationFn: (d) => usersAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['users']); setShowForm(false); setForm(EMPTY); toast.success('Usuário criado') },
    onError: (e) => toast.error(e.response?.data?.detail || 'Erro ao criar usuário')
  })

  const { mutate: inativar } = useMutation({
    mutationFn: (id) => usersAPI.remove(id),
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('Usuário inativado') }
  })

  const { mutate: atualizar } = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['users']); setEditId(null); toast.success('Perfil atualizado') }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500">{users.length} cadastrados</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          + Novo usuário
        </button>
      </div>

      <div className="grid gap-3">
        {isLoading ? <p className="text-gray-400 text-sm">Carregando...</p> : users.map(u => (
          <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${PERFIL_COLOR[u.perfil]}`}>
              {u.nome.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-gray-900 text-sm">{u.nome}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PERFIL_COLOR[u.perfil]}`}>{u.perfil}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[u.status]}`}>{u.status}</span>
              </div>
              <p className="text-xs text-gray-500">{u.email}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {(u.empresas_acesso || []).map(e => (
                  <span key={e} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{e.replace('Stellantis ','').replace('Leap Motors / ','')}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <select value={u.perfil}
                onChange={e => atualizar({ id: u.id, data: { perfil: e.target.value } })}
                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none">
                {['admin','rh','gestor','analista'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {u.status === 'ativo' && (
                <button onClick={() => { if(window.confirm('Inativar '+u.nome+'?')) inativar(u.id) }}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1">
                  Inativar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Novo usuário</h2>
            <div className="space-y-3">
              {[['Nome completo','nome','text'],['E-mail corporativo','email','email'],['Senha provisória','password','text']].map(([lbl,key,type]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{lbl}</label>
                  <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Perfil</label>
                <select value={form.perfil} onChange={e=>setForm({...form,perfil:e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['admin','rh','gestor','analista'].map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={()=>{setShowForm(false);setForm(EMPTY)}} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={()=>criar(form)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Criar usuário</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
