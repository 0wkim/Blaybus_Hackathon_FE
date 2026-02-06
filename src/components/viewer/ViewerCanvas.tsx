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

  const partsRef = useRef<Record<string, any>>({})
  const pickablesRef = useRef<THREE.Object3D[]>([])
  const explodeRef = useRef(0)
  const draggingRef = useRef(false)
  const lastYRef = useRef(0)
  const materialSnapshot = useMemo(() => new WeakMap<THREE.Material, any>(), [])

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
      const { camera, controls, transformControls } = refs.current
      camera.position.set(2.0, 1.5, 2.2)
      controls.target.set(0, 0.6, 0)
      controls.update()
      Object.values(partsRef.current).forEach((p) => {
        p.root.position.copy(p.assembled)
      })
      transformControls.detach()
      onSelectPart(null)
      explodeRef.current = 0
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

  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !refs.current) return
      const { camera, renderer } = refs.current
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    const ro = new ResizeObserver(handleResize)
    if (mountRef.current) ro.observe(mountRef.current)
    handleResize()
    return () => ro.disconnect()
  }, [isExpanded])

  useLayoutEffect(() => {
    if (!mountRef.current) return

    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const scene = new THREE.Scene()
    // 배경색을 확실하게 세팅 (흰색 방지)
    scene.background = new THREE.Color(0x0f172a)

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    if (initialCameraState) {
      camera.position.set(...initialCameraState.position)
    } else {
      camera.position.set(2.0, 1.5, 2.2)
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }) // alpha를 false로 해서 배경 투과 방지
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    if (initialCameraState) {
      controls.target.set(...initialCameraState.target)
    } else {
      controls.target.set(0, 0.6, 0)
    }

    const transformControls = new TransformControls(camera, renderer.domElement)
    transformControls.size = 0.8
    transformControls.setMode('translate')
    transformControls.setSpace('world')
    scene.add(transformControls)

    transformControls.addEventListener('dragging-changed', (e) => {
      controls.enabled = !e.value
    })

    refs.current = { scene, camera, renderer, controls, transformControls, rafId: 0 }

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
        if (p.rotation) root.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z)
        wrapper.add(root)
        wrapper.position.set(p.assembled.x, p.assembled.y, p.assembled.z)
        scene.add(wrapper)

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
                emissive: m.emissive?.clone() || new THREE.Color(0,0,0),
              })
            }
          })
        })

        partsRef.current[p.id] = {
          root: wrapper,
          assembled: new THREE.Vector3(p.assembled.x, p.assembled.y, p.assembled.z),
          exploded: new THREE.Vector3(p.exploded.x, p.exploded.y, p.exploded.z),
        }
      })
    })

    const onPointerDown = (e: PointerEvent) => {
      if (mode === 'edit') return
      if (e.shiftKey) {
        draggingRef.current = true
        lastYRef.current = e.clientY
        controls.enabled = false
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || mode !== 'simulator') return
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
      if (!transformControls.dragging) controls.enabled = true
    }

    const onClick = (e: MouseEvent) => {
      if (transformControls.dragging || draggingRef.current || !refs.current) return
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
      if (hits.length > 0) {
        onSelectPart(hits[0].object.userData.partId)
      } else {
        onSelectPart(null)
      }
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
      if (mountRef.current?.contains(dom)) {
        mountRef.current.removeChild(dom)
      }
      refs.current = null
    }
  }, [model.id, mode]) // 의존성을 model.id로 단순화하여 불필요한 재로딩 방지

  /* ================= 기즈모 및 고스트 로직 (동일) ================= */
  useEffect(() => {
    if (!refs.current) return
    const { transformControls } = refs.current
    if (mode === 'edit' && selectedPartId && partsRef.current[selectedPartId]) {
      transformControls.attach(partsRef.current[selectedPartId].root)
    } else {
      transformControls.detach()
    }
  }, [selectedPartId, mode])

  useEffect(() => {
    Object.entries(partsRef.current).forEach(([id, p]) => {
      p.root.visible = true;
      p.root.traverse((obj: any) => {
        if (!obj.isMesh) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m: any) => {
          const snap = materialSnapshot.get(m);
          if (!snap) return;
          const isGhostActive = mode !== 'single' && ghost && selectedPartId && id !== selectedPartId;
          m.transparent = isGhostActive ? true : snap.transparent;
          m.opacity = isGhostActive ? 0.15 : snap.opacity;
          if (m.emissive) {
            m.emissive.set(id === selectedPartId ? 0x38bdf8 : (snap.emissive || new THREE.Color(0, 0, 0)));
          }
        });
      });
    });
  }, [ghost, selectedPartId, mode]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#0f172a' }} />
})

ViewerCanvas.displayName = 'ViewerCanvas'
export default ViewerCanvas