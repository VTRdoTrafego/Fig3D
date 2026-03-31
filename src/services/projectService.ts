import { hasSupabaseEnv, isPublicApp, supabase } from '../lib/supabase'
import { slugify } from '../lib/utils'
import type { EditorConfig, Project, ProjectVersion, RenderExport } from '../types/domain'
import { toVersionPayload } from '../store/editorStore'

const LOCAL_KEY = 'button-studio-local-db-v1'

interface LocalDb {
  projects: Project[]
  versions: ProjectVersion[]
  exports: RenderExport[]
}

function readLocalDb(): LocalDb {
  const raw = localStorage.getItem(LOCAL_KEY)
  if (!raw) {
    return { projects: [], versions: [], exports: [] }
  }
  try {
    return JSON.parse(raw) as LocalDb
  } catch {
    return { projects: [], versions: [], exports: [] }
  }
}

function writeLocalDb(db: LocalDb) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(db))
}

function nowIso() {
  return new Date().toISOString()
}

function shouldUseLocalMode() {
  return isPublicApp || !hasSupabaseEnv || !supabase
}

function assertSupabaseClient() {
  if (!supabase || !hasSupabaseEnv) {
    throw new Error('Supabase não configurado neste ambiente.')
  }
  return supabase
}

export async function listProjects() {
  if (shouldUseLocalMode()) {
    const db = readLocalDb()
    return [...db.projects].sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  }

  const client = assertSupabaseClient()
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data as Project[]
}

export async function createProject(name: string, userId: string) {
  if (shouldUseLocalMode()) {
    const db = readLocalDb()
    const project: Project = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      slug: slugify(name),
      current_thumb_path: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    db.projects.unshift(project)
    writeLocalDb(db)
    return project
  }

  const client = assertSupabaseClient()
  const { data, error } = await client
    .from('projects')
    .insert({
      name,
      user_id: userId,
      slug: slugify(name),
    })
    .select('*')
    .single()
  if (error) throw error
  return data as Project
}

export async function duplicateProject(project: Project, userId: string) {
  const clone = await createProject(`${project.name} (copia)`, userId)
  return clone
}

export async function getProject(projectId: string) {
  if (shouldUseLocalMode()) {
    const db = readLocalDb()
    const project = db.projects.find((item) => item.id === projectId)
    if (!project) {
      throw new Error('Projeto não encontrado.')
    }
    return project
  }

  const client = assertSupabaseClient()
  const { data, error } = await client.from('projects').select('*').eq('id', projectId).single()
  if (error) throw error
  return data as Project
}

export async function listProjectVersions(projectId: string) {
  if (shouldUseLocalMode()) {
    const db = readLocalDb()
    return db.versions
      .filter((version) => version.project_id === projectId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  const client = assertSupabaseClient()
  const { data, error } = await client
    .from('project_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ProjectVersion[]
}

export async function saveProjectVersion(projectId: string, config: EditorConfig) {
  if (shouldUseLocalMode()) {
    const db = readLocalDb()
    const payload = toVersionPayload(config)
    const version: ProjectVersion = {
      id: crypto.randomUUID(),
      project_id: projectId,
      logo_path: payload.logo_path,
      model_type: payload.model_type,
      border_width: payload.border_width,
      border_color: payload.border_color,
      base_color: payload.base_color,
      material_type: payload.material_type,
      light_intensity: payload.light_intensity,
      light_color: payload.light_color,
      rotation_speed: payload.rotation_speed,
      background_color: payload.background_color,
      gif_path: null,
      thumbnail_path: null,
      json_config: payload.json_config,
      created_at: nowIso(),
    }
    db.versions.unshift(version)
    db.projects = db.projects.map((project) =>
      project.id === projectId ? { ...project, updated_at: nowIso() } : project,
    )
    writeLocalDb(db)
    return version
  }

  const client = assertSupabaseClient()
  const payload = toVersionPayload(config)
  const { data, error } = await client
    .from('project_versions')
    .insert({
      project_id: projectId,
      ...payload,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as ProjectVersion
}

export async function registerExport(payload: {
  projectId: string
  versionId: string | null
  gifPath: string
  thumbnailPath: string
  durationMs: number
  fps: number
  backgroundColor: string
}) {
  if (shouldUseLocalMode()) {
    const db = readLocalDb()
    const created: RenderExport = {
      id: crypto.randomUUID(),
      project_id: payload.projectId,
      version_id: payload.versionId,
      gif_path: payload.gifPath,
      thumbnail_path: payload.thumbnailPath,
      duration_ms: payload.durationMs,
      fps: payload.fps,
      background_color: payload.backgroundColor,
      created_at: nowIso(),
    }
    db.exports.unshift(created)
    db.projects = db.projects.map((project) =>
      project.id === payload.projectId ? { ...project, updated_at: nowIso() } : project,
    )
    writeLocalDb(db)
    return created
  }

  const client = assertSupabaseClient()
  const { data, error } = await client
    .from('render_exports')
    .insert({
      project_id: payload.projectId,
      version_id: payload.versionId,
      gif_path: payload.gifPath,
      thumbnail_path: payload.thumbnailPath,
      duration_ms: payload.durationMs,
      fps: payload.fps,
      background_color: payload.backgroundColor,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as RenderExport
}

export async function listExports(projectId: string) {
  if (shouldUseLocalMode()) {
    const db = readLocalDb()
    return db.exports
      .filter((entry) => entry.project_id === projectId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  const client = assertSupabaseClient()
  const { data, error } = await client
    .from('render_exports')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as RenderExport[]
}
