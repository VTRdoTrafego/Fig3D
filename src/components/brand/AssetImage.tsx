import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { isStoredBrandingAssetRef, loadBrandingAsset } from '../../services/brandingAssetStorage'

interface AssetImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  assetRef: string | null | undefined
}

export function AssetImage({ assetRef, alt = '', ...props }: AssetImageProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string>('')

  useEffect(() => {
    let active = true
    let objectUrl = ''

    async function resolveAsset() {
      if (!assetRef) {
        setResolvedUrl('')
        return
      }
      if (!isStoredBrandingAssetRef(assetRef)) {
        setResolvedUrl(assetRef)
        return
      }

      try {
        const blob = await loadBrandingAsset(assetRef)
        if (!active || !blob) {
          setResolvedUrl('')
          return
        }
        objectUrl = URL.createObjectURL(blob)
        setResolvedUrl(objectUrl)
      } catch {
        if (active) {
          setResolvedUrl('')
        }
      }
    }

    void resolveAsset()

    return () => {
      active = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [assetRef])

  if (!resolvedUrl) return null
  return <img src={resolvedUrl} alt={alt} {...props} />
}
