import { useState } from 'react'
import toast from 'react-hot-toast'

const DEFAULT = {
  betim: { ho_bruto:621, ho_dias:30, ho_retroativo:true, desl_bruto:453, desl_desc:50, desl_retroativo:false },
  goiana:{ ho_bruto:621, ho_dias:30, ho_retroativo:true, desl_bruto:453, desl_desc:50, desl_retroativo:true  },
}

export default function Configuracoes() {
  const [tab, setTab] = useState('betim')
  const [cfg, setCfg] = useState(DEFAULT)

  const set = (emp, key, val) => setCfg(c => ({ ...c, [emp]: { ...c[emp], [key]: val } }))
  const c = cfg[tab]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Configurações financeiras</h1>
        <p className="text-sm text-gray-500">Padrões aplicados automaticamente em cada competência</p>
      </div>

      <div className="flex border-b border-gray-200">
        {[['betim','Stellantis Betim'],['goiana','Stellantis Goiana']].map(([k,lbl])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab===k?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {lbl}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {[
          { lbl:'Home Office — Valor bruto mensal', key:'ho_bruto', prefix:'R$', type:'number' },
          { lbl:'Home Office — Base de cálculo (dias)', key:'ho_dias', type:'number' },
          { lbl:'Deslocamento — Valor bruto mensal', key:'desl_bruto', prefix:'R$', type:'number' },
          { lbl:'Deslocamento — Percentual de desconto', key:'desl_desc', suffix:'%', type:'number' },
        ].map(row => (
          <div key={row.key} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-700">{row.lbl}</span>
            <div className="flex items-center gap-1">
              {row.prefix && <span className="text-sm text-gray-400">{row.prefix}</span>}
              <input type="number" value={c[row.key]}
                onChange={e => set(tab, row.key, parseFloat(e.target.value))}
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {row.suffix && <span className="text-sm text-gray-400">{row.suffix}</span>}
            </div>
          </div>
        ))}

        {[
          { lbl:'Reembolso retroativo — Home Office', key:'ho_retroativo' },
          { lbl:'Reembolso retroativo — Deslocamento', key:'desl_retroativo' },
        ].map(row => (
          <div key={row.key} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-700">{row.lbl}</span>
            <button onClick={() => set(tab, row.key, !c[row.key])}
              className={`w-10 h-6 rounded-full transition-colors relative ${c[row.key] ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${c[row.key] ? 'left-5' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Variáveis mensais</strong> — Fretado, Refeitório e HE são extraídos automaticamente das planilhas importadas a cada competência.
      </div>

      <div className="flex justify-end">
        <button onClick={() => toast.success('Configurações salvas')}
          className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-blue-700">
          Salvar configurações
        </button>
      </div>
    </div>
  )
}
