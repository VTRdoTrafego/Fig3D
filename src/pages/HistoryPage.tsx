import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { listProjects, listProjectVersions } from '../services/projectService'
import { formatDate } from '../lib/utils'
import type { Project, ProjectVersion } from '../types/domain'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState, LoadingState } from '../components/ui/States'
import { Badge } from '../components/ui/Badge'
import { AppPageHeader } from '../components/layout/AppPageHeader'

interface Item {
  project: Project
  versions: ProjectVersion[]
}

export function HistoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const projects = await listProjects()
        const withVersions = await Promise.all(
          projects.slice(0, 10).map(async (project) => ({
            project,
            versions: await listProjectVersions(project.id),
          })),
        )
        setItems(withVersions)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar histórico')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) {
    return <LoadingState label="Carregando histórico..." />
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <AppPageHeader
        eyebrow="FIG3D Timeline"
        title="Histórico de versões"
        subtitle="Acompanhe evoluções e retome versões para acelerar sua criação."
      />
      {items.map((item) => (
        <Card key={item.project.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.project.name}</h3>
              <p className="text-xs text-[var(--text-muted)]">{item.versions.length} versões salvas</p>
            </div>
            <Link to={`/editor/${item.project.id}`}>
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                Abrir projeto
              </Button>
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {item.versions.slice(0, 6).map((version) => (
              <article
                key={version.id}
                className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] p-3 text-sm text-[var(--text-secondary)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">{formatDate(version.created_at)}</Badge>
                  <span>Material {version.material_type}</span>
                  <span>Cor base {version.base_color}</span>
                </div>
              </article>
            ))}
            {!item.versions.length ? (
              <p className="text-sm text-[var(--text-muted)]">Sem versões ainda.</p>
            ) : null}
          </div>
        </Card>
      ))}
      {!items.length ? (
        <EmptyState title="Nenhum histórico disponível" description="Salve versões no editor para acompanhar evolução." />
      ) : null}
    </div>
  )
}
