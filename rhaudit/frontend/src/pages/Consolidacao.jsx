import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { consolidacaoAPI } from '../services/api'
import toast from 'react-hot-toast'

const COMP_ID = 1

const STEPS = [
  { id: 1, label: 'Gerar base consolidada',     sub: 'Snapshot de todos os módulos' },
  { id: 2, label: 'Aprovação Nível 1 — RH',     sub: 'Thais Silva' },
  { id: 3, label: 'Aprovação Nível 2 — Admin',  sub: 'Mariane Fernandes' },
]

export default function Consolidacao() {
  const [step, setStep] = useState(0)
  const [obs, setObs] = useState('')

  const { mutate: gerar, isPending: gerando } = useMutation({
    mutationFn: () => consolidacaoAPI.gerar(COMP_ID),
    onSuccess: () => { setStep(1); toast.success('Base consolidada gerada!') }
  })

  const { mutate: aprovarN1, isPending: aprovandoN1 } = useMutation({
    mutationFn: () => consolidacaoAPI.aprovarN1(COMP_ID, obs),
    onSuccess: () => { setStep(2); setObs(''); toast.success('Aprovação Nível 1 registrada') }
  })

  const { mutate: aprovarN2, isPending: aprovandoN2 } = useMutation({
    mutationFn: () => consolidacaoAPI.aprovarN2(COMP_ID, obs),
    onSuccess: () => { setStep(3); setObs(''); toast.success('FOPAG Maio 2026 fechada!') }
  })

  const { mutate: baixarXlsx } = useMutation({
    mutationFn: () => consolidacaoAPI.exportarXlsx(COMP_ID),
    onSuccess: (resp) => {
      const url = window.URL.createObjectURL(new Blob([resp.data]))
      const a = document.createElement('a'); a.href = url; a.download = 'BASE_CONSOLIDADA.xlsx'; a.click()
    }
  })

  const { mutate: baixarPdf } = useMutation({
    mutationFn: () => consolidacaoAPI.exportarPdf(COMP_ID),
    onSuccess: (resp) => {
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = 'RELATORIO_GERENCIAL.pdf'; a.click()
    }
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Consolidação — FOPAG Maio 2026</h1>
        <p className="text-sm text-gray-500">Aprovação em 2 níveis com registro no audit trail</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 flex-1 ${i < step ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < step ? 'bg-green-600 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : s.id}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 mx-2 flex-shrink-0 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {step === 0 && (
          <>
            <h2 className="font-semibold text-gray-800">Etapa 1 — Gerar base consolidada</h2>
            <p className="text-sm text-gray-500">Agrupa todos os módulos importados em um snapshot imutável com hash de verificação.</p>
            <button onClick={() => gerar()} disabled={gerando}
              className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {gerando ? 'Gerando...' : 'Gerar base consolidada'}
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-semibold text-gray-800">Etapa 2 — Aprovação Nível 1 (RH)</h2>
            <p className="text-sm text-gray-500">Thais Silva — confirme que todos os módulos foram conferidos.</p>
            <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Observações (opcional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <button onClick={() => aprovarN1()} disabled={aprovandoN1}
              className="bg-green-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {aprovandoN1 ? 'Aprovando...' : 'Aprovar — Nível 1 (RH)'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-gray-800">Etapa 3 — Aprovação Nível 2 (Admin)</h2>
            <p className="text-sm text-gray-500">Mariane Fernandes — aprovação final e fechamento da FOPAG.</p>
            <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Observações (opcional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <button onClick={() => aprovarN2()} disabled={aprovandoN2}
              className="bg-green-700 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-green-800 disabled:opacity-50">
              {aprovandoN2 ? 'Fechando FOPAG...' : 'Aprovar e Fechar FOPAG'}
            </button>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-6">
            <p className="text-4xl mb-3">🎉</p>
            <h2 className="text-lg font-semibold text-green-700 mb-1">FOPAG Maio 2026 fechada!</h2>
            <p className="text-sm text-gray-500 mb-6">Base imutável gerada · 2 assinaturas registradas · Audit trail completo</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => baixarXlsx()}
                className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700">⬇ Baixar Excel</button>
              <button onClick={() => baixarPdf()}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">⬇ Baixar PDF</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
