import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { ROBOT_ARM_PARTS } from '@/viewer/objects/RobotArm/parts'
import { ROBOT_ARM_EXPLODE_MAP } from '@/viewer/objects/RobotArm/explodeMap'

export default function ViewerCanvas({ explode = 0 }: { explode?: number }) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const partsRef = useRef<Record<string, THREE.Object3D>>({})

  useEffect(() => {
    if (!mountRef.current) return

    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020617)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.set(2, 2, 4)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 10, 7)
    scene.add(light)

    const loader = new GLTFLoader()

    ROBOT_ARM_PARTS.forEach((part) => {
      loader.load(
        part.path,
        (gltf) => {
          const obj = gltf.scene
          obj.position.set(0, 0, 0)
          scene.add(obj)
          partsRef.current[part.id] = obj
        },
        undefined,
        (err) => {
          console.error(`Failed to load ${part.path}`, err)
        }
      )
    })

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      renderer.dispose()
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    Object.entries(partsRef.current).forEach(([id, obj]) => {
      const target = ROBOT_ARM_EXPLODE_MAP[id as keyof typeof ROBOT_ARM_EXPLODE_MAP]
      if (!target) return

      obj.position.set(
        target.x * explode,
        target.y * explode,
        target.z * explode
      )
    })
  }, [explode])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
