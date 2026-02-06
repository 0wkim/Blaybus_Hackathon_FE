export const RobotGripperModel = {
  parts: [
    {
      id: 'BasePlate',
      path: '/models/RobotGripper/BasePlate.glb',
      thumbnail: '/models/RobotGripper/thumbnails/BasePlate.png',
      assembled: { x: 0, y: 0, z: 0 },
      rotation: { x: -Math.PI / 2, y: 0, z: Math.PI / 1 },
      // 가장 아래쪽에 배치
      exploded: { x: 0, y: -0.3, z: 0 },
    },
    {
      id: 'BaseMountingBracket',
      path: '/models/RobotGripper/BaseMountingBracket.glb',
      thumbnail: '/models/RobotGripper/thumbnails/BaseMountingBracket.png',
      assembled: { x: -0.01, y: 0.005, z: -0.005 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      // BasePlate 바로 위
      exploded: { x: 0, y: -0.15, z: 0 },
    },
    {
      id: 'BaseGear',
      path: '/models/RobotGripper/BaseGear.glb',
      thumbnail: '/models/RobotGripper/thumbnails/BaseGear.png',
      assembled: { x: -0.0075, y: -0.003, z: 0.017 },
      rotation: { x: Math.PI, y: -Math.PI, z: -Math.PI / 2 },
      // 중앙 중심부
      exploded: { x: 0, y: 0, z: 0 },
    },
    {
      id: 'GearLink_1',
      path: '/models/RobotGripper/GearLink_1.glb',
      thumbnail: '/models/RobotGripper/thumbnails/GearLink1.png',
      assembled: { x: -0.012, y: 0.003, z: 0.038 },
      rotation: { x: 0, y: Math.PI + 0.05, z: Math.PI / 2 },
      // 왼쪽으로 1단계 분해
      exploded: { x: -0.1, y: 0.1, z: 0 },
    },
    {
      id: 'GearLink_2',
      path: '/models/RobotGripper/GearLink_2.glb',
      thumbnail: '/models/RobotGripper/thumbnails/GearLink2.png',
      assembled: { x: 0.013, y: 0.004, z: 0.038 },
      rotation: { x: -Math.PI / 2, y: Math.PI, z: -1.6 },
      // 오른쪽으로 1단계 분해
      exploded: { x: 0.1, y: 0.1, z: 0 },
    },
    {
      id: 'Link_L',
      path: '/models/RobotGripper/Link.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Link.png',
      assembled: { x: -0.0055, y: 0.0055, z: 0.0735 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      // 왼쪽으로 2단계 분해 (GearLink보다 위/바깥)
      exploded: { x: -0.15, y: 0.25, z: 0 },
    },
    {
      id: 'Link_R',
      path: '/models/RobotGripper/Link.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Link.png',
      assembled: { x: 0.005, y: 0.0055, z: 0.0735 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      // 오른쪽으로 2단계 분해
      exploded: { x: 0.15, y: 0.25, z: 0 },
    },
    {
      id: 'Gripper_L',
      path: '/models/RobotGripper/Gripper.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Gripper.png',
      assembled: { x: 0, y: 0, z: 0.0885 },
      rotation: { x: Math.PI / 2, y: 0, z: 1.3 },
      // 왼쪽 최상단
      exploded: { x: -0.2, y: 0.4, z: 0 },
    },
    {
      id: 'Gripper_R',
      path: '/models/RobotGripper/Gripper.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Gripper.png',
      assembled: { x: 0, y: 0, z: 0.0885 },
      rotation: { x: -Math.PI / 2, y: 0, z: -1.8 },
      // 오른쪽 최상단
      exploded: { x: 0.2, y: 0.4, z: 0 },
    },
    // --- Pins (위치에 따라 그룹핑하여 배치) ---
    {
      id: 'Pin', // Base/Mount 근처 핀 (Left)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: -0.0055, y: 0.002, z: 0.004 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: -0.08, y: -0.15, z: 0.05 },
    },
    {
      id: 'Pin', // Base/Mount 근처 핀 (Right)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: 0.0055, y: 0.002, z: 0.004 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: 0.08, y: -0.15, z: 0.05 },
    },
    {
      id: 'Pin', // GearLink_1 연결 핀 (Left)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: -0.0115, y: 0.001, z: 0.039 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: -0.15, y: 0.1, z: 0.05 },
    },
    {
      id: 'Pin', // GearLink_2 연결 핀 (Right)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: 0.0134, y: 0.001, z: 0.039 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: 0.15, y: 0.1, z: 0.05 },
    },
    {
      id: 'Pin', // 중간 관절 핀 (Right)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: 0.005, y: 0.002, z: 0.058 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: 0.18, y: 0.25, z: 0.05 },
    },
    {
      id: 'Pin', // 중간 관절 핀 (Left)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: -0.0053, y: 0.002, z: 0.058 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: -0.18, y: 0.25, z: 0.05 },
    },
    {
      id: 'Pin', // 상단 링크 핀 (Left - Link와 Gripper 사이)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: -0.01, y: 0.001, z: 0.07 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: -0.22, y: 0.35, z: 0.05 },
    },
    {
      id: 'Pin', // 상단 링크 핀 (Right - Link와 Gripper 사이)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: 0.01, y: 0.001, z: 0.07 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: 0.22, y: 0.35, z: 0.05 },
    },
    {
      id: 'Pin', // 그리퍼 끝단 핀 (Right)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: 0.005, y: 0.002, z: 0.089 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: 0.25, y: 0.4, z: 0.05 },
    },
    {
      id: 'Pin', // 그리퍼 끝단 핀 (Left)
      path: '/models/RobotGripper/Pin.glb',
      thumbnail: '/models/RobotGripper/thumbnails/Pin.png',
      assembled: { x: -0.0053, y: 0.002, z: 0.089 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      exploded: { x: -0.25, y: 0.4, z: 0.05 },
    },
  ],
}