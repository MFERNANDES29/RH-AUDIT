import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inconsistenciasAPI } from '../services/api'
import toast from 'react-hot-toast'

const COMP_ID = 1
const GRAV_COLOR = { alta: 'bg-red-100 text-red-700', media: 'bg-yellow-100 text-yellow-700', baixa: 'bg-blue-100 text-blue-700' }
const STATUS_COLOR = { aberta: 'bg-orange-100 text-orange-700', em_tratamento: 'bg-blue-100 text-blue-700', resolvida: 'bg-green-100 text-green-700', ignorada: 'bg-gray-100 text-gray-600' }

export default function Auditoria() {
  const [filtroGrav, setFiltroGrav] = useState('')
  const [editId, setEditId] = useState(null)
  const [tratativa, setTratativa] = useState('')
  const qc = useQueryClient()

  const { data: incs = [], isLoading } = useQuery({
    queryKey: ['inconsistencias', COMP_ID, filtroGrav],
    queryFn: () => inconsistenciasAPI.list({ competencia_id: COMP_ID, ...(filtroGrav && { gravidade: filtroGrav }) }).then(r => r.data)
  })

  const { mutate: tratar } = useMutation({
    mutationFn: ({ id, data }) => inconsistenciasAPI.tratar(id, data),
    onSuccess: () => { qc.invalidateQueries(['inconsistencias']); setEditId(null); toast.success('Tratativa registrada') }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Auditoria</h1>
          <p className="text-sm text-gray-500">{incs.length} inconsistências · FOPAG Maio 2026</p>
        </div>
        <select value={filtroGrav} onChange={e => setFiltroGrav(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas as gravidades</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      {isLoading ? <p className="text-gray-400 text-sm">Carregando...</p> : (
        <div className="space-y-3">
          {incs.map(inc => (
            <div key={inc.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${GRAV_COLOR[inc.gravidade]}`}>{inc.gravidade}</span>
                    <span className="text-xs text-gray-500 font-medium">{inc.modulo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[inc.status]}`}>{inc.status.replace('_',' ')}</span>
                  </div>
                  <p className="text-sm text-gray-800">{inc.descricao}</p>
                  {inc.tratativa && <p className="text-xs text-gray-500 mt-1 italic">Tratativa: {inc.tratativa}</p>}
                </div>
                <button onClick={() => { setEditId(inc.id); setTratativa(inc.tratativa || '') }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                  Registrar tratativa
                </button>
              </div>

              {editId === inc.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <textarea value={tratativa} onChange={e => setTratativa(e.target.value)} rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Descreva a tratativa ou justificativa..." />
                  <div className="flex gap-2 mt-2 justify-end">
                    <button onClick={() => setEditId(null)} className="text-xs text-gray-500 px-3 py-1.5 border rounded-lg hover:bg-gray-50">Cancelar</button>
                    <button onClick={() => tratar({ id: inc.id, data: { tratativa, status: 'em_tratamento' } })}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Salvar</button>
                    <button onClick={() => tratar({ id: inc.id, data: { tratativa, status: 'resolvida' } })}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Resolver</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
