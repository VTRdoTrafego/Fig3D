import { hasSupabaseEnv, supabase } from '../lib/supabase'

const BUCKETS = {
  logos: 'logos',
  thumbs: 'thumbs',
  exports: 'exports',
}

function assertSupabase() {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

function makePath(userId: string, projectId: string, filename: string) {
  return `${userId}/${projectId}/${Date.now()}-${filename}`
}

export async function uploadLogo(file: File, userId: string, projectId: string) {
  if (!hasSupabaseEnv || !supabase) {
    return URL.createObjectURL(file)
  }
  const client = assertSupabase()
  const filePath = makePath(userId, projectId, file.name)
  const { error } = await client.storage.from(BUCKETS.logos).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return filePath
}

export async function uploadBlob(
  blob: Blob,
  userId: string,
  projectId: string,
  filename: string,
  bucket: keyof typeof BUCKETS,
) {
  if (!hasSupabaseEnv || !supabase) {
    return URL.createObjectURL(blob)
  }
  const client = assertSupabase()
  const filePath = makePath(userId, projectId, filename)
  const { error } = await client.storage.from(BUCKETS[bucket]).upload(filePath, blob, {
    cacheControl: '3600',
    contentType: blob.type,
    upsert: false,
  })
  if (error) throw error
  return filePath
}

export function getPublicUrl(path: string, bucket: keyof typeof BUCKETS) {
  if (!hasSupabaseEnv || !supabase) {
    return path
  }
  const client = assertSupabase()
  return client.storage.from(BUCKETS[bucket]).getPublicUrl(path).data.publicUrl
}
