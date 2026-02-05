
export const RobotArmModel = {
  parts: [
    {
      id: 'base',
      path: '/models/RobotArm/base.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0, y: 0, z: 0 }, 
    },
    {
      id: 'Part2',
      path: '/models/RobotArm/Part2.glb',
      assembled: { x: 0, y: 0.1, z: 0 },
      exploded: { x: 0, y: 0.3, z: 0 }, 
    },
    {
      id: 'Part3',
      path: '/models/RobotArm/Part3.glb',
      assembled: { x: 0, y: 0.26, z: 0.15 }, 
      rotation: { x: -1, y: Math.PI, z: -Math.PI / 2 }, 
      exploded: { x: 0, y: 0.6, z: 0.3 }, 
    },
    {
      id: 'Part4',
      path: '/models/RobotArm/Part4.glb',
      assembled: { x: 0, y: 0.5, z: -0.2 },
      exploded: { x: 0, y: 0.9, z: -0.4 }, 
    },
    {
      id: 'Part5',
      path: '/models/RobotArm/Part5.glb',
      assembled: { x: 0, y: 0.5, z: 0.1 },
      exploded: { x: 0, y: 1.2, z: 0.5 }, 
    },
    {
      id: 'Part6',
      path: '/models/RobotArm/Part6.glb',
      assembled: { x: 0, y: 0.47, z: 0.24 },
      rotation: { x: -Math.PI / 4, y: 0, z: 0 },
      exploded: { x: 0, y: 1.5, z: 1.0 },
    },
    {
      id: 'Part7',
      path: '/models/RobotArm/Part7.glb',
      assembled: { x: 0, y: 0.43, z: 0.28 },
      rotation: { x: Math.PI / 4, y: 0, z: 0 },
      exploded: { x: 0, y: 1.8, z: 1.4 },
    },
    {
      id: 'Part8_L',
      path: '/models/RobotArm/Part8.glb',
      assembled: { x: -0.045, y: 0.35, z: 0.34 },
      rotation: { x: -Math.PI / 4, y: 0, z: -0.5 },
      exploded: { x: -0.3, y: 2.1, z: 1.8 }, 
    },
    {
      id: 'Part8_R',
      path: '/models/RobotArm/Part8.glb',
      assembled: { x: 0.045, y: 0.36, z: 0.35 },
      rotation: { x: -Math.PI / 4, y: -Math.PI, z: -0.5 },
      exploded: { x: 0.3, y: 2.1, z: 1.8 }, 
    },
  ],
}