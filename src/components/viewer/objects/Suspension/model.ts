import type { ModelDef } from '@/viewer/types'

export const SuspensionModel: ModelDef = {
  id: 'suspension',
  name: '자동차 서스펜션 시스템',
  parts: [
    {
      id: 'BASE',
      label: '하부 베이스',
      path: '/models/Suspension/BASE.glb',
      thumbnail: '/models/Suspension/thumbnails/BASE.png',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0, y: 0, z: 0 }, 
    },
    {
      id: 'ROD',
      label: '댐퍼 로드 (중심축)',
      path: '/models/Suspension/ROD.glb',
      thumbnail: '/models/Suspension/thumbnails/ROD.png',
      assembled: { x: 0, y: 0.1, z: 0 },
      exploded: { x: 0, y: 0.4, z: 0 }, 
    },
    {
      id: 'SPRING',
      label: '코일 스프링',
      path: '/models/Suspension/SPRING.glb',
      thumbnail: '/models/Suspension/thumbnails/SPRING.png',
      assembled: { x: 0, y: 0.02, z: 0 },
      exploded: { x: 0, y: 0.8, z: 0 }, 
    },
    {
      id: 'NIT',
      label: '상부 시트 (NIT)',
      path: '/models/Suspension/NIT.glb',
      thumbnail: '/models/Suspension/thumbnails/NIT.png',
      assembled: { x: 0, y: 0.12, z: 0 },
      exploded: { x: 0, y: 1.2, z: 0 }, 
    },
  ],
}