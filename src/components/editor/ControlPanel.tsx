import { CircleControls } from './controls/CircleControls'
import type { ControlCategory } from './controls/CircleControls'

interface Props {
  onUpload: (file: File) => Promise<void>
  category?: ControlCategory
  contextual?: boolean
}

export function ControlPanel({ onUpload, category, contextual }: Props) {
  return <CircleControls onUpload={onUpload} category={category} contextual={contextual} />
}
