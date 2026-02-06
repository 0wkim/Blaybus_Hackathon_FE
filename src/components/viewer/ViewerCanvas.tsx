'use client'

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import type { ModelDef } from '@/viewer/types'

// [수정] 외부에서 호출 가능한 함수 타입 정의 (getCameraState 추가)
export type ViewerCanvasHandle = {
  zoomIn: () => void
  zoomOut: () => void
  resetCamera: () => void
  getCameraState: () => {
    position: [number, number, number]
    target: [number, number, number]
  } | undefined
}

const ViewerCanvas = forwardRef<
  ViewerCanvasHandle,
  {
    model: ModelDef
    ghost: boolean
    selectedPartId: string | null
    onSelectPart: (id: string | null) => void
    isExpanded: boolean
    mode: string
    // [수정] 초기 카메라 상태 Props 추가
    initialCameraState?: {
      position: [number, number, number]
      target: [number, number, number]
    }
  }
>(({ model, ghost, selectedPartId, onSelectPart, isExpanded, mode, initialCameraState }, ref) => {
  const mountRef = useRef<HTMLDivElement | null>(null)

  const refs = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls
    rafId: number
  } | null>(null)

  const partsRef = useRef<Record<string, any>>({})
  const pickablesRef = useRef<THREE.Object3D[]>([])

  const explodeRef = useRef(0)
  const draggingRef = useRef(false)
  const lastYRef = useRef(0)

  const materialSnapshot = useMemo(
    () => new WeakMap<THREE.Material, any>(),
    []
  )

  /* ================= Ref API ================= */
  useImperativeHandle(ref, () => ({
    zoomIn() {
      if (!refs.current) return
      const { camera, controls } = refs.current
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      camera.position.addScaledVector(dir, 0.25)
      controls.update()
    },

    zoomOut() {
      if (!refs.current) return
      const { camera, controls } = refs.current
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      camera.position.addScaledVector(dir, -0.25)
      controls.update()
    },

    resetCamera() {
      if (!refs.current) return
      const { camera, controls } = refs.current
      camera.position.set(2.0, 1.5, 2.2)
      controls.target.set(0, 0.6, 0)
      controls.update()
    },

    // [수정] 현재 카메라 상태 반환 구현
    getCameraState() {
      if (!refs.current) return undefined
      const { camera, controls } = refs.current
      return {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [controls.target.x, controls.target.y, controls.target.z],
      }
    },
  }))


  /* ================= Resize ================= */
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !refs.current) return
      const { camera, renderer } = refs.current
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      )
    }

    const ro = new ResizeObserver(handleResize)
    if (mountRef.current) ro.observe(mountRef.current)
    handleResize()

    return () => ro.disconnect()
  }, [isExpanded])

  /* ================= Three Init ================= */
  useLayoutEffect(() => {
    if (!mountRef.current) return

    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    
    // [수정] 초기 카메라 위치 설정 (저장된 값 or 기본값)
    if (initialCameraState) {
      camera.position.set(...initialCameraState.position)
    } else {
      camera.position.set(2.0, 1.5, 2.2)
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    
    // [수정] 초기 타겟 설정 (저장된 값 or 기본값)
    if (initialCameraState) {
      controls.target.set(...initialCameraState.target)
    } else {
      controls.target.set(0, 0.6, 0)
    }

    refs.current = { scene, camera, renderer, controls, rafId: 0 }

    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const dir = new THREE.DirectionalLight(0xffffff, 1)
    dir.position.set(5, 10, 7.5)
    scene.add(dir)
    scene.add(new THREE.GridHelper(10, 10, 0x334155, 0x1e293b))

    const loader = new GLTFLoader()
    model.parts.forEach((p) => {
      loader.load(p.path, (gltf: GLTF) => {
        const root = gltf.scene
        const wrapper = new THREE.Group()

        if (p.rotation)
          root.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z)

        wrapper.add(root)
        wrapper.position.set(p.assembled.x, p.assembled.y, p.assembled.z)
        scene.add(wrapper)

        root.traverse((obj: any) => {
          if (!obj.isMesh) return
          obj.userData.partId = p.id
          pickablesRef.current.push(obj)

          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material]

          mats.forEach((m: any) => {
            if (!materialSnapshot.has(m)) {
              materialSnapshot.set(m, {
                transparent: m.transparent,
                opacity: m.opacity,
                emissive: m.emissive?.clone(),
              })
            }
          })
        })

        partsRef.current[p.id] = {
          root: wrapper,
          assembled: new THREE.Vector3(
            p.assembled.x,
            p.assembled.y,
            p.assembled.z
          ),
          exploded: new THREE.Vector3(
            p.exploded.x,
            p.exploded.y,
            p.exploded.z
          ),
        }
      })
    })

    /* ===== Mouse ===== */
    const onPointerDown = (e: PointerEvent) => {
      if (mode === 'assembly') return
      if (e.shiftKey) {
        draggingRef.current = true
        lastYRef.current = e.clientY
        controls.enabled = false
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || mode === 'assembly') return
      explodeRef.current = THREE.MathUtils.clamp(
        explodeRef.current + (lastYRef.current - e.clientY) * 0.005,
        0,
        1
      )
      lastYRef.current = e.clientY
      Object.values(partsRef.current).forEach((p) =>
        p.root.position.lerpVectors(p.assembled, p.exploded, explodeRef.current)
      )
    }

    const onPointerUp = () => {
      draggingRef.current = false
      controls.enabled = true
    }

    const onClick = (e: MouseEvent) => {
      if (draggingRef.current || !refs.current) return
      const rect = renderer.domElement.getBoundingClientRect()
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(
        {
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
        },
        camera
      )
      const hits = raycaster.intersectObjects(pickablesRef.current, true)
      onSelectPart(hits.length ? hits[0].object.userData.partId : null)
    }

    const dom = renderer.domElement
    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    dom.addEventListener('click', onClick)

    const tick = () => {
      if (!refs.current) return
      refs.current.rafId = requestAnimationFrame(tick)
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(refs.current?.rafId || 0)
      dom.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      dom.removeEventListener('click', onClick)
      renderer.dispose()
      scene.clear()
      mountRef.current?.removeChild(dom)
      refs.current = null
    }
  }, [JSON.stringify(model), mode])

  /* ================= Ghost ================= */
  useEffect(() => {
    Object.entries(partsRef.current).forEach(([id, p]) => {
      p.root.traverse((obj: any) => {
        if (!obj.isMesh) return
        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material]
        mats.forEach((m: any) => {
          const snap = materialSnapshot.get(m)
          if (!snap) return
          const isGhostActive =
            mode !== 'assembly' && ghost && selectedPartId && id !== selectedPartId
          m.transparent = isGhostActive ? true : snap.transparent
          m.opacity = isGhostActive ? 0.15 : snap.opacity
          if (m.emissive)
            m.emissive.set(
              id === selectedPartId
                ? 0x38bdf8
                : snap.emissive || new THREE.Color(0, 0, 0)
            )
        })
      })
    })
  }, [ghost, selectedPartId, mode])

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    />
  )
})

ViewerCanvas.displayName = 'ViewerCanvas'
export default ViewerCanvas