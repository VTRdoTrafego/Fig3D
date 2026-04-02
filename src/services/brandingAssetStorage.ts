const DB_NAME = 'fig3d-branding-assets'
const STORE_NAME = 'assets'
const ASSET_REF_PREFIX = 'idb://branding-asset/'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Falha ao abrir IndexedDB.'))
  })
}

export function isStoredBrandingAssetRef(value: string | null | undefined) {
  return typeof value === 'string' && value.startsWith(ASSET_REF_PREFIX)
}

export async function saveBrandingAsset(file: Blob) {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(file, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Falha ao salvar asset.'))
    tx.onabort = () => reject(tx.error ?? new Error('Falha ao salvar asset.'))
  })
  db.close()
  return `${ASSET_REF_PREFIX}${id}`
}

export async function loadBrandingAsset(ref: string) {
  if (!isStoredBrandingAssetRef(ref)) return null
  const id = ref.slice(ASSET_REF_PREFIX.length)
  if (!id) return null

  const db = await openDb()
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(id)
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null)
    request.onerror = () => reject(request.error ?? new Error('Falha ao ler asset.'))
  })
  db.close()
  return blob
}
