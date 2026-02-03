import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import type { ModelDef } from '@/viewer/types'

type Props = {
  model: ModelDef
  explode: number // 0~1
  ghost: boolean
  selectedPartId: string | null
  onSelectPart: (partId: string | null) => void
}

type PartRuntime = {
  root: THREE.Object3D
  assembled: THREE.Vector3
  exploded: THREE.Vector3
}

export default function ViewerCanvas({
  model,
  explode,
  ghost,
  selectedPartId,
  onSelectPart,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)

  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)

  const raycasterRef = useRef(new THREE.Raycaster())
  const pointerRef = useRef(new THREE.Vector2())

  const partsRef = useRef<Record<string, PartRuntime>>({})
  const pickablesRef = useRef<THREE.Object3D[]>([])

  // material 원복용 저장소
  const materialSnapshot = useMemo(
    () =>
      new WeakMap<
        THREE.Material,
        { transparent: boolean; opacity: number; emissive?: THREE.Color }
      >(),
    []
  )

  // 1) Three 초기화 + 모델 로딩
  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020617)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      55,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      200
    )
    camera.position.set(2.2, 1.8, 4.2)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 조명/가이드
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const dir = new THREE.DirectionalLight(0xffffff, 1.0)
    dir.position.set(4, 8, 5)
    scene.add(dir)

    const grid = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b)
    scene.add(grid)

    // OrbitControls (마우스: 좌-회전 / 휠-줌 / 우-팬)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.screenSpacePanning = true
    controlsRef.current = controls

    // 로더
    const loader = new GLTFLoader()
    partsRef.current = {}
    pickablesRef.current = []

    let cancelled = false

    model.parts.forEach((p) => {
      loader.load(
        p.path,
        (gltf) => {
          if (cancelled) return

          const root = gltf.scene
          root.name = p.id

          // 클릭 선택을 위해 mesh들에 partId 주입
          root.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              obj.userData.partId = p.id
              pickablesRef.current.push(obj)

              const mesh = obj as THREE.Mesh
              const mat = mesh.material
              if (Array.isArray(mat)) {
                mat.forEach((m) => snapshotMaterial(m))
              } else if (mat) {
                snapshotMaterial(mat)
              }
            }
          })

          // assembled 위치 적용
          root.position.set(p.assembled.x, p.assembled.y, p.assembled.z)
          scene.add(root)

          partsRef.current[p.id] = {
            root,
            assembled: new THREE.Vector3(p.assembled.x, p.assembled.y, p.assembled.z),
            exploded: new THREE.Vector3(p.exploded.x, p.exploded.y, p.exploded.z),
          }
        },
        undefined,
        (err) => {
          console.error(`[GLB LOAD FAIL] ${p.id} -> ${p.path}`, err)
        }
      )
    })

    function snapshotMaterial(mat: THREE.Material) {
      if (materialSnapshot.has(mat)) return
      const anyMat = mat as any
      materialSnapshot.set(mat, {
        transparent: mat.transparent,
        opacity: mat.opacity,
        emissive: anyMat.emissive ? anyMat.emissive.clone() : undefined,
      })
    }

    // 클릭(선택)
    const onPointerDown = (e: PointerEvent) => {
      const dom = renderer.domElement
      const rect = dom.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

      pointerRef.current.set(x, y)

      const raycaster = raycasterRef.current
      raycaster.setFromCamera(pointerRef.current, camera)

      const hits = raycaster.intersectObjects(pickablesRef.current, true)
      if (hits.length === 0) {
        onSelectPart(null)
        return
      }

      const hit = hits[0].object
      const partId = hit.userData.partId as string | undefined
      onSelectPart(partId ?? null)
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    // 리사이즈
    const ro = new ResizeObserver(() => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(mountRef.current)

    // 렌더 루프
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      controls.dispose()
      renderer.dispose()
      mountRef.current?.removeChild(renderer.domElement)
      scene.clear()
      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      controlsRef.current = null
    }
  }, [model, materialSnapshot, onSelectPart])

  // 2) 분해/조립 적용 (explode 0~1)
  useEffect(() => {
    Object.values(partsRef.current).forEach((p) => {
      const pos = new THREE.Vector3().lerpVectors(p.assembled, p.exploded, explode)
      p.root.position.copy(pos)
    })
  }, [explode])

  // 3) 선택 하이라이트 + ghost mode 적용
  useEffect(() => {
    const selected = selectedPartId

    // 3-1) 우선 모든 material 원복
    Object.values(partsRef.current).forEach((p) => {
      p.root.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return
        const mesh = obj as THREE.Mesh
        applyMaterial(mesh, { reset: true, dim: false, highlight: false })
      })
    })

    // 3-2) ghost mode면, 선택 제외 dim
    if (ghost && selected) {
      Object.entries(partsRef.current).forEach(([id, p]) => {
        if (id === selected) return
        p.root.traverse((obj) => {
          if (!(obj as THREE.Mesh).isMesh) return
          applyMaterial(obj as THREE.Mesh, { reset: false, dim: true, highlight: false })
        })
      })
    }

    // 3-3) 선택된 파트 하이라이트
    if (selected && partsRef.current[selected]) {
      partsRef.current[selected].root.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return
        applyMaterial(obj as THREE.Mesh, { reset: false, dim: false, highlight: true })
      })
    }

    function applyMaterial(
      mesh: THREE.Mesh,
      opt: { reset: boolean; dim: boolean; highlight: boolean }
    ) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.filter(Boolean).forEach((mat) => {
        const snap = materialSnapshot.get(mat)
        if (snap && opt.reset) {
          mat.transparent = snap.transparent
          mat.opacity = snap.opacity
          const anyMat = mat as any
          if (anyMat.emissive && snap.emissive) anyMat.emissive.copy(snap.emissive)
          mat.needsUpdate = true
        }

        if (opt.dim) {
          mat.transparent = true
          mat.opacity = 0.15
          mat.needsUpdate = true
        }

        if (opt.highlight) {
          const anyMat = mat as any
          if (anyMat.emissive) {
            anyMat.emissive.setHex(0x2563eb)
            mat.needsUpdate = true
          }
        }
      })
    }
  }, [ghost, selectedPartId, materialSnapshot])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
