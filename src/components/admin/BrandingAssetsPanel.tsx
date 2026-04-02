import { useRef, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileDown,
  LogOut,
  RefreshCcw,
  Trash2,
  Upload,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { AssetImage } from '../brand/AssetImage'
import {
  getBrandingConfigSnapshot,
  resolveBrandingLogoUrl,
  sanitizeBrandingConfig,
  useBrandingStore,
  type AppBrandingConfig,
} from '../../store/brandingStore'
import { clearAccessGateState } from '../../services/accessGateService'
import {
  isStoredBrandingAssetRef,
  loadBrandingAsset,
  saveBrandingAsset,
} from '../../services/brandingAssetStorage'

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const MAX_SINGLE_FILE_MB = 8
const MAX_BRANDING_IMAGE_DIMENSION = 1200
const BRANDING_EXPORT_QUALITY = 0.86

type LogoField = 'primaryLogoUrl' | 'faviconUrl' | 'splashLogoUrl' | 'headerLogoUrl'
type DemoModelField = 'demoModel1Url' | 'demoModel2Url' | 'demoModel3Url' | 'demoModel4Url'

function shouldSyncFromPrimary(currentValue: string | null, currentPrimary: string | null) {
  return !currentValue || currentValue === '/favicon.svg' || currentValue === currentPrimary
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
    reader.readAsDataURL(file)
  })
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Falha ao converter asset para exportacao.'))
    reader.readAsDataURL(blob)
  })
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Falha ao carregar a imagem.'))
    }
    image.src = objectUrl
  })
}

async function fileToOptimizedDataUrl(file: File) {
  if (file.type === 'image/gif') {
    return readFileAsDataUrl(file)
  }

  const image = await loadImageFromFile(file)
  const width = Math.max(1, image.naturalWidth || image.width || 1)
  const height = Math.max(1, image.naturalHeight || image.height || 1)
  const scale = Math.min(1, MAX_BRANDING_IMAGE_DIMENSION / Math.max(width, height))
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Falha ao preparar a imagem.')
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0, 0, targetWidth, targetHeight)
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
  return canvas.toDataURL('image/webp', BRANDING_EXPORT_QUALITY)
}

async function fileToStoredAssetRef(file: File) {
  return saveBrandingAsset(file)
}

async function resolveAssetRefForExport(value: string | null) {
  if (!value) return null
  if (!isStoredBrandingAssetRef(value)) return value
  const blob = await loadBrandingAsset(value)
  if (!blob) return null
  return blobToDataUrl(blob)
}

function ensureValidImage(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Formato invalido. Use PNG, JPG, WebP ou GIF.')
  }
  if (file.size > MAX_SINGLE_FILE_MB * 1024 * 1024) {
    throw new Error(`Arquivo muito grande. Limite de ${MAX_SINGLE_FILE_MB}MB.`)
  }
}

interface UploadTileProps {
  label: string
  hint: string
  previewUrl: string | null
  onUpload: (file: File) => Promise<void>
  onRemove: () => void
  disabled?: boolean
}

function UploadTile({ label, hint, previewUrl, onUpload, onRemove, disabled = false }: UploadTileProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <Card className="space-y-3 rounded-2xl border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">{label}</p>
        <Badge variant="neutral">{previewUrl ? 'Configurado' : 'Fallback'}</Badge>
      </div>
      <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(24,25,29,0.86),rgba(14,15,19,0.92))]">
        {previewUrl ? (
          <AssetImage assetRef={previewUrl} alt={label} className="h-full w-full object-contain" loading="lazy" decoding="async" />
        ) : (
          <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Sem imagem</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          try {
            await onUpload(file)
          } finally {
            event.currentTarget.value = ''
          }
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="secondary" disabled={disabled} onClick={() => inputRef.current?.click()}>
          <Upload size={13} />
          Substituir
        </Button>
        <Button size="sm" variant="ghost" disabled={disabled || !previewUrl} onClick={onRemove}>
          <Trash2 size={13} />
          Remover
        </Button>
      </div>
    </Card>
  )
}

export function BrandingAssetsPanel() {
  const navigate = useNavigate()
  const config = useBrandingStore((state) => state.config)
  const setConfigPatch = useBrandingStore((state) => state.setConfigPatch)
  const resetConfig = useBrandingStore((state) => state.resetConfig)
  const [expanded, setExpanded] = useState(true)
  const [savingField, setSavingField] = useState<string | null>(null)

  const patchTextField = (field: keyof Pick<AppBrandingConfig, 'appName' | 'appTagline' | 'shortDescription' | 'marketingDescription' | 'accentColor'>, value: string) => {
    setConfigPatch({ [field]: value })
  }

  const patchToggle = (
    field: keyof Pick<
      AppBrandingConfig,
      'useLogoAsFavicon' | 'useLogoInSplash' | 'useLogoInHeader' | 'useLogoInPublicPages' | 'published'
    >,
    value: boolean,
  ) => {
    setConfigPatch({ [field]: value })
  }

  const saveLogoAsset = async (field: LogoField, file: File) => {
    ensureValidImage(file)
    setSavingField(field)
    try {
      const dataUrl = await fileToOptimizedDataUrl(file)
      const patch: Partial<AppBrandingConfig> = { [field]: dataUrl }
      if (field === 'primaryLogoUrl') {
        if (shouldSyncFromPrimary(config.headerLogoUrl, config.primaryLogoUrl)) {
          patch.headerLogoUrl = dataUrl
        }
        if (shouldSyncFromPrimary(config.splashLogoUrl, config.primaryLogoUrl)) {
          patch.splashLogoUrl = dataUrl
        }
        if (config.useLogoAsFavicon) {
          patch.faviconUrl = dataUrl
        }
      }
      setConfigPatch(patch)
      toast.success('Asset atualizado no branding.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar logo.')
    } finally {
      setSavingField(null)
    }
  }

  const removeLogoAsset = (field: LogoField) => {
    setConfigPatch({ [field]: null })
    toast.success('Asset removido.')
  }

  const saveDemoModelAsset = async (field: DemoModelField, file: File) => {
    ensureValidImage(file)
    setSavingField(field)
    try {
      const assetRef = await fileToStoredAssetRef(file)
      setConfigPatch({ [field]: assetRef })
      toast.success('Modelo de demonstracao atualizado.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar modelo de demonstracao.')
    } finally {
      setSavingField(null)
    }
  }

  const faviconPreview = resolveBrandingLogoUrl(config, 'favicon')
  const headerPreview = resolveBrandingLogoUrl(config, 'header')
  const splashPreview = resolveBrandingLogoUrl(config, 'splash')
  const publicPreview = resolveBrandingLogoUrl(config, 'public')

  const handleAdminLogout = () => {
    clearAccessGateState()
    toast.success('Sessao administrativa encerrada.')
    navigate('/', { replace: true })
  }

  const downloadPublicBrandingJson = async () => {
    try {
      const snapshot = sanitizeBrandingConfig(getBrandingConfigSnapshot())
      const forDeploy: AppBrandingConfig = {
        ...snapshot,
        primaryLogoUrl: await resolveAssetRefForExport(snapshot.primaryLogoUrl),
        faviconUrl: await resolveAssetRefForExport(snapshot.faviconUrl),
        splashLogoUrl: await resolveAssetRefForExport(snapshot.splashLogoUrl),
        headerLogoUrl: await resolveAssetRefForExport(snapshot.headerLogoUrl),
        demoModel1Url: await resolveAssetRefForExport(snapshot.demoModel1Url),
        demoModel2Url: await resolveAssetRefForExport(snapshot.demoModel2Url),
        demoModel3Url: await resolveAssetRefForExport(snapshot.demoModel3Url),
        demoModel4Url: await resolveAssetRefForExport(snapshot.demoModel4Url),
        marketingDemoAssets: [],
      }
      const json = JSON.stringify(forDeploy, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'branding.public.json'
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Gerado branding.public.json com os assets atuais.')
      toast.message(
        'Suba esse branding.public.json junto do site no servidor para manter exatamente a aparencia atual.',
        { duration: 10000 },
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao gerar branding.public.json.')
    }
  }

  return (
    <Card className="rounded-2xl border-[rgba(249,115,22,0.35)] bg-[linear-gradient(180deg,rgba(31,23,16,0.56),rgba(16,16,19,0.9))] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary-2)]">Painel administrativo</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Identidade do App / Branding & Assets</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Gerencie logo principal, favicon, splash e assets essenciais sem mexer no core. Para visitantes na VPS: exporte JSON e publique branding.public.json junto do site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="highlight">{config.published ? 'Publicado' : 'Rascunho'}</Badge>
          <Button size="sm" variant="secondary" onClick={() => void downloadPublicBrandingJson()} title="Para visitantes na VPS (sem seu localStorage)">
            <FileDown size={14} />
            JSON para VPS
          </Button>
          <Button size="sm" variant="secondary" onClick={handleAdminLogout}>
            <LogOut size={14} />
            Sair do ADM
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded((current) => !current)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Recolher' : 'Expandir'}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-5">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Dados da marca</h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Input value={config.appName} onChange={(event) => patchTextField('appName', event.target.value)} placeholder="Nome do app" />
              <Input value={config.appTagline} onChange={(event) => patchTextField('appTagline', event.target.value)} placeholder="Slogan" />
              <Input className="sm:col-span-2" value={config.shortDescription} onChange={(event) => patchTextField('shortDescription', event.target.value)} placeholder="Descricao curta" />
              <Input className="sm:col-span-2" value={config.marketingDescription} onChange={(event) => patchTextField('marketingDescription', event.target.value)} placeholder="Descricao comercial para landing" />
              <Input value={config.accentColor} onChange={(event) => patchTextField('accentColor', event.target.value)} placeholder="#F5C400" />
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                <input type="checkbox" checked={config.published} onChange={(event) => patchToggle('published', event.target.checked)} />
                Status de publicacao ativo
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Logo e favicon</h3>
            <div className="grid gap-3 lg:grid-cols-2">
              <UploadTile label="Logo principal (PNG)" hint="Usada como base em areas configuradas do app." previewUrl={config.primaryLogoUrl} onUpload={(file) => saveLogoAsset('primaryLogoUrl', file)} onRemove={() => removeLogoAsset('primaryLogoUrl')} disabled={savingField === 'primaryLogoUrl'} />
              <UploadTile label="Favicon" hint="Pode ser automatico a partir da logo principal." previewUrl={config.faviconUrl} onUpload={(file) => saveLogoAsset('faviconUrl', file)} onRemove={() => removeLogoAsset('faviconUrl')} disabled={savingField === 'faviconUrl'} />
              <UploadTile label="Logo de abertura / splash" hint="Exibida no destaque inicial da landing." previewUrl={config.splashLogoUrl} onUpload={(file) => saveLogoAsset('splashLogoUrl', file)} onRemove={() => removeLogoAsset('splashLogoUrl')} disabled={savingField === 'splashLogoUrl'} />
              <UploadTile label="Logo de header/navbar" hint="Exibida no topo e navegacao." previewUrl={config.headerLogoUrl} onUpload={(file) => saveLogoAsset('headerLogoUrl', file)} onRemove={() => removeLogoAsset('headerLogoUrl')} disabled={savingField === 'headerLogoUrl'} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked={config.useLogoAsFavicon} onChange={(event) => patchToggle('useLogoAsFavicon', event.target.checked)} />Usar logo principal como favicon</label>
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked={config.useLogoInSplash} onChange={(event) => patchToggle('useLogoInSplash', event.target.checked)} />Usar logo na abertura</label>
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked={config.useLogoInHeader} onChange={(event) => patchToggle('useLogoInHeader', event.target.checked)} />Usar logo no header/navbar</label>
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked={config.useLogoInPublicPages} onChange={(event) => patchToggle('useLogoInPublicPages', event.target.checked)} />Usar logo nas paginas publicas</label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Modelos nos 4 circulos da landing</h3>
            <p className="text-xs text-[var(--text-muted)]">Um arquivo por circulo. Sem upload, o circulo usa o GIF de <span className="text-[var(--text-secondary)]">Logo de abertura / splash</span>.</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <UploadTile label="Circulo 1" hint="Primeiro tipo demonstrado na landing." previewUrl={config.demoModel1Url} onUpload={(file) => saveDemoModelAsset('demoModel1Url', file)} onRemove={() => setConfigPatch({ demoModel1Url: null })} disabled={savingField === 'demoModel1Url'} />
              <UploadTile label="Circulo 2" hint="Segundo tipo demonstrado na landing." previewUrl={config.demoModel2Url} onUpload={(file) => saveDemoModelAsset('demoModel2Url', file)} onRemove={() => setConfigPatch({ demoModel2Url: null })} disabled={savingField === 'demoModel2Url'} />
              <UploadTile label="Circulo 3" hint="Terceiro tipo demonstrado na landing." previewUrl={config.demoModel3Url} onUpload={(file) => saveDemoModelAsset('demoModel3Url', file)} onRemove={() => setConfigPatch({ demoModel3Url: null })} disabled={savingField === 'demoModel3Url'} />
              <UploadTile label="Circulo 4" hint="Quarto tipo demonstrado na landing." previewUrl={config.demoModel4Url} onUpload={(file) => saveDemoModelAsset('demoModel4Url', file)} onRemove={() => setConfigPatch({ demoModel4Url: null })} disabled={savingField === 'demoModel4Url'} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Preview de aplicacao</h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { id: 'favicon', label: 'Favicon', url: faviconPreview },
                { id: 'header', label: 'Header', url: headerPreview },
                { id: 'splash', label: 'Splash', url: splashPreview },
                { id: 'public', label: 'Pagina publica', url: publicPreview },
              ].map((preview) => (
                <Card key={preview.id} className="rounded-2xl border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{preview.label}</p>
                  <div className="mt-2 flex h-20 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[radial-gradient(120px_90px_at_50%_18%,rgba(109,75,255,0.18),rgba(11,12,16,0.86))]">
                    <AssetImage assetRef={preview.url} alt={preview.label} className="h-full w-full object-contain" loading="lazy" decoding="async" />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">Ultima atualizacao: {new Date(config.updatedAt).toLocaleString('pt-BR')}</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 size={13} />Persistencia ativa</span>
              <Button size="sm" variant="ghost" onClick={() => { resetConfig(); toast.success('Branding restaurado para o padrao.') }}><RefreshCcw size={13} />Resetar branding</Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
