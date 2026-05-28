import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const { user, empresa } = useAuthStore()

  const kpis = [
    { label: 'Colaboradores ativos', value: '421', color: 'text-blue-900', sub: 'Base importada' },
    { label: 'Módulos importados',   value: '6/6', color: 'text-green-700', sub: 'Todos processados' },
    { label: 'Inconsistências',      value: '31',  color: 'text-red-600',   sub: '8 alta gravidade' },
    { label: 'Taxa localização',     value: '91,4%', color: 'text-yellow-600', sub: 'Meta: 93%' },
    { label: 'Status FOPAG',         value: 'Aberta', color: 'text-yellow-600', sub: 'Mai 2026' },
  ]

  const barData = [
    { modulo: 'Refeitório', qtd: 21 }, { modulo: 'HO', qtd: 20 },
    { modulo: 'Fretado', qtd: 11 },    { modulo: 'HE/AN', qtd: 8 },
    { modulo: 'Desl.', qtd: 2 },
  ]

  const trendData = [
    { comp: 'Mar', inconsistencias: 14, taxa: 88 },
    { comp: 'Abr', inconsistencias: 7,  taxa: 91 },
    { comp: 'Mai', inconsistencias: 31, taxa: 91.4 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{empresa} · FOPAG Maio 2026</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-semibold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Inconsistências por módulo</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="modulo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="qtd" fill="#2563EB" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Evolução por competência</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis dataKey="comp" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="inconsistencias" stroke="#DC2626" strokeWidth={2} dot />
              <Line type="monotone" dataKey="taxa" stroke="#16A34A" strokeWidth={2} dot strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
