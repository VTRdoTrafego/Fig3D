import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, PlayCircle, Shapes, Sparkles, Stars, SwatchBook } from 'lucide-react'
import { modelPresets } from '../../../constants/models'
import { stylePresets, useEditorStore } from '../../../store/editorStore'
import { cn } from '../../../lib/utils'
import { Field } from '../../ui/Field'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

interface Props {
  onUpload: (file: File) => Promise<void>
  category?: ControlCategory
  contextual?: boolean
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[rgba(255,255,255,0.14)]"
    />
  )
}

type ModelFilter = 'all' | 'circle' | 'coin' | 'shape'
export type ControlCategory = 'all' | 'circle' | 'logo' | 'special' | 'play'

interface SectionCardProps {
  id: string
  title: string
  subtitle: string
  icon: ComponentType<{ size?: number }>
  open: boolean
  highlighted?: boolean
  onToggle: (id: string) => void
  children: ReactNode
}

function SectionCard({
  id,
  title,
  subtitle,
  icon: Icon,
  open,
  highlighted = false,
  onToggle,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border bg-[rgba(255,255,255,0.02)] p-3 transition-colors',
        highlighted
          ? 'border-[rgba(245,196,0,0.36)] shadow-[0_10px_30px_rgba(245,196,0,0.08)]'
          : 'border-[var(--border-soft)]',
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-left transition hover:bg-[rgba(255,255,255,0.04)]"
        onClick={() => onToggle(id)}
      >
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            <Icon size={13} />
            {title}
          </p>
          <p className="truncate text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-[var(--text-muted)]" />
        ) : (
          <ChevronDown size={16} className="text-[var(--text-muted)]" />
        )}
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-out',
          open ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  )
}

export function CircleControls({ onUpload, category = 'all', contextual = false }: Props) {
  const { config, setConfig, applyPreset } = useEditorStore()
  const isPlaying = config.animation.autoRotate
  const isRgbModel = config.modelType.includes('rgb')
  const [modelPickerOpen, setModelPickerOpen] = useState(false)
  const [modelFilter, setModelFilter] = useState<ModelFilter>('all')
  const [openSections, setOpenSections] = useState<string[]>([])
  const activeModelName = useMemo(
    () => modelPresets.find((model) => model.id === config.modelType)?.name ?? 'Selecionar estilo',
    [config.modelType],
  )
  const selectClassName =
    'h-11 rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] px-3 text-sm text-[var(--text-primary)]'

  const visibleSectionIds = useMemo(() => {
    if (!contextual || category === 'all') {
      return ['models', 'logo', 'shape', 'surface', 'border', 'lighting', 'scene', 'special', 'animation']
    }
    if (category === 'circle') {
      return ['models', 'shape', 'surface', 'border', 'lighting', 'scene']
    }
    if (category === 'logo') {
      return ['models', 'logo', 'surface']
    }
    if (category === 'special') {
      return ['models', 'special', 'scene']
    }
    return ['animation', 'scene']
  }, [category, contextual])

  useEffect(() => {
    if (!contextual) {
      setOpenSections(['models', 'logo', 'shape', 'surface', 'border', 'lighting', 'scene', 'special', 'animation'])
      return
    }
    if (category === 'logo') {
      setOpenSections(['logo', 'models'])
      return
    }
    if (category === 'circle') {
      setOpenSections(['models', 'shape'])
      return
    }
    if (category === 'special') {
      setOpenSections(['special', 'models'])
      return
    }
    if (category === 'play') {
      setOpenSections(['animation'])
      return
    }
    setOpenSections(['models'])
  }, [category, contextual, isRgbModel])

  const modelFilters: Array<{ id: ModelFilter; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: 'circle', label: 'Círculo' },
    { id: 'coin', label: 'Coin' },
    { id: 'shape', label: 'Forma' },
  ]

  const filteredModels = useMemo(
    () =>
      modelPresets.filter((model) => {
        if (modelFilter === 'all') return true
        if (modelFilter === 'circle') return model.id.startsWith('circle')
        if (modelFilter === 'coin') return model.id.startsWith('coin')
        return !model.id.startsWith('circle') && !model.id.startsWith('coin')
      }),
    [modelFilter],
  )

  const toggleSection = (sectionId: string) => {
    setOpenSections((current) =>
      current.includes(sectionId) ? current.filter((id) => id !== sectionId) : [...current, sectionId],
    )
  }

  const sectionOpen = (sectionId: string) => openSections.includes(sectionId)
  const sectionVisible = (sectionId: string) => visibleSectionIds.includes(sectionId)

  return (
    <div className="space-y-4 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
      {sectionVisible('models') ? (
        <SectionCard
          id="models"
          title="Biblioteca"
          subtitle="Escolha o modelo base para editar"
          icon={Shapes}
          open={sectionOpen('models')}
          highlighted={category === 'circle' || category === 'all'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setModelPickerOpen((current) => !current)}
              className="flex w-full items-center justify-between rounded-2xl border border-[rgba(139,92,255,0.38)] bg-[rgba(109,75,255,0.16)] px-3 py-2.5 text-left transition hover:bg-[rgba(109,75,255,0.24)]"
            >
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-violet-200">
                  <Sparkles size={12} />
                  Modelos
                </p>
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{activeModelName}</p>
              </div>
              {modelPickerOpen ? (
                <ChevronUp size={16} className="text-violet-200" />
              ) : (
                <ChevronDown size={16} className="text-violet-200" />
              )}
            </button>

            <div
              className={cn(
                'grid transition-all duration-200 ease-out',
                modelPickerOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-2 rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] p-2">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {modelFilters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        className={cn(
                          'shrink-0 rounded-full border px-3 py-1 text-xs transition',
                          modelFilter === filter.id
                            ? 'border-[rgba(245,196,0,0.45)] bg-[rgba(245,196,0,0.15)] text-[var(--accent-yellow)]'
                            : 'border-[var(--border-soft)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)]',
                        )}
                        onClick={() => setModelFilter(filter.id)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {filteredModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        className={cn(
                          'w-full rounded-xl border px-3 py-2 text-left transition',
                          config.modelType === model.id
                            ? 'border-[rgba(245,196,0,0.45)] bg-[rgba(245,196,0,0.15)]'
                            : 'border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)]',
                        )}
                        onClick={() => {
                          const isForma = model.id.includes('forma')
                          if (isForma && config.logo.mode === 'badge-hybrid') {
                            setConfig({
                              modelType: model.id,
                              logo: { mode: 'embossed' },
                            })
                          } else {
                            setConfig({ modelType: model.id })
                          }
                          setModelPickerOpen(false)
                        }}
                      >
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{model.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{model.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {sectionVisible('logo') ? (
        <SectionCard
          id="logo"
          title="Logo"
          subtitle="Upload e ajustes finos da marca"
          icon={SwatchBook}
          open={sectionOpen('logo')}
          highlighted={category === 'logo'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <Field label="Upload logo (PNG/JPG)">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,.svg"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void onUpload(file)
                }}
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Modo 3D da logo">
                <select
                  value={config.logo.mode}
                  onChange={(e) => setConfig({ logo: { mode: e.target.value as typeof config.logo.mode } })}
                  className={selectClassName}
                >
                  <option value="badge-hybrid">Badge Hybrid</option>
                  <option value="embossed">Embossed</option>
                  <option value="engraved">Engraved</option>
                </select>
              </Field>
              <Field label="Cor da marca">
                <span className="inline-flex h-11 items-center rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] px-3 text-sm text-[var(--text-secondary)]">
                  Brand Original (fixo)
                </span>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Fit mode">
                <select
                  value={config.logo.fitMode}
                  onChange={(e) => setConfig({ logo: { fitMode: e.target.value as typeof config.logo.fitMode } })}
                  className={selectClassName}
                >
                  <option value="contain">contain</option>
                  <option value="cover">cover</option>
                  <option value="stretch">stretch</option>
                </select>
              </Field>
              <Field label="Margem segura" hint={config.logo.safeMargin.toFixed(2)}>
                <Slider
                  value={config.logo.safeMargin}
                  min={0}
                  max={0.25}
                  step={0.01}
                  onChange={(safeMargin) => setConfig({ logo: { safeMargin } })}
                />
              </Field>
            </div>

            <Field label="Escala logo" hint={config.logo.scale.toFixed(2)}>
              <Slider
                value={config.logo.scale}
                min={0.2}
                max={2.4}
                step={0.01}
                onChange={(scale) => setConfig({ logo: { scale } })}
              />
            </Field>
            <Field label="Logo X" hint={config.logo.x.toFixed(2)}>
              <Slider value={config.logo.x} min={-1} max={1} step={0.01} onChange={(x) => setConfig({ logo: { x } })} />
            </Field>
            <Field label="Logo Y" hint={config.logo.y.toFixed(2)}>
              <Slider value={config.logo.y} min={-1} max={1} step={0.01} onChange={(y) => setConfig({ logo: { y } })} />
            </Field>
            <Field label="Opacidade logo" hint={config.logo.opacity.toFixed(2)}>
              <Slider
                value={config.logo.opacity}
                min={0.05}
                max={1}
                step={0.01}
                onChange={(opacity) => setConfig({ logo: { opacity } })}
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Perfil lateral">
                <select
                  value={config.logo.materialType}
                  onChange={(e) =>
                    setConfig({ logo: { materialType: e.target.value as typeof config.logo.materialType } })
                  }
                  className={selectClassName}
                >
                  <option value="matte">Fosco</option>
                  <option value="metallic">Metálico</option>
                  <option value="glossy">Glossy</option>
                </select>
              </Field>
              <Field label="Profundidade logo" hint={config.logo.depth.toFixed(2)}>
                <Slider
                  value={config.logo.depth}
                  min={0.02}
                  max={0.4}
                  step={0.01}
                  onChange={(depth) => setConfig({ logo: { depth } })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Bevel size" hint={config.logo.bevelSize.toFixed(2)}>
                <Slider
                  value={config.logo.bevelSize}
                  min={0}
                  max={0.06}
                  step={0.002}
                  onChange={(bevelSize) => setConfig({ logo: { bevelSize } })}
                />
              </Field>
              <Field label="Bevel segments" hint={config.logo.bevelSegments.toFixed(0)}>
                <Slider
                  value={config.logo.bevelSegments}
                  min={0}
                  max={8}
                  step={1}
                  onChange={(bevelSegments) => setConfig({ logo: { bevelSegments } })}
                />
              </Field>
            </div>

            <Button variant="ghost" className="w-full" onClick={() => setConfig({ logo: { path: null } })}>
              Limpar logo
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {sectionVisible('shape') ? (
        <SectionCard
          id="shape"
          title="Forma e profundidade"
          subtitle="Dimensões, volume e inclinação do modelo"
          icon={Shapes}
          open={sectionOpen('shape')}
          highlighted={category === 'circle'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Raio modelo" hint={config.model.radius.toFixed(2)}>
                <Slider
                  value={config.model.radius}
                  min={0.7}
                  max={1.8}
                  step={0.01}
                  onChange={(radius) => setConfig({ model: { radius } })}
                />
              </Field>
              <Field label="Profundidade" hint={config.model.depth.toFixed(2)}>
                <Slider
                  value={config.model.depth}
                  min={0.08}
                  max={0.8}
                  step={0.01}
                  onChange={(depth) => setConfig({ model: { depth } })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Inclinação X" hint={`${config.model.tiltX.toFixed(0)}º`}>
                <Slider
                  value={config.model.tiltX}
                  min={-35}
                  max={35}
                  step={1}
                  onChange={(tiltX) => setConfig({ model: { tiltX } })}
                />
              </Field>
              <Field label="Inclinação Z" hint={`${config.model.tiltZ.toFixed(0)}º`}>
                <Slider
                  value={config.model.tiltZ}
                  min={-35}
                  max={35}
                  step={1}
                  onChange={(tiltZ) => setConfig({ model: { tiltZ } })}
                />
              </Field>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {sectionVisible('surface') ? (
        <SectionCard
          id="surface"
          title="Cores"
          subtitle="Cores principais e acabamento premium"
          icon={SwatchBook}
          open={sectionOpen('surface')}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Face">
                <Input type="color" value={config.face.color} onChange={(e) => setConfig({ face: { color: e.target.value } })} />
              </Field>
              <Field label="Luz">
                <Input type="color" value={config.lighting.color} onChange={(e) => setConfig({ lighting: { color: e.target.value } })} />
              </Field>
            </div>

            <Field label="Material da face">
              <select
                value={config.face.materialType}
                onChange={(e) => setConfig({ face: { materialType: e.target.value as typeof config.face.materialType } })}
                className={selectClassName}
              >
                <option value="matte">Fosco</option>
                <option value="metallic">Metálico</option>
                <option value="glossy">Glossy</option>
              </select>
            </Field>

            <Field label="Brilho face" hint={config.face.shine.toFixed(2)}>
              <Slider value={config.face.shine} min={0.1} max={1} step={0.01} onChange={(shine) => setConfig({ face: { shine } })} />
            </Field>
          </div>
        </SectionCard>
      ) : null}

      {sectionVisible('border') ? (
        <SectionCard
          id="border"
          title="Borda"
          subtitle="Ativação, cor e material lateral"
          icon={SwatchBook}
          open={sectionOpen('border')}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Ativar">
                <input
                  type="checkbox"
                  checked={config.border.enabled}
                  onChange={(e) => setConfig({ border: { enabled: e.target.checked } })}
                  className="h-4 w-4"
                />
              </Field>
              <Field label="Cor">
                <Input type="color" value={config.border.color} onChange={(e) => setConfig({ border: { color: e.target.value } })} />
              </Field>
            </div>
            <Field label="Largura" hint={config.border.width.toFixed(2)}>
              <Slider value={config.border.width} min={0.01} max={0.22} step={0.005} onChange={(width) => setConfig({ border: { width } })} />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Metalness" hint={config.border.metalness.toFixed(2)}>
                <Slider
                  value={config.border.metalness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(metalness) => setConfig({ border: { metalness } })}
                />
              </Field>
              <Field label="Roughness" hint={config.border.roughness.toFixed(2)}>
                <Slider
                  value={config.border.roughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(roughness) => setConfig({ border: { roughness } })}
                />
              </Field>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {sectionVisible('lighting') ? (
        <SectionCard
          id="lighting"
          title="Iluminação"
          subtitle="Balanceamento de luz da cena"
          icon={Sparkles}
          open={sectionOpen('lighting')}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Luz principal" hint={config.lighting.keyIntensity.toFixed(2)}>
                <Slider
                  value={config.lighting.keyIntensity}
                  min={0.1}
                  max={2.8}
                  step={0.05}
                  onChange={(keyIntensity) => setConfig({ lighting: { keyIntensity } })}
                />
              </Field>
              <Field label="Luz preenchimento" hint={config.lighting.fillIntensity.toFixed(2)}>
                <Slider
                  value={config.lighting.fillIntensity}
                  min={0.05}
                  max={2}
                  step={0.05}
                  onChange={(fillIntensity) => setConfig({ lighting: { fillIntensity } })}
                />
              </Field>
              <Field label="Rim light" hint={config.lighting.rimIntensity.toFixed(2)}>
                <Slider
                  value={config.lighting.rimIntensity}
                  min={0.05}
                  max={2}
                  step={0.05}
                  onChange={(rimIntensity) => setConfig({ lighting: { rimIntensity } })}
                />
              </Field>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {sectionVisible('scene') ? (
        <SectionCard
          id="scene"
          title="Cena e iluminação de fundo"
          subtitle="Fundo, contraste e transparência do preview"
          icon={SwatchBook}
          open={sectionOpen('scene')}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Cor de fundo cena">
                <Input
                  type="color"
                  value={config.scene.backgroundColor}
                  onChange={(e) => setConfig({ scene: { backgroundColor: e.target.value } })}
                />
              </Field>
              <Field label="Preview transparente">
                <input
                  type="checkbox"
                  checked={config.scene.transparentPreview}
                  onChange={(e) => setConfig({ scene: { transparentPreview: e.target.checked } })}
                  className="h-4 w-4"
                />
              </Field>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {sectionVisible('special') ? (
        <SectionCard
          id="special"
          title="Especial"
          subtitle="Presets e efeitos RGB"
          icon={Stars}
          open={sectionOpen('special')}
          highlighted={category === 'special'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Presets</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(stylePresets).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[rgba(139,92,255,0.55)] hover:text-violet-200"
                    onClick={() => applyPreset(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {isRgbModel ? (
              <div className="rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-3">
                <p className="text-xs uppercase tracking-wide text-cyan-300">RGB Especial</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Modo RGB">
                    <select
                      value={config.scene.rgbMode}
                      onChange={(e) => setConfig({ scene: { rgbMode: e.target.value as typeof config.scene.rgbMode } })}
                      className={selectClassName}
                    >
                      <option value="pulse">Pulsando</option>
                      <option value="fire">Fogo</option>
                      <option value="rgb-l">RGB L</option>
                      <option value="led-argb">LED ARGB</option>
                      <option value="border-circular">Circular Borda</option>
                      <option value="border-animated">Borda Animada</option>
                    </select>
                  </Field>
                  <Field label="Velocidade RGB" hint={config.scene.rgbSpeed.toFixed(2)}>
                    <Slider
                      value={config.scene.rgbSpeed}
                      min={0.2}
                      max={3}
                      step={0.05}
                      onChange={(rgbSpeed) => setConfig({ scene: { rgbSpeed } })}
                    />
                  </Field>
                </div>
                <Field label="Intensidade RGB" hint={config.scene.rgbIntensity.toFixed(2)}>
                  <Slider
                    value={config.scene.rgbIntensity}
                    min={0.2}
                    max={2.4}
                    step={0.05}
                    onChange={(rgbIntensity) => setConfig({ scene: { rgbIntensity } })}
                  />
                </Field>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                Selecione um modelo RGB na biblioteca para liberar controles de animação especial.
              </p>
            )}
          </div>
        </SectionCard>
      ) : null}

      {sectionVisible('animation') ? (
        <SectionCard
          id="animation"
          title="Movimento"
          subtitle="Velocidade e sentido de rotação"
          icon={PlayCircle}
          open={sectionOpen('animation')}
          highlighted={category === 'play'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <Button variant="secondary" onClick={() => setConfig({ animation: { autoRotate: !isPlaying } })}>
              {isPlaying ? 'Pausar rotação' : 'Play rotação'}
            </Button>

            <Field label="Velocidade rotação" hint={config.animation.speed.toFixed(2)}>
              <Slider
                value={config.animation.speed}
                min={0}
                max={2}
                step={0.05}
                onChange={(speed) => setConfig({ animation: { speed } })}
              />
            </Field>

            <Field label="Sentido rotação">
              <select
                value={config.animation.direction}
                onChange={(e) =>
                  setConfig({
                    animation: { direction: e.target.value as typeof config.animation.direction },
                  })
                }
                className={selectClassName}
              >
                <option value="clockwise">Horário</option>
                <option value="counterclockwise">Anti-horário</option>
              </select>
            </Field>
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}
