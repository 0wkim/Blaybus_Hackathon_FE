import type { ModelDef } from '@/viewer/types'

export const SuspensionModel: ModelDef = {
  id: 'suspension',
  name: '자동차 서스펜션 시스템',
  parts: [
    {
      id: 'ROD',
      label: '댐퍼 로드 (중심축)',
      path: '/models/Suspension/ROD.glb',
      assembled: { x: 0, y: 0.1, z: 0 }, // 중심
      exploded: { x: -2, y: 0, z: 0 }, // 분해 시 왼쪽으로 이동
    },
    {
      id: 'BASE',
      label: '하부 베이스',
      path: '/models/Suspension/BASE.glb',
      assembled: { x: 0, y: 0, z: 0 }, // 로드 하단에 위치
      exploded: { x: 0, y: -2.0, z: 0 }, // 아래로 크게 분해
    },
    {
      id: 'SPRING',
      label: '코일 스프링',
      path: '/models/Suspension/SPRING.glb',
      assembled: { x: 0, y: 0.02, z: 0 },   // 로드를 감싸는 위치
      exploded: { x: 0, y: 1.5, z: 0 },  // 위로 분해
    },
    {
      id: 'NIT',
      label: '상부 시트 (NIT)',
      path: '/models/Suspension/NIT.glb',
      assembled: { x: 0, y: 0.12, z: 0 },
      exploded: { x: 2, y: -0.2, z: 0 }, // 오른쪽으로 분해
    },
  ],
}