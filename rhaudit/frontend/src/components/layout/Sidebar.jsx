import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const MENU = [
  { path: '/dashboard',      icon: '📊', label: 'Dashboard' },
  { path: '/importacao',     icon: '📥', label: 'Importação' },
  { path: '/colaboradores',  icon: '👥', label: 'Colaboradores' },
  { path: '/auditoria',      icon: '🔍', label: 'Auditoria' },
  { path: '/lancamentos',    icon: '💰', label: 'Créditos e débitos' },
  { path: '/consolidacao',   icon: '✅', label: 'Consolidação' },
  { path: '/exportacao',     icon: '📄', label: 'Exportação' },
  { path: '/usuarios',       icon: '👤', label: 'Usuários', adminOnly: true },
  { path: '/configuracoes',  icon: '⚙️',  label: 'Configurações', adminOnly: true },
]

export default function Sidebar() {
  const { user, empresa, logout } = useAuthStore()
  const isAdmin = ['admin','rh'].includes(user?.perfil)

  return (
    <aside className="w-56 bg-[#1E3A5F] min-h-screen flex flex-col text-white flex-shrink-0">
      <div className="p-5 border-b border-white/10">
        <div className="text-lg font-bold">RH Audit</div>
        <div className="text-xs text-blue-200 mt-0.5">Zeentech</div>
      </div>

      <div className="px-4 py-3 border-b border-white/10 text-xs text-blue-200">
        <div className="font-medium text-white truncate">{empresa || 'Selecione empresa'}</div>
        <div className="truncate">{user?.nome}</div>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {MENU.filter(m => !m.adminOnly || isAdmin).map(m => (
          <NavLink key={m.path} to={m.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition rounded mx-2 ${
                isActive ? 'bg-white/20 text-white font-medium' : 'text-blue-100 hover:bg-white/10'}`}>
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={logout}
          className="w-full text-left text-sm text-blue-200 hover:text-white transition flex items-center gap-2">
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  )
}
