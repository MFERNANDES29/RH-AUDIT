import { useMutation } from '@tanstack/react-query'
import { consolidacaoAPI } from '../services/api'
import toast from 'react-hot-toast'

const COMP_ID = 1

const RELATORIOS = [
  { id: 'xlsx', icon: '📊', name: 'Base consolidada', desc: 'Todos os módulos em abas separadas', ext: '.xlsx' },
  { id: 'pdf',  icon: '📄', name: 'Relatório gerencial', desc: 'KPIs, gráficos e inconsistências', ext: '.pdf' },
]

export default function Exportacao() {
  const { mutate: baixarXlsx, isPending: downloadingXlsx } = useMutation({
    mutationFn: () => consolidacaoAPI.exportarXlsx(COMP_ID),
    onSuccess: (r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a'); a.href = url; a.download = 'BASE_CONSOLIDADA_MAIO_2026.xlsx'; a.click()
      toast.success('Download iniciado')
    },
    onError: () => toast.error('Erro ao gerar arquivo')
  })

  const { mutate: baixarPdf, isPending: downloadingPdf } = useMutation({
    mutationFn: () => consolidacaoAPI.exportarPdf(COMP_ID),
    onSuccess: (r) => {
      const url = window.URL.createObjectURL(new Blob([r.data, { type:'application/pdf' }]))
      const a = document.createElement('a'); a.href = url; a.download = 'RELATORIO_GERENCIAL_MAIO_2026.pdf'; a.click()
      toast.success('Download iniciado')
    },
    onError: () => toast.error('Erro ao gerar PDF')
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Exportação</h1>
        <p className="text-sm text-gray-500">Relatórios FOPAG Maio 2026</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-3xl mb-3">📊</p>
          <h2 className="font-semibold text-gray-800 mb-1">Base consolidada</h2>
          <p className="text-sm text-gray-500 mb-4">Todos os módulos em abas separadas + auditoria</p>
          <button onClick={() => baixarXlsx()} disabled={downloadingXlsx}
            className="w-full bg-green-600 text-white text-sm py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {downloadingXlsx ? 'Gerando...' : '⬇ Baixar Excel (.xlsx)'}
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-3xl mb-3">📄</p>
          <h2 className="font-semibold text-gray-800 mb-1">Relatório gerencial</h2>
          <p className="text-sm text-gray-500 mb-4">KPIs, inconsistências e fluxo de aprovação</p>
          <button onClick={() => baixarPdf()} disabled={downloadingPdf}
            className="w-full bg-blue-600 text-white text-sm py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {downloadingPdf ? 'Gerando...' : '⬇ Baixar PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
