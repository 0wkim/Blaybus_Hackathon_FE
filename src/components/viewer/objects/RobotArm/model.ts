
export const RobotArmModel = {
  title: "Robot Arm",
  description: `여러 개의 관절과 링크로 구성된 기계 장치로,사람의 팔처럼 물체를 집고, 이동하고, 정밀 작업을 수행하도록 설계된 자동화 시스템
  
  ▪ 주요 용도
    ◦ 조립 및 분해 작업
    ◦ 반복 작업

  ▪ 관련 이론
    ◦ 파지 이론
    ◦ 힘 전달 메커니즘
    ◦ 평행 그리퍼 원리
  `,

  parts: [
    {
      id: 'base',
      name: '베이스 프레임',
      description: '장치 전체를 지지하고 고정하는 하부 구조물로, 모든 움직임의 기준이 되는 부품',
      path: '/models/RobotArm/base.glb',
      thumbnail: '/models/RobotArm/thumbnails/base.png',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0, y: 0, z: 0 }, 
    },
    {
      id: 'Part2',
      name: '관절 하우징(Joint Housing)',
      description: '내부 구동부를 보호하며 링크 간 회전 운동을 가능하게 하는 핵심 구조 부품',
      path: '/models/RobotArm/Part2.glb',
      thumbnail: '/models/RobotArm/thumbnails/Part2.png',
      assembled: { x: 0, y: 0.1, z: 0 },
      exploded: { x: 0, y: 0.3, z: 0 }, 
    },
    {
      id: 'Part3',
      name: '팔의 링크 (Arm Segment)',
      description: '관절과 관절을 연결하며, 팔의 길이와 움직임 범위를 결정하는 구조 부품',
      path: '/models/RobotArm/Part3.glb',
      thumbnail: '/models/RobotArm/thumbnails/Part3.png',
      assembled: { x: 0, y: 0.26, z: 0.15 }, 
      rotation: { x: -1, y: Math.PI, z: -Math.PI / 2 }, 
      exploded: { x: 0, y: 0.6, z: 0.3 }, 
    },
    {
      id: 'Part4',
      name: '손목 관절 (End Joint)',
      description: '로봇 팔 끝단에서 엔드 이펙터의 방향과 회전을 정밀하게 제어하는 관절 부품',
      path: '/models/RobotArm/Part4.glb',
      thumbnail: '/models/RobotArm/thumbnails/Part4.png',
      assembled: { x: 0, y: 0.5, z: -0.2 },
      exploded: { x: 0, y: 0.9, z: -0.4 }, 
    },
    {
      id: 'Part5',
      name: '그리퍼 (Gripper)',
      description: '로봇 팔 끝단에 장착되어 물체를 집고 고정하거나 놓는 역할을 수행하는 엔드 이펙터',
      path: '/models/RobotArm/Part5.glb',
      thumbnail: '/models/RobotArm/thumbnails/Part5.png',
      assembled: { x: 0, y: 0.5, z: 0.1 },
      exploded: { x: 0, y: 1.2, z: 0.5 }, 
    },
    {
      id: 'Part6',
      name: '관절 유닛 (Joint)',
      description: '로봇 팔에서 링크를 회전시키는 관절 부품으로, 팔의 움직임과 하중 지지를 담당',
      path: '/models/RobotArm/Part6.glb',
      thumbnail: '/models/RobotArm/thumbnails/Part6.png',
      assembled: { x: 0, y: 0.47, z: 0.24 },
      rotation: { x: -Math.PI / 4, y: 0, z: 0 },
      exploded: { x: 0, y: 1.5, z: 1.0 },
    },
    {
      id: 'Part7',
      name: '회전 유닛 (Base Joint)',
      description: '로봇 팔 전체를 지면 기준으로 회전시키는 하부 관절 유닛',
      path: '/models/RobotArm/Part7.glb',
      thumbnail: '/models/RobotArm/thumbnails/Part7.png',
      assembled: { x: 0, y: 0.43, z: 0.28 },
      rotation: { x: Math.PI / 4, y: 0, z: 0 },
      exploded: { x: 0, y: 1.8, z: 1.4 },
    },
    {
      id: 'Part8_L',
      name: '그리퍼 핑거 (Finger)',
      description: '그리퍼에서 물체를 직접 집는 가동 조로, 파지력과 안정성을 결정하는 핵심 부품',
      path: '/models/RobotArm/Part8.glb',
      thumbnail: '/models/RobotArm/thumbnails/Part8.png',
      assembled: { x: -0.045, y: 0.35, z: 0.34 },
      rotation: { x: -Math.PI / 4, y: 0, z: -0.5 },
      exploded: { x: -0.3, y: 2.1, z: 1.8 }, 
    },
    {
      id: 'Part8_R',
      path: '/models/RobotArm/Part8.glb',
      thumbnail: '/models/RobotArm/thumbnails/Part8.png',
      assembled: { x: 0.045, y: 0.36, z: 0.35 },
      rotation: { x: -Math.PI / 4, y: -Math.PI, z: -0.5 },
      exploded: { x: 0.3, y: 2.1, z: 1.8 }, 
    },
  ],
}