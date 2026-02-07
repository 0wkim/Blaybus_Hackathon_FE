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
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import type { ModelDef } from '@/viewer/types'

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
    transformControls: TransformControls
    rafId: number
  } | null>(null)

  /** ================== 데이터 및 상태 관리 ================== */
  const partsRef = useRef<Record<string, {
    root: THREE.Group
    assembled: THREE.Vector3
    exploded: THREE.Vector3
    isAdded: boolean
  }>>({})

  const pickablesRef = useRef<THREE.Object3D[]>([])
  const materialSnapshot = useMemo(() => new WeakMap<THREE.Material, any>(), [])

  // 시뮬레이션 관련 Refs
  const simFromRef = useRef<Record<string, THREE.Vector3>>({})
  const simToRef = useRef<Record<string, THREE.Vector3>>({})
  const explodeRef = useRef(0)
  const draggingRef = useRef(false)
  const lastYRef = useRef(0)

  useImperativeHandle(ref, () => ({
    zoomIn() {
      if (!refs.current) return
      const dir = new THREE.Vector3()
      refs.current.camera.getWorldDirection(dir)
      refs.current.camera.position.addScaledVector(dir, 0.25)
      refs.current.controls.update()
    },
    zoomOut() {
      if (!refs.current) return
      const dir = new THREE.Vector3()
      refs.current.camera.getWorldDirection(dir)
      refs.current.camera.position.addScaledVector(dir, -0.25)
      refs.current.controls.update()
    },
    resetCamera() {
      if (!refs.current) return
      const { camera, controls, transformControls } = refs.current
      camera.position.set(1.0, 0.8, 1.2)
      controls.target.set(0, 0.4, 0)
      controls.update()
      transformControls.detach()
      onSelectPart(null)

      // 시뮬레이터 상태도 초기화
      explodeRef.current = 0
      Object.entries(partsRef.current).forEach(([id, p]) => {
        p.root.position.copy(p.assembled)
        if(simFromRef.current[id]) simFromRef.current[id].copy(p.assembled)
        if(simToRef.current[id]) simToRef.current[id].copy(p.exploded)
      })
    },
    getCameraState() {
      if (!refs.current) return undefined
      const { camera, controls } = refs.current
      return {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [controls.target.x, controls.target.y, controls.target.z],
      }
    },
  }))

  /* ================= 단일 부품 전용 유틸리티 ================= */
  const framePart = (root: THREE.Object3D) => {
    if (!refs.current) return
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = refs.current.camera.fov * (Math.PI / 180)
    const distance = maxDim / (2 * Math.tan(fov / 2))

    refs.current.camera.position.set(center.x + distance, center.y + distance, center.z + distance * 2)
    refs.current.controls.target.copy(center)
    refs.current.controls.update()
  }

  const animateAppear = (root: THREE.Object3D) => {
    root.scale.setScalar(0.85)
    root.traverse((obj: any) => {
      if (!obj.isMesh) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((m: any) => {
        m.transparent = true
        m.opacity = 0
      })
    })

    let t = 0
    const animate = () => {
      t += 0.05
      const eased = THREE.MathUtils.smoothstep(t, 0, 1)
      root.scale.setScalar(0.85 + eased * 0.15)
      root.traverse((obj: any) => {
        if (!obj.isMesh) return
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m: any) => {
          const snap = materialSnapshot.get(m)
          if (snap) m.opacity = eased * snap.opacity
        })
      })
      if (t < 1) requestAnimationFrame(animate)
    }
    animate()
  }

  // 1. resize 감지 useEffect 추가
  useEffect(() => {
    if (!mountRef.current || !refs.current) return;

    const handleResize = () => {
      if (!mountRef.current || !refs.current) return;
      const { camera, renderer } = refs.current;

      // 부모 div의 실제 너비와 높이를 다시 잽니다.
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      // 캔버스 크기 강제 업데이트
      renderer.setSize(width, height);
      
      // 카메라 비율 재설정
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    // ResizeObserver를 통해 mountRef 요소의 크기 변화를 실시간 감시
    const ro = new ResizeObserver(() => {
      // 레이아웃이 완전히 변한 뒤 측정하기 위해 requestAnimationFrame 사용
      requestAnimationFrame(handleResize);
    });

    ro.observe(mountRef.current);
    
    // 버튼 클릭 직후에도 즉시 한 번 실행
    handleResize();

    return () => ro.disconnect();
  }, [isExpanded]);

  /* ================= Scene & Interaction Setup ================= */
  useLayoutEffect(() => {
    if (!mountRef.current) return
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(...(initialCameraState?.position ?? [1, 0.8, 1.2]))

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(...(initialCameraState?.target ?? [0, 0.4, 0]))

    const transformControls = new TransformControls(camera, renderer.domElement)
    scene.add(transformControls)
    transformControls.addEventListener('dragging-changed', (e) => {
      controls.enabled = !e.value
    })

    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const dir = new THREE.DirectionalLight(0xffffff, 1)
    dir.position.set(5, 10, 7.5)
    scene.add(dir)
    scene.add(new THREE.GridHelper(10, 10, 0x334155, 0x1e293b))

    refs.current = { scene, camera, renderer, controls, transformControls, rafId: 0 }

    const loader = new GLTFLoader()
    model.parts.forEach((p) => {
      loader.load(p.path, (gltf: GLTF) => {
        const root = gltf.scene
        const wrapper = new THREE.Group()
        if (p.rotation) root.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z)
        wrapper.add(root)
        wrapper.position.set(p.assembled.x, p.assembled.y, p.assembled.z)

        root.traverse((obj: any) => {
          if (!obj.isMesh) return
          obj.userData.partId = p.id
          pickablesRef.current.push(obj)
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m: any) => {
            if (!materialSnapshot.has(m)) {
              materialSnapshot.set(m, {
                transparent: m.transparent,
                opacity: m.opacity,
                emissive: m.emissive?.clone() || new THREE.Color(0, 0, 0),
              })
            }
          })
        })

        const assembled = new THREE.Vector3(p.assembled.x, p.assembled.y, p.assembled.z)
        const exploded = new THREE.Vector3(p.exploded.x, p.exploded.y, p.exploded.z)

        partsRef.current[p.id] = { root: wrapper, assembled, exploded, isAdded: false }
        simFromRef.current[p.id] = assembled.clone()
        simToRef.current[p.id] = exploded.clone()

        // 초기 모드가 'single'이 아니면 씬에 추가
        if (mode !== 'single') {
          scene.add(wrapper)
          partsRef.current[p.id].isAdded = true
        }
      })
    })

    // Interaction Events (시뮬레이터 드래그)
    const onPointerDown = (e: PointerEvent) => {
      if (mode !== 'simulator' || !e.shiftKey) return
      draggingRef.current = true
      lastYRef.current = e.clientY
      controls.enabled = false
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      const dy = lastYRef.current - e.clientY
      lastYRef.current = e.clientY
      explodeRef.current = THREE.MathUtils.clamp(explodeRef.current + dy * 0.005, 0, 1)

      Object.entries(partsRef.current).forEach(([id, p]) => {
        p.root.position.lerpVectors(simFromRef.current[id], simToRef.current[id], explodeRef.current)
      })
    }

    const onPointerUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      controls.enabled = true
      const shouldExplode = explodeRef.current > 0.5
      explodeRef.current = shouldExplode ? 1 : 0

      Object.entries(partsRef.current).forEach(([id, p]) => {
        const finalPos = shouldExplode ? simToRef.current[id] : simFromRef.current[id]
        p.root.position.copy(finalPos)
        simFromRef.current[id].copy(finalPos)
        simToRef.current[id].copy(shouldExplode ? p.assembled : p.exploded)
      })
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    const tick = () => {
      if (!refs.current) return
      refs.current.rafId = requestAnimationFrame(tick)
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(refs.current?.rafId || 0)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      renderer.dispose()
      scene.clear()
      mountRef.current?.removeChild(renderer.domElement)
      refs.current = null
    }
  }, [model.id, mode]) // mode가 바뀔 때 시뮬레이터 이벤트 리셋을 위해 포함

  /* ================= 단일 부품 가시성 제어 Effect ================= */
  useEffect(() => {
    if (!refs.current) return
    const { scene, transformControls } = refs.current

    Object.entries(partsRef.current).forEach(([id, p]) => {
      if (mode === 'single') {
        const isTarget = selectedPartId === id
        if (isTarget && !p.isAdded) {
          scene.add(p.root)
          p.isAdded = true
          p.root.position.set(0, 0, 0) // 중앙 정렬
          animateAppear(p.root)
          framePart(p.root)
          transformControls.detach()
        } else if (!isTarget && p.isAdded) {
          scene.remove(p.root)
          p.isAdded = false
        }
      } else {
        // 일반 모드에서는 모든 부품이 존재해야 함
        if (!p.isAdded) {
          scene.add(p.root)
          p.isAdded = true
          p.root.position.copy(p.assembled)
        }
      }
    })
  }, [selectedPartId, mode])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
})

ViewerCanvas.displayName = 'ViewerCanvas'
export default ViewerCanvas