import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RefreshCcw, Save, Plus, Play, Pause, BadgeCheck, Sparkles, Download } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/useAuth'
import { useEditorStore } from '../store/editorStore'
import { ButtonViewer, type ViewerHandle } from '../components/editor/ButtonViewer'
import { BottomActionBar } from '../components/editor/BottomActionBar'
import { BackgroundRemovalHint } from '../components/editor/BackgroundRemovalHint'
import { Button } from '../components/ui/Button'
import {
  createProject,
  getProject,
  listProjects,
  listProjectVersions,
  registerExport,
  saveProjectVersion,
} from '../services/projectService'
import { getPublicUrl, uploadBlob, uploadLogo } from '../services/storageService'
import { exportGif } from '../services/exportService'
import type { Project, ProjectVersion } from '../types/domain'
import { cn } from '../lib/utils'
import { exportTransparentAnimation, type ExportFormat } from '../components/editor/export/exportTransparentAnimation'
import { hasSupabaseEnv, isPublicApp, isRemoteSupabaseMode } from '../lib/supabase'
import { BORDER_CYCLE_STEPS, matchBorderCycleIndex } from '../constants/borderCycle'
import { BADGE_GEOMETRY_CYCLE, badgeGeometryIcon, badgeGeometryLabel } from '../constants/badgeGeometryCycle'
import { modelPresets } from '../constants/models'
import { Card } from '../components/ui/Card'
import { LoadingState } from '../components/ui/States'
import { Modal } from '../components/ui/Modal'
import { PricingCards } from '../components/access/PricingCards'
import { BrandingAssetsPanel } from '../components/admin/BrandingAssetsPanel'
import {
  consumeCreationSlot,
  getCreationAllowance,
  getCheckoutUrl,
  getTrialUsageStats,
  hasAdminAccess,
  type CheckoutPlan,
  type TrialUsageStats,
} from '../services/accessGateService'
import { resolveBrandingLogoUrl, useBrandingStore } from '../store/brandingStore'

const DEFAULT_GIF_EXPORT_SPEED_PERCENT = 30
const DEFAULT_GIF_EXPORT_SIZE = 512
const DEFAULT_GIF_CONTENT_PADDING = 0
const LAST_ACTIVE_PROJECT_KEY = 'fig3d-last-active-project-id'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function colorDistance(a: [number, number, number], b: [number, number, number]) {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

async function detectLikelyBackground(file: File) {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = objectUrl
    await image.decode()

    const sourceWidth = Math.max(1, image.naturalWidth || image.width || 1)
    const sourceHeight = Math.max(1, image.naturalHeight || image.height || 1)
    const maxDimension = 220
    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight))
    const width = Math.max(48, Math.round(sourceWidth * scale))
    const height = Math.max(48, Math.round(sourceHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0, width, height)

    const { data } = ctx.getImageData(0, 0, width, height)
    const edgeThickness = 2
    let transparentPixels = 0
    let edgePixels = 0
    let edgeOpaquePixels = 0
    let edgeLumSum = 0
    let edgeLumSquaredSum = 0

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4
        const alpha = data[i + 3]
        if (alpha < 245) transparentPixels += 1
        const isEdge = x < edgeThickness || x >= width - edgeThickness || y < edgeThickness || y >= height - edgeThickness
        if (!isEdge) continue

        edgePixels += 1
        if (alpha > 245) edgeOpaquePixels += 1
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        edgeLumSum += lum
        edgeLumSquaredSum += lum * lum
      }
    }

    const getPixel = (x: number, y: number): [number, number, number] => {
      const index = (y * width + x) * 4
      return [data[index], data[index + 1], data[index + 2]]
    }

    const corners = [
      getPixel(0, 0),
      getPixel(width - 1, 0),
      getPixel(0, height - 1),
      getPixel(width - 1, height - 1),
    ]
    const avgCornerDistance =
      (colorDistance(corners[0], corners[1]) +
        colorDistance(corners[0], corners[2]) +
        colorDistance(corners[1], corners[3]) +
        colorDistance(corners[2], corners[3])) /
      4

    const totalPixels = Math.max(1, width * height)
    const transparencyRatio = transparentPixels / totalPixels
    if (transparencyRatio > 0.01) {
      return false
    }

    const edgeMean = edgeLumSum / Math.max(1, edgePixels)
    const edgeVariance = edgeLumSquaredSum / Math.max(1, edgePixels) - edgeMean * edgeMean
    const edgeMostlyOpaque = edgeOpaquePixels / Math.max(1, edgePixels) > 0.97
    const edgeUniform = edgeVariance < 420
    const cornersSimilar = avgCornerDistance < 26
    const jpegLike = /jpe?g/.test(file.type)

    return edgeMostlyOpaque && (edgeUniform || cornersSimilar || jpegLike)
  } catch {
    return false
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function getLogoAutoAdjustments(file: File) {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = objectUrl
    await image.decode()

    const width = Math.max(1, image.naturalWidth || image.width || 1)
    const height = Math.max(1, image.naturalHeight || image.height || 1)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return {
        scale: 1,
        x: 0,
        y: 0,
        fitMode: 'contain' as const,
        safeMargin: 0.08,
      }
    }

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0, width, height)
    const pixels = ctx.getImageData(0, 0, width, height).data

    let minX = width
    let minY = height
    let maxX = 0
    let maxY = 0
    let visible = 0
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4
        const alpha = pixels[i + 3]
        if (alpha < 24) continue
        visible += 1
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }

    if (!visible) {
      return {
        scale: 1,
        x: 0,
        y: 0,
        fitMode: 'contain' as const,
        safeMargin: 0.08,
      }
    }

    const occupiedWidth = Math.max(1, maxX - minX + 1)
    const occupiedHeight = Math.max(1, maxY - minY + 1)
    const maxOccupiedRatio = Math.max(occupiedWidth / width, occupiedHeight / height)
    const targetOccupiedRatio = 0.78
    const scale = clamp(targetOccupiedRatio / Math.max(1e-4, maxOccupiedRatio), 0.75, 1.25)

    return {
      scale,
      x: 0,
      y: 0,
      fitMode: 'contain' as const,
      safeMargin: 0.06,
    }
  } catch {
    return {
      scale: 1,
      x: 0,
      y: 0,
      fitMode: 'contain' as const,
      safeMargin: 0.08,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function EditorPage() {
  const { user } = useAuth()
  const { projectId } = useParams()
  const navigate = useNavigate()
  const viewerRef = useRef<ViewerHandle | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const { config, setConfig, applyPreset, resetConfig } = useEditorStore()
  const brandingConfig = useBrandingStore((state) => state.config)

  const [project, setProject] = useState<Project | null>(null)
  const [versions, setVersions] = useState<ProjectVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [, setLastGifUrl] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [showExportProgressModal, setShowExportProgressModal] = useState(false)
  const [cleanExportPreview, setCleanExportPreview] = useState(false)
  const [backgroundHint, setBackgroundHint] = useState<{ visible: boolean; fileName: string | null }>({
    visible: false,
    fileName: null,
  })
  const [progress, setProgress] = useState(0)
  const [forcedRotationOffsetY, setForcedRotationOffsetY] = useState<number | null>(null)
  const uploadHintRequestRef = useRef(0)
  const [mobileDockActive, setMobileDockActive] = useState<'circle' | 'logo' | 'special' | 'play' | 'export'>('circle')
  const [specialPresetIndex, setSpecialPresetIndex] = useState(0)
  const [trialStats, setTrialStats] = useState<TrialUsageStats | null>(() =>
    isPublicApp ? getTrialUsageStats() : null,
  )
  const [trialPaywallOpen, setTrialPaywallOpen] = useState<boolean>(() =>
    Boolean(isPublicApp && getTrialUsageStats()?.limitReached),
  )
  const isAdmin = hasAdminAccess()
  const specialPresets = useMemo(
    () => ['RGBPulse', 'PremiumOnyx', 'ChromedEdge', 'VidroTransparente', 'GoldenCrown', 'SilverBlackGolden'],
    [],
  )

  const safeProjectId = useMemo(() => project?.id ?? projectId ?? null, [project?.id, projectId])

  const activeCreationFormatShortName = useMemo(() => {
    const preset = modelPresets.find((m) => m.id === config.modelType)
    return preset ? preset.name.replace(/^\d+\.\s*/, '').trim() : config.modelType
  }, [config.modelType])

  const activeBorderPresetShortName = useMemo(() => {
    const i = matchBorderCycleIndex(config.border)
    return BORDER_CYCLE_STEPS[i]?.label ?? 'Borda'
  }, [config.border])

  const mobileDockItems = useMemo(() => {
    const section = config.model.badgeCrossSection ?? 'circle'
    return [
      { id: 'circle' as const, label: badgeGeometryLabel(section), icon: badgeGeometryIcon(section) },
      { id: 'logo' as const, label: 'Logo', icon: BadgeCheck },
      { id: 'special' as const, label: 'Especial', icon: Sparkles },
      { id: 'play' as const, label: 'Play', icon: Play },
      { id: 'export' as const, label: 'Exportar', icon: Download },
    ]
  }, [config.model.badgeCrossSection])

  const cycleToNextCircleGeometry = () => {
    const ids = BADGE_GEOMETRY_CYCLE.map((step) => step.id)
    const current = config.model.badgeCrossSection ?? 'circle'
    const idx = ids.indexOf(current)
    const nextIdx = idx < 0 ? 0 : (idx + 1) % ids.length
    const next = BADGE_GEOMETRY_CYCLE[nextIdx]
    setConfig({ model: { badgeCrossSection: next.id } })
    toast.success(`Geometria: ${next.label}`)
  }

  const openMobileCategory = (category: 'circle' | 'logo' | 'special' | 'play' | 'export') => {
    setMobileDockActive(category)
    if (category === 'export') {
      void exportTransparentNow()
      return
    }
    if (category === 'circle') {
      cycleToNextCircleGeometry()
      return
    }
    if (category === 'logo') {
      importInputRef.current?.click()
      return
    }
    if (category === 'special') {
      const nextPreset = specialPresets[specialPresetIndex % specialPresets.length]
      applyPreset(nextPreset)
      setSpecialPresetIndex((current) => (current + 1) % specialPresets.length)
      toast.success(`Especial: ${nextPreset}`)
      return
    }
    if (category === 'play') {
      setConfig({ animation: { autoRotate: !config.animation.autoRotate } })
    }
  }

  const goToCheckout = (plan: CheckoutPlan) => {
    const checkoutUrl = getCheckoutUrl(plan)
    if (!checkoutUrl) {
      toast.info(
        `Checkout ${plan === 'annual' ? 'anual' : 'mensal'} ainda não configurado. Defina VITE_CHECKOUT_${plan === 'annual' ? 'ANNUAL' : 'MONTHLY'}_URL.`,
      )
      return
    }
    window.location.href = checkoutUrl
  }

  const ensureTrialCreationAllowed = () => {
    if (!isPublicApp) return true
    const allowance = getCreationAllowance()
    if (allowance.allowed) return true
    if (allowance.reason === 'missing_access') {
      toast.error('Informe seu e-mail para liberar o acesso grátis.')
      navigate('/auth')
    } else if (allowance.reason === 'admin_verification_required') {
      toast.error('Acesso administrativo requer código de autenticação válido.')
      navigate('/auth')
    } else {
      toast.error('Seu teste grátis terminou. Assine o Premium para continuar.')
      setTrialPaywallOpen(true)
    }
    return false
  }

  const registerTrialCreation = () => {
    if (!isPublicApp) return true
    const consume = consumeCreationSlot()
    if (!consume.allowed) {
      if (consume.reason === 'admin_verification_required') {
        toast.error('Confirme o código admin para liberar o gerenciamento.')
        navigate('/auth')
      } else {
        toast.error('Seu limite gratuito foi atingido. Continue no Premium.')
        setTrialPaywallOpen(true)
      }
      return false
    }
    const stats = getTrialUsageStats(consume.state)
    setTrialStats(stats)
    if (stats?.limitReached) {
      toast.error('Seus 3 testes gratuitos acabaram.')
      setTrialPaywallOpen(true)
      return true
    }
    if (stats) {
      toast.info(stats.countdownLabel)
    }
    return true
  }

  useEffect(() => {
    const load = async () => {
      if (!projectId) {
        try {
          const lastActiveProjectId = localStorage.getItem(LAST_ACTIVE_PROJECT_KEY)
          if (lastActiveProjectId) {
            navigate(`/editor/${lastActiveProjectId}`, { replace: true })
            return
          }
          const projects = await listProjects()
          if (projects[0]?.id) {
            navigate(`/editor/${projects[0].id}`, { replace: true })
            return
          }
        } catch {
          localStorage.removeItem(LAST_ACTIVE_PROJECT_KEY)
        }
        setLoading(false)
        return
      }
      try {
        const [projectResponse, versionsResponse] = await Promise.all([
          getProject(projectId),
          listProjectVersions(projectId),
        ])
        setProject(projectResponse)
        setVersions(versionsResponse)
        if (versionsResponse[0]?.json_config) {
          setConfig(versionsResponse[0].json_config)
        }
        localStorage.setItem(LAST_ACTIVE_PROJECT_KEY, projectId)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Falha ao carregar projeto')
        if (localStorage.getItem(LAST_ACTIVE_PROJECT_KEY) === projectId) {
          localStorage.removeItem(LAST_ACTIVE_PROJECT_KEY)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [navigate, projectId, setConfig])

  useEffect(() => {
    if (!isPublicApp) return
    const latestStats = getTrialUsageStats()
    setTrialStats(latestStats)
    if (latestStats?.limitReached) {
      setTrialPaywallOpen(true)
    }
  }, [])

  useEffect(() => {
    const brandingLogo = resolveBrandingLogoUrl(brandingConfig, 'primary')
    if (!brandingLogo) return
    const hasFallbackLogo =
      !config.logo.path || config.logo.path === '/favicon.svg' || config.logo.path === '/fig3d-logo.png'
    if (hasFallbackLogo && config.logo.path !== brandingLogo) {
      setConfig({
        logo: {
          path: brandingLogo,
          colorMode: 'brand-original',
        },
      })
    }
  }, [brandingConfig, config.logo.path, setConfig])

  const ensureProject = async () => {
    if (safeProjectId) return safeProjectId
    if (isRemoteSupabaseMode && !user?.id) {
      toast.error('Sessão expirada ou não autenticado. Entre novamente.')
      navigate('/auth')
      throw new Error('Não autenticado')
    }
    const created = await createProject(
      `Novo projeto ${new Date().toLocaleDateString('pt-BR')}`,
      user?.id ?? 'public-user',
    )
    setProject(created)
    navigate(`/editor/${created.id}`, { replace: true })
    return created.id
  }

  const reloadHistory = async (targetProjectId: string) => {
    const versionsResponse = await listProjectVersions(targetProjectId)
    setVersions(versionsResponse)
  }

  /**
   * Ciclo “Novo” na barra: mesmo reset visual + formato, mas sem navegar nem recarregar
   * versão salva do projeto (senão o useEffect aplicava json_config antigo, ex. Coin Premium).
   */
  const applyCycledCreationFormat = (nextModelType: string) => {
    const preserveSelectedLogo = Boolean(config.logo.path)
    const selectedLogo = preserveSelectedLogo ? { ...config.logo } : null

    resetConfig()
    const isForma = nextModelType.includes('forma')
    const logoForForma =
      selectedLogo && isForma && selectedLogo.mode === 'badge-hybrid'
        ? { ...selectedLogo, mode: 'embossed' as const }
        : selectedLogo
    setConfig({
      modelType: nextModelType,
      ...(logoForForma ? { logo: logoForForma } : isForma ? { logo: { mode: 'embossed' } } : {}),
    })
    setLastGifUrl(null)
    setBackgroundHint({ visible: false, fileName: null })
    setForcedRotationOffsetY(null)
    setSpecialPresetIndex(0)
    setMobileDockActive('circle')
  }

  const cycleToNextBorderPreset = () => {
    const i = matchBorderCycleIndex(config.border)
    const next = (i + 1) % BORDER_CYCLE_STEPS.length
    const step = BORDER_CYCLE_STEPS[next]
    setConfig(step.patch)
    toast.success(`Borda: ${step.label}`)
  }

  const cycleToNextNewCreationFormat = () => {
    const currentIdx = modelPresets.findIndex((m) => m.id === config.modelType)
    const nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % modelPresets.length
    const nextPreset = modelPresets[nextIdx]
    const shortName = nextPreset.name.replace(/^\d+\.\s*/, '').trim()
    applyCycledCreationFormat(nextPreset.id)
    toast.success(`Formato aplicado: ${shortName}`)
  }

  const handleUpload = async (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      toast.error('Formato inválido. Envie PNG, JPG ou SVG.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Limite 10MB.')
      return
    }
    const hintRequestId = ++uploadHintRequestRef.current
    void detectLikelyBackground(file).then((likelyHasBackground) => {
      if (uploadHintRequestRef.current !== hintRequestId) return
      setBackgroundHint(
        likelyHasBackground
          ? {
              visible: true,
              fileName: file.name,
            }
          : {
              visible: false,
              fileName: null,
            },
      )
    })
    try {
      const autoLogo = await getLogoAutoAdjustments(file)
      if (!hasSupabaseEnv || isPublicApp) {
        const localUrl = URL.createObjectURL(file)
        setConfig({
          logo: {
            path: localUrl,
            colorMode: 'brand-original',
            rotationZ: 0,
            ...autoLogo,
          },
        })
        toast.success('Logo aplicada localmente (modo público).')
        return
      }
      if (!user?.id) {
        toast.error('Faça login para enviar a logo ao armazenamento.')
        return
      }
      const targetProjectId = await ensureProject()
      const path = await uploadLogo(file, user.id, targetProjectId)
      const publicUrl = getPublicUrl(path, 'logos')
      setConfig({
        logo: {
          path: publicUrl,
          colorMode: 'brand-original',
          rotationZ: 0,
          ...autoLogo,
        },
      })
      toast.success('Logo enviada e aplicada ao modelo.')
    } catch (error) {
      const localUrl = URL.createObjectURL(file)
      const autoLogo = await getLogoAutoAdjustments(file)
      setConfig({
        logo: {
          path: localUrl,
          colorMode: 'brand-original',
          rotationZ: 0,
          ...autoLogo,
        },
      })
      toast.warning('Upload remoto indisponível. Aplicado localmente.')
      console.error(error)
    }
  }

  const saveVersion = async () => {
    try {
      const targetProjectId = await ensureProject()
      await saveProjectVersion(targetProjectId, config)
      toast.success('Versão salva no histórico.')
      await reloadHistory(targetProjectId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar versão')
    }
  }

  const handleExportGif = async (
    durationMs: number,
    fps: number,
    backgroundColor: string,
    format: ExportFormat,
    transparent: boolean,
    exportSpeedPercent = DEFAULT_GIF_EXPORT_SPEED_PERCENT,
    exportScalePercent = 100,
    frameScalePercent = 100,
  ) => {
    const canvas = viewerRef.current?.getCanvas()
    if (!canvas) {
      toast.error('Canvas não disponível para exportar.')
      return
    }
    if (!ensureTrialCreationAllowed()) {
      return
    }
    const previousPreviewTransparency = config.scene.transparentPreview
    setConfig({
      export: {
        durationMs,
        fps,
        transparent,
        resolutionScale: clamp(exportScalePercent, 30, 120) / 100,
      },
      scene: {
        transparentPreview: transparent,
      },
    })
    setShowExportProgressModal(true)
    setExporting(true)
    setProgress(0)
    try {
      if (transparent) {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      await new Promise((resolve) => requestAnimationFrame(resolve))
      await new Promise((resolve) => requestAnimationFrame(resolve))
      if (format === 'gif') {
        const speedRatio = clamp(exportSpeedPercent, 30, 200) / 100
        const effectiveDurationMs = Math.max(200, Math.round(durationMs / speedRatio))
        const outputScale = clamp(exportScalePercent, 30, 120) / 100
        const frameScale = clamp(frameScalePercent, 50, 120) / 100
        const glassSafeTransparency = config.scene.visualPreset === 'glass'
        const direction = config.animation.direction === 'counterclockwise' ? -1 : 1
        const turns = Math.max(1, config.animation.turns)
        const result = await exportGif({
          canvas,
          durationMs: effectiveDurationMs,
          fps,
          backgroundColor,
          transparent,
          outputScale,
          frameScale,
          normalizeSquare: true,
          fixedSize: {
            width: DEFAULT_GIF_EXPORT_SIZE,
            height: DEFAULT_GIF_EXPORT_SIZE,
          },
          cropToSquare: true,
          trimTransparentBounds: true,
          contentPadding: DEFAULT_GIF_CONTENT_PADDING,
          glassSafeTransparency,
          onProgress: setProgress,
          beforeFrame: async (frameIndex, totalFrames) => {
            const progressRatio = totalFrames > 0 ? frameIndex / totalFrames : 0
            setForcedRotationOffsetY(
              direction * progressRatio * Math.PI * 2 * turns,
            )
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
          },
        })
        const localGifUrl = URL.createObjectURL(result.gifBlob)
        setLastGifUrl(localGifUrl)
        toast.success('GIF gerado com sucesso.')
        const anchor = document.createElement('a')
        anchor.href = localGifUrl
        anchor.download = 'Fig3D.gif'
        anchor.click()
        registerTrialCreation()

        const targetProjectId = await ensureProject()
        if (user) {
          const gifPath = await uploadBlob(result.gifBlob, user.id, targetProjectId, 'render.gif', 'exports')
          const thumbPath = await uploadBlob(
            result.thumbnailBlob,
            user.id,
            targetProjectId,
            'thumbnail.png',
            'thumbs',
          )
          await registerExport({
            projectId: targetProjectId,
            versionId: versions[0]?.id ?? null,
            gifPath,
            thumbnailPath: thumbPath,
            durationMs: effectiveDurationMs,
            fps,
            backgroundColor,
          })
          await reloadHistory(targetProjectId)
          setLastGifUrl(getPublicUrl(gifPath, 'exports'))
        } else {
          const thumbUrl = URL.createObjectURL(result.thumbnailBlob)
          await registerExport({
            projectId: targetProjectId,
            versionId: versions[0]?.id ?? null,
            gifPath: localGifUrl,
            thumbnailPath: thumbUrl,
            durationMs: effectiveDurationMs,
            fps,
            backgroundColor,
          })
          await reloadHistory(targetProjectId)
        }
      } else {
        const result = await exportTransparentAnimation({
          canvas,
          durationMs,
          fps,
          format,
          backgroundColor,
          transparent,
          onProgress: setProgress,
        })
        if ('webmBlob' in result && result.webmBlob instanceof Blob) {
          const url = URL.createObjectURL(result.webmBlob)
          setLastGifUrl(url)
          toast.success('WEBM alpha gerado.')
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = 'Fig3D.webm'
          anchor.click()
          registerTrialCreation()
        } else if ('pngSequenceZip' in result && result.pngSequenceZip) {
          const url = URL.createObjectURL(result.pngSequenceZip)
          setLastGifUrl(url)
          toast.success(result.warning ?? 'Sequencia PNG gerada.')
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = 'Fig3D.zip'
          anchor.click()
          registerTrialCreation()
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao exportar GIF')
    } finally {
      setForcedRotationOffsetY(null)
      setConfig({ scene: { transparentPreview: previousPreviewTransparency } })
      setExporting(false)
      setCleanExportPreview(false)
      setProgress(0)
    }
  }

  const exportTransparentNow = async () => {
    if (exporting) {
      toast.info(`Exportação em andamento (${Math.round(progress * 100)}%).`)
      return
    }
    await handleExportGif(
      config.export.durationMs,
      config.export.fps,
      config.scene.backgroundColor,
      'gif',
      true,
      DEFAULT_GIF_EXPORT_SPEED_PERCENT,
      100,
      100,
    )
  }

  const exportProgressPercent = clamp(Math.round(progress * 100), 0, 100)

  if (loading) {
    return <LoadingState label="Carregando editor..." />
  }

  return (
    <div className="space-y-4 pb-32 lg:pb-0">
      {isPublicApp && trialStats ? (
        <Card className="rounded-2xl border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {trialStats.countdownLabel}
            </p>
            <span
              className={
                trialStats.limitReached
                  ? 'rounded-full border border-[rgba(245,196,0,0.45)] bg-[rgba(245,196,0,0.14)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-yellow)]'
                  : 'rounded-full border border-[rgba(139,92,255,0.45)] bg-[rgba(109,75,255,0.14)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-100'
              }
            >
              {trialStats.limitReached
                ? 'Teste grátis finalizado'
                : `Testes restantes: ${trialStats.testsRemaining}`}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
            <div
              className={trialStats.limitReached ? 'h-2 rounded-full bg-[var(--accent-yellow)]' : 'h-2 rounded-full bg-[var(--accent-purple)]'}
              style={{ width: `${trialStats.premium ? 100 : (trialStats.testsUsed / trialStats.testsLimit) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {trialStats.premium
              ? 'Plano Premium ativo: criação ilimitada.'
              : `${trialStats.testsUsed}/${trialStats.testsLimit} usos gratuitos utilizados. Sua logo com mais presença.`}
          </p>
        </Card>
      ) : null}

      <input
        ref={importInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,.svg"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleUpload(file)
          event.currentTarget.value = ''
        }}
      />

      <Card variant="glass" className="space-y-3 p-2.5 sm:p-3 lg:p-4">
        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          <Button size="sm" onClick={() => void saveVersion()}>
            <Save size={14} />
            Salvar criação
          </Button>
          <Button size="sm" variant="secondary" onClick={() => viewerRef.current?.resetCamera()}>
            <RefreshCcw size={14} />
            Resetar preview
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="hidden sm:inline-flex"
            onClick={() => {
              setConfig({ animation: { autoRotate: !config.animation.autoRotate } })
            }}
          >
            {config.animation.autoRotate ? <Pause size={14} /> : <Play size={14} />}
            {config.animation.autoRotate ? 'Pausar' : 'Play'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="hidden sm:inline-flex flex-col items-stretch gap-0.5 py-2 h-auto"
            onClick={() => cycleToNextNewCreationFormat()}
            title="Cada clique aplica o próximo formato (mantém a logo selecionada)"
          >
            <span className="inline-flex items-center gap-1.5">
              <Plus size={14} />
              <span className="text-xs font-semibold">Nova criação</span>
            </span>
            <span className="pl-[22px] text-[10px] font-medium text-violet-200/90">{activeCreationFormatShortName}</span>
          </Button>
        </div>

        <ButtonViewer
          ref={viewerRef}
          config={config}
          forcedRotationOffsetY={forcedRotationOffsetY}
          suppressPreviewEffects={cleanExportPreview}
        />
        {backgroundHint.visible ? (
          <BackgroundRemovalHint
            fileName={backgroundHint.fileName}
            onDismiss={() => setBackgroundHint((current) => ({ ...current, visible: false }))}
          />
        ) : null}

        <div className="hidden lg:block">
          <BottomActionBar
            isPlaying={config.animation.autoRotate}
            onImport={() => {
              importInputRef.current?.click()
            }}
            onNew={() => cycleToNextNewCreationFormat()}
            onToggleBorder={() => cycleToNextBorderPreset()}
            onSetCircle={() => cycleToNextCircleGeometry()}
            onSetLogoMode={() =>
              {
                setConfig({
                  logo: {
                    colorMode: config.logo.colorMode === 'brand-original' ? 'brand-3d-premium' : 'brand-original',
                  },
                })
              }
            }
            onSpecial={() => {
              const nextPreset = specialPresets[specialPresetIndex % specialPresets.length]
              applyPreset(nextPreset)
              setSpecialPresetIndex((current) => (current + 1) % specialPresets.length)
              toast.success(`Especial: ${nextPreset}`)
            }}
            onTogglePlay={() => {
              setConfig({ animation: { autoRotate: !config.animation.autoRotate } })
            }}
            onExport={() => {
              void exportTransparentNow()
            }}
            newFormatName={activeCreationFormatShortName}
            borderPresetName={activeBorderPresetShortName}
            badgeCrossSection={config.model.badgeCrossSection ?? 'circle'}
            activeActionIds={[
              config.border.enabled ? 'border' : '',
              config.logo.colorMode === 'brand-3d-premium' ? 'logo' : '',
              config.animation.autoRotate ? 'play' : '',
            ].filter(Boolean)}
          />
        </div>
      </Card>

      {isAdmin ? <BrandingAssetsPanel /> : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(3.95rem+env(safe-area-inset-bottom))] z-30 px-3 lg:hidden">
        <div className="pointer-events-auto mx-auto grid max-w-xl grid-cols-5 gap-1.5 rounded-2xl border border-[var(--border-soft)] bg-[rgba(14,16,24,0.9)] p-1.5 shadow-[var(--shadow-soft)] backdrop-blur-xl">
          {mobileDockItems.map((item) => {
            const Icon = item.icon
            const active = mobileDockActive === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openMobileCategory(item.id as 'circle' | 'logo' | 'special' | 'play' | 'export')}
                className={cn(
                  'inline-flex h-12 flex-col items-center justify-center rounded-xl border text-[10px] font-semibold transition',
                  item.id === 'export'
                    ? active
                      ? 'border-[rgba(245,196,0,0.45)] bg-[var(--accent-yellow)] text-zinc-950 shadow-[var(--shadow-glow-yellow)]'
                      : 'border-[rgba(245,196,0,0.25)] bg-[rgba(245,196,0,0.14)] text-[var(--accent-yellow)] hover:bg-[rgba(245,196,0,0.2)]'
                    : active
                      ? 'border-[rgba(139,92,255,0.5)] bg-[rgba(139,92,255,0.2)] text-violet-100'
                      : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:bg-[rgba(255,255,255,0.06)]',
                )}
              >
                <Icon size={13} />
                <span className="mt-1 line-clamp-2 text-center text-[9px] font-semibold leading-tight">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <Modal
        open={exporting && showExportProgressModal}
        onClose={() => setShowExportProgressModal(false)}
        title="Exportando seu projeto"
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">Aguarde, estamos gerando o arquivo com transparência.</p>
          <div className="h-2 w-full rounded-full bg-[rgba(255,255,255,0.08)]">
            <div
              className="h-2 rounded-full bg-[var(--accent-purple)] transition-all duration-150"
              style={{ width: `${exportProgressPercent}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{exportProgressPercent}%</p>
          <p className="text-xs text-[var(--text-muted)]">Se fechar este popup, a exportação continua em segundo plano.</p>
          <Button size="sm" variant="ghost" className="w-full" onClick={() => setShowExportProgressModal(false)}>
            Fechar popup
          </Button>
        </div>
      </Modal>

      <Modal
        open={trialPaywallOpen}
        onClose={() => setTrialPaywallOpen(false)}
        title="Seus 3 testes gratuitos terminaram"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Seus 3 testes gratuitos terminaram. Escolha um plano para continuar criando sem limites no Fig3D.
          </p>
          <PricingCards compact onSelectPlan={goToCheckout} />
        </div>
      </Modal>
    </div>
  )
}
