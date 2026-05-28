import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { importacaoAPI } from '../services/api'
import toast from 'react-hot-toast'

const MODULOS = {
  HOME_OFFICE: 'Home Office', DESLOCAMENTO: 'Deslocamento',
  FRETADO_BETIM: 'Fretado Betim', FRETADO_GOIANA: 'Fretado Goiana',
  HORAEXTRA: 'HE / AN', REFEITORIO: 'Refeitório', ATIVOS: 'Colaboradores', PONTO: 'Ponto'
}

function detectar(nome) {
  const u = nome.toUpperCase()
  for (const [k,v] of Object.entries(MODULOS)) if (u.includes(k)) return v
  return 'Desconhecido'
}

export default function Importacao() {
  const [logs, setLogs] = useState([])
  const [uploading, setUploading] = useState(false)
  const COMP_ID = 1; const EMP_ID = 1

  const addLog = (msg, type='info') => setLogs(l => [...l, { msg, type, ts: new Date().toLocaleTimeString('pt-BR') }])

  const onDrop = useCallback(async (files) => {
    setUploading(true)
    for (const file of files) {
      const modulo = detectar(file.name)
      addLog(`Iniciando: ${file.name} → ${modulo}`)
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('competencia_id', COMP_ID)
        fd.append('empresa_id', EMP_ID)
        const { data } = await importacaoAPI.upload(fd)
        addLog(`✓ ${file.name} — ${data.resultado?.total || 0} registros`, 'success')
        if (data.resultado?.inconsistencias > 0)
          addLog(`⚠ ${data.resultado.inconsistencias} inconsistências detectadas`, 'warn')
      } catch (e) {
        addLog(`✗ Erro: ${file.name} — ${e.response?.data?.detail || e.message}`, 'error')
      }
    }
    setUploading(false)
    toast.success('Importação concluída')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/pdf': ['.pdf'] } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Importação de arquivos</h1>
        <p className="text-sm text-gray-500">FOPAG Maio 2026 · Identificação automática do módulo</p>
      </div>

      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
        <input {...getInputProps()} />
        <p className="text-4xl mb-3">📥</p>
        <p className="font-medium text-gray-700">{isDragActive ? 'Solte os arquivos aqui' : 'Arraste os arquivos ou clique para selecionar'}</p>
        <p className="text-sm text-gray-400 mt-1">Aceita .xlsx e .pdf · Múltiplos arquivos</p>
      </div>

      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto">
          {logs.map((l, i) => (
            <div key={i} className={`text-xs font-mono flex gap-3 py-0.5 ${l.type === 'error' ? 'text-red-400' : l.type === 'warn' ? 'text-yellow-300' : l.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
              <span className="text-gray-500">{l.ts}</span>
              <span>{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
