import { Menu, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { Fig3DBrandMark } from '../brand/Fig3DBrandMark'

interface MobileTopBarProps {
  title: string
  subtitle?: string
  onMenu: () => void
}

export function MobileTopBar({ title, subtitle, onMenu }: MobileTopBarProps) {
  return (
    <header className="safe-top sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(18,19,23,0.94),rgba(11,12,16,0.9))] px-3 pb-3 pt-3 shadow-[0_10px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden">
      <div className="flex items-start gap-2">
        <IconButton onClick={onMenu} aria-label="Abrir menu de navegação">
          <Menu size={16} />
        </IconButton>
        <div className="min-w-0 flex-1 space-y-1">
          <Fig3DBrandMark compact subtitle={subtitle ?? 'Sua logo em 3D em segundos'} />
          <p className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">{title}</p>
        </div>
        <Link to="/editor">
          <Button variant="premium" size="sm">
            <Plus size={13} />
            Criar
          </Button>
        </Link>
      </div>
    </header>
  )
}
