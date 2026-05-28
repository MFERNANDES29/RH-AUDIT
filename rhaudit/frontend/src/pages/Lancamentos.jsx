import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lancamentosAPI } from '../services/api'
import toast from 'react-hot-toast'

const COMP_ID = 1
const CATEGORIAS_CRED = ['Reembolso retroativo — Home Office','Reembolso retroativo — Deslocamento','Correção de desconto indevido','Ajuste de férias','Crédito de refeitório','Outros (crédito)']
const CATEGORIAS_DEB  = ['Desconto não aplicado — Fretado','Desconto não aplicado — Refeitório','Estorno de reembolso indevido','Ajuste de adicional noturno','Outros (débito)']
const STATUS_COLOR = { pendente:'bg-yellow-100 text-yellow-700', aprovado:'bg-green-100 text-green-700', cancelado:'bg-gray-100 text-gray-500' }

export default function Lancamentos() {
  const qc = useQueryClient()
  const [tipo, setTipo] = useState('credito')
  const [form, setForm] = useState({ matricula:'', categoria:'', modulo:'Home Office', valor:'', justificativa:'', competencia_id: COMP_ID })
  const [showForm, setShowForm] = useState(false)

  const { data: lancs = [] } = useQuery({
    queryKey: ['lancamentos', COMP_ID],
    queryFn: () => lancamentosAPI.list(COMP_ID).then(r => r.data)
  })

  const { mutate: criar } = useMutation({
    mutationFn: (data) => lancamentosAPI.criar(data),
    onSuccess: () => { qc.invalidateQueries(['lancamentos']); setShowForm(false); setForm({matricula:'',categoria:'',modulo:'Home Office',valor:'',justificativa:'',competencia_id:COMP_ID}); toast.success('Lançamento criado') }
  })

  const { mutate: aprovar } = useMutation({
    mutationFn: (id) => lancamentosAPI.aprovar(id),
    onSuccess: () => { qc.invalidateQueries(['lancamentos']); toast.success('Aprovado') }
  })

  const { mutate: cancelar } = useMutation({
    mutationFn: (id) => lancamentosAPI.cancelar(id),
    onSuccess: () => { qc.invalidateQueries(['lancamentos']); toast.success('Cancelado') }
  })

  const totalCred = lancs.filter(l=>l.tipo==='credito'&&l.status!=='cancelado').reduce((s,l)=>s+l.valor,0)
  const totalDeb  = lancs.filter(l=>l.tipo==='debito' &&l.status!=='cancelado').reduce((s,l)=>s+l.valor,0)

  const handleSubmit = (e) => {
    e.preventDefault()
    criar({ ...form, tipo, valor: parseFloat(form.valor) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Créditos e débitos manuais</h1>
          <p className="text-sm text-gray-500">FOPAG Maio 2026</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          + Novo lançamento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Total créditos</p><p className="text-xl font-semibold text-green-700">R$ {totalCred.toFixed(2).replace('.',',')}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Total débitos</p><p className="text-xl font-semibold text-red-600">R$ {totalDeb.toFixed(2).replace('.',',')}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Saldo líquido</p><p className={`text-xl font-semibold ${totalCred-totalDeb>=0?'text-green-700':'text-red-600'}`}>{totalCred-totalDeb>=0?'+ ':'− '}R$ {Math.abs(totalCred-totalDeb).toFixed(2).replace('.',',')}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['Matrícula','Tipo','Categoria','Valor','Status','Ações'].map(h=><th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lancs.map(l=>(
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{l.matricula}</td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold ${l.tipo==='credito'?'text-green-700':'text-red-600'}`}>{l.tipo==='credito'?'Crédito':'Débito'}</span></td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{l.categoria}</td>
                <td className="px-4 py-3 font-semibold text-sm">{l.tipo==='credito'?'+ ':'− '}R$ {l.valor.toFixed(2).replace('.',',')}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[l.status]}`}>{l.status}</span></td>
                <td className="px-4 py-3">
                  {l.status==='pendente'&&<div className="flex gap-2">
                    <button onClick={()=>aprovar(l.id)} className="text-xs text-green-600 hover:text-green-800 font-medium">Aprovar</button>
                    <button onClick={()=>cancelar(l.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Cancelar</button>
                  </div>}
                </td>
              </tr>
            ))}
            {lancs.length===0&&<tr><td colSpan={6} className="text-center py-8 text-sm text-gray-400">Nenhum lançamento registrado</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Novo lançamento manual</h2>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
              {['credito','debito'].map(t=>(
                <button key={t} onClick={()=>setTipo(t)}
                  className={`flex-1 py-2 text-sm font-medium transition ${tipo===t?(t==='credito'?'bg-green-600 text-white':'bg-red-600 text-white'):'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  {t==='credito'?'+ Crédito':'− Débito'}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required value={form.matricula} onChange={e=>setForm({...form,matricula:e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Matrícula *" />
              <select required value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione a categoria *</option>
                {(tipo==='credito'?CATEGORIAS_CRED:CATEGORIAS_DEB).map(c=><option key={c}>{c}</option>)}
              </select>
              <input required type="number" step="0.01" min="0.01" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Valor (R$) *" />
              {parseFloat(form.valor)>500&&<p className="text-xs text-yellow-600 font-medium">⚠ Acima de R$ 500,00 — requer aprovação</p>}
              <textarea required value={form.justificativa} onChange={e=>setForm({...form,justificativa:e.target.value})} rows={2} resize="none"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Justificativa *" />
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
