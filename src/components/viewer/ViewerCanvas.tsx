'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import type { ModelDef } from '@/viewer/types'

export type ViewerCanvasHandle = { zoomIn: () => void; zoomOut: () => void; resetCamera: () => void }

const ViewerCanvas = forwardRef<ViewerCanvasHandle, { model: ModelDef; ghost: boolean; selectedPartId: string | null; onSelectPart: (id: string | null) => void; isExpanded: boolean }>(
  ({ model, ghost, selectedPartId, onSelectPart, isExpanded }, ref) => {
    const mountRef = useRef<HTMLDivElement | null>(null)
    const refs = useRef<{ scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; controls: OrbitControls; rafId: number } | null>(null)
    const partsRef = useRef<Record<string, any>>({})
    const pickablesRef = useRef<THREE.Object3D[]>([])
    const explodeRef = useRef(0)
    const draggingRef = useRef(false)
    const lastYRef = useRef(0)
    const materialSnapshot = useMemo(() => new WeakMap<THREE.Material, any>(), [])

    useImperativeHandle(ref, () => ({
      zoomIn: () => refs.current?.controls.dollyIn(1.2),
      zoomOut: () => refs.current?.controls.dollyOut(1.2),
      resetCamera: () => {
        if (!refs.current) return
        refs.current.camera.position.set(2.0, 1.5, 2.2)
        refs.current.controls.target.set(0, 0.6, 0)
        refs.current.controls.update()
      }
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
      const timer = setTimeout(handleResize, 100) // 즉각 반응형 보정
      const timer2 = setTimeout(handleResize, 400) // 애니메이션 후 최종 보정

      return () => { ro.disconnect(); clearTimeout(timer); clearTimeout(timer2); }
    }, [isExpanded])

    useLayoutEffect(() => {
      if (!mountRef.current) return
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x020617)

      // ⭐ 카메라 FOV를 40으로 줄이고 거리를 2.2로 설정하여 모델을 크게 보이게 함
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
      camera.position.set(2.0, 1.5, 2.2)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(width, height)
      mountRef.current.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.target.set(0, 0.6, 0) // 시선 중심을 팔 관절 높이로 조정
      
      refs.current = { scene, camera, renderer, controls, rafId: 0 }

      scene.add(new THREE.AmbientLight(0xffffff, 0.8))
      const dirLight = new THREE.DirectionalLight(0xffffff, 1)
      dirLight.position.set(5, 10, 7.5)
      scene.add(dirLight)
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

          root.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const mesh = obj as THREE.Mesh
              mesh.userData.partId = p.id
              pickablesRef.current.push(mesh)
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
              mats.forEach(m => {
                if (!materialSnapshot.has(m)) materialSnapshot.set(m, { transparent: m.transparent, opacity: m.opacity, emissive: (m as any).emissive?.clone() })
              })
            }
          })
          partsRef.current[p.id] = { root: wrapper, assembled: new THREE.Vector3(p.assembled.x, p.assembled.y, p.assembled.z), exploded: new THREE.Vector3(p.exploded.x, p.exploded.y, p.exploded.z) }
        })
      })

      const onPointerDown = (e: PointerEvent) => { if (e.shiftKey) { draggingRef.current = true; lastYRef.current = e.clientY; controls.enabled = false; } }
      const onPointerMove = (e: PointerEvent) => {
        if (!draggingRef.current) return
        explodeRef.current = THREE.MathUtils.clamp(explodeRef.current + (lastYRef.current - e.clientY) * 0.005, 0, 1)
        lastYRef.current = e.clientY
        Object.values(partsRef.current).forEach((p) => { p.root.position.lerpVectors(p.assembled, p.exploded, explodeRef.current) })
      }
      const onPointerUp = () => { draggingRef.current = false; controls.enabled = true; }
      
      const handleClick = (e: MouseEvent) => {
        if (draggingRef.current || !refs.current) return
        const rect = renderer.domElement.getBoundingClientRect()
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera({ x: ((e.clientX - rect.left) / rect.width) * 2 - 1, y: -((e.clientY - rect.top) / rect.height) * 2 + 1 }, refs.current.camera)
        const hits = raycaster.intersectObjects(pickablesRef.current, true)
        onSelectPart(hits.length ? (hits[0].object.userData.partId as string) : null)
      }

      const dom = renderer.domElement
      dom.addEventListener('pointerdown', onPointerDown); window.addEventListener('pointermove', onPointerMove); window.addEventListener('pointerup', onPointerUp); dom.addEventListener('click', handleClick)
      const tick = () => { if (!refs.current) return; refs.current.rafId = requestAnimationFrame(tick); refs.current.controls.update(); refs.current.renderer.render(refs.current.scene, refs.current.camera); }
      tick()

      return () => { cancelAnimationFrame(refs.current?.rafId || 0); dom.removeEventListener('pointerdown', onPointerDown); window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp); dom.removeEventListener('click', handleClick); renderer.dispose(); scene.clear(); mountRef.current?.removeChild(dom); refs.current = null; }
    }, [JSON.stringify(model)])

    useEffect(() => {
      Object.entries(partsRef.current).forEach(([id, p]) => {
        p.root.traverse((obj: any) => {
          if (!obj.isMesh) return
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m: any) => {
            const snap = materialSnapshot.get(m)
            if (!snap) return
            m.transparent = (ghost && selectedPartId && id !== selectedPartId) ? true : snap.transparent
            m.opacity = (ghost && selectedPartId && id !== selectedPartId) ? 0.15 : snap.opacity
            if (m.emissive) m.emissive.set(id === selectedPartId ? 0x38bdf8 : (snap.emissive || new THREE.Color(0,0,0)))
          })
        })
      })
    }, [ghost, selectedPartId])

    return <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden', touchAction: 'none' }} />
  }
)

ViewerCanvas.displayName = 'ViewerCanvas'
export default ViewerCanvas