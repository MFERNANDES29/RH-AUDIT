import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { colaboradoresAPI } from '../services/api'
import toast from 'react-hot-toast'

const SIT_COLOR = {
  '01 Ativo': 'bg-green-100 text-green-700',
  'Em férias': 'bg-yellow-100 text-yellow-700',
  '05 Aux. Doença': 'bg-blue-100 text-blue-700',
  '02 Inativo': 'bg-gray-100 text-gray-600',
  'Desligado': 'bg-red-100 text-red-700',
}

export default function Colaboradores() {
  const [q, setQ] = useState('')
  const [situacao, setSituacao] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({})
  const qc = useQueryClient()

  const { data: colabs = [], isLoading } = useQuery({
    queryKey: ['colaboradores', q, situacao],
    queryFn: () => colaboradoresAPI.list({ q: q || undefined, situacao: situacao || undefined, limit: 200 }).then(r => r.data),
  })

  const { mutate: atualizar } = useMutation({
    mutationFn: ({ id, data }) => colaboradoresAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['colaboradores']); setEditId(null); toast.success('Colaborador atualizado') }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Colaboradores</h1>
          <p className="text-sm text-gray-500">{colabs.length} registros</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome ou matrícula..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={situacao} onChange={e => setSituacao(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas as situações</option>
          <option value="01 Ativo">Ativo</option>
          <option value="Em férias">Em férias</option>
          <option value="05 Aux. Doença">Aux. Doença</option>
          <option value="02 Inativo">Inativo</option>
        </select>
      </div>

      {isLoading ? <p className="text-gray-400 text-sm">Carregando...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Matrícula','Nome','Cargo','Situação','Centro de Custo','Ações'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {colabs.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.matricula}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{c.nome}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{c.cargo || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SIT_COLOR[c.situacao] || 'bg-gray-100 text-gray-600'}`}>
                      {c.situacao || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{c.centro_custo || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditId(c.id); setForm({ cpf: c.cpf || '', data_admissao: c.data_admissao || '' }) }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editId && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Editar colaborador</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
                    <input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Data de admissão</label>
                    <input type="date" value={form.data_admissao} onChange={e => setForm({...form, data_admissao: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-5">
                  <button onClick={() => setEditId(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                  <button onClick={() => atualizar({ id: editId, data: { ...colabs.find(c=>c.id===editId), ...form, empresa_id: 1 } })}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
