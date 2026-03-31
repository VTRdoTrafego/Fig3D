import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Edit3, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/useAuth'
import { createProject, duplicateProject, listProjects } from '../services/projectService'
import { formatDate } from '../lib/utils'
import type { Project } from '../types/domain'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SearchInput } from '../components/ui/SearchInput'
import { EmptyState, LoadingState } from '../components/ui/States'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { AppPageHeader } from '../components/layout/AppPageHeader'

export function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')

  const reload = async () => {
    setLoading(true)
    try {
      const data = await listProjects()
      setProjects(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao listar projetos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const handleCreate = async () => {
    const safeName = name.trim() || `Projeto ${new Date().toLocaleDateString('pt-BR')}`
    setCreating(true)
    try {
      const project = await createProject(safeName, user?.id ?? 'public-user')
      toast.success('Projeto criado')
      setProjects((prev) => [project, ...prev])
      setName('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar projeto')
    } finally {
      setCreating(false)
    }
  }

  const handleDuplicate = async (project: Project) => {
    try {
      await duplicateProject(project, user?.id ?? 'public-user')
      toast.success('Projeto duplicado')
      await reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao duplicar')
    }
  }

  const filteredProjects = projects.filter((project) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return true
    return project.name.toLowerCase().includes(normalized)
  })

  return (
    <div className="space-y-4 sm:space-y-5">
      <AppPageHeader
        eyebrow="FIG3D Workspace"
        title="Meus projetos"
        subtitle="Organize suas criações 3D com fluxo rápido e profissional."
      />

      <Card variant="elevated" className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Crie, duplique e ajuste suas logos 3D sem complicação.
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do novo projeto"
          />
          <Button variant="premium" onClick={handleCreate} disabled={creating}>
            <Plus size={16} />
            {creating ? 'Criando...' : 'Criar projeto'}
          </Button>
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Carregando projetos..." />
      ) : (
        <>
          <SearchInput
            placeholder="Buscar projeto..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="grid gap-3 lg:grid-cols-2">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="rounded-3xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{project.name}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Atualizado em {formatDate(project.updated_at)}</p>
                  </div>
                  <Badge variant="neutral">Ativo</Badge>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link to={`/editor/${project.id}`}>
                    <Button variant="secondary" className="w-full">
                      <Edit3 size={15} />
                      Abrir editor
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full" onClick={() => void handleDuplicate(project)}>
                    <Copy size={15} />
                    Duplicar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      {!loading && !filteredProjects.length ? (
        <EmptyState title="Nenhum projeto encontrado" description="Crie um novo projeto ou ajuste sua busca." />
      ) : null}
    </div>
  )
}
