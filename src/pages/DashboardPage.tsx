import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { listProjects } from '../services/projectService'
import type { Project } from '../types/domain'
import { Button } from '../components/ui/Button'
import { ProjectCard } from '../components/ui/EntityCards'
import { LoadingState, EmptyState, UpgradeBanner } from '../components/ui/States'
import { SectionHeader } from '../components/ui/SectionHeader'
import { AppPageHeader } from '../components/layout/AppPageHeader'

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void listProjects()
      .then(setProjects)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4 sm:space-y-5">
      <AppPageHeader
        eyebrow="FIG3D"
        title="Sua logo em 3D em segundos"
        subtitle="Sem precisar pagar pros outros: crie sozinho, ajuste rápido e exporte com qualidade."
        actions={
          <Link to="/editor" className="block w-full sm:w-auto">
            <Button variant="premium" size="lg" className="w-full sm:w-auto">
              <Plus size={16} />
              Começar agora
            </Button>
          </Link>
        }
      />

      <section>
        <SectionHeader
          eyebrow="Seu espaço"
          title="Criações recentes"
          description="Menos cliques, mais resultado. Tudo pronto para mobile."
        />
        <div className="mt-3">
          <UpgradeBanner
            title="Visual profissional sem complicação"
            description="Do upload ao 3D em poucos toques para creators, lojas e empreendedores."
          />
        </div>
        {loading ? (
          <div className="mt-4">
            <LoadingState label="Carregando projetos..." />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} id={project.id} name={project.name} updatedAt={project.updated_at} />
            ))}
          </div>
        )}
        {!loading && !projects.length ? (
          <div className="mt-4">
            <EmptyState
              title="Nenhum projeto ainda"
              description="Toque em Novo projeto para começar a criar seus modelos."
            />
          </div>
        ) : null}
      </section>
    </div>
  )
}
