import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { forwardRef, useEffect } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export const EditorCamera = forwardRef<OrbitControlsImpl>(function EditorCamera(_, ref) {
  const { camera } = useThree()
  const fixedDistance = 5.85

  useEffect(() => {
    camera.position.set(0, 0.1, fixedDistance)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, fixedDistance])

  return (
    <OrbitControls
      ref={ref}
      enablePan={false}
      enableZoom={false}
      enableRotate
      target={[0, 0, 0]}
      minDistance={fixedDistance}
      maxDistance={fixedDistance}
      maxPolarAngle={Math.PI * 0.7}
      minPolarAngle={Math.PI * 0.3}
      dampingFactor={0.08}
      enableDamping
    />
  )
})
