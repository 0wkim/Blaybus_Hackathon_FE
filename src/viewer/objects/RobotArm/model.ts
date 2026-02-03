import type { ModelDef } from '@/viewer/types'

export const RobotArmModel: ModelDef = {
  id: 'RobotArm',
  name: 'Robot Arm',
  parts: [
    {
      id: 'base',
      label: 'Base',
      path: '/models/RobotArm/base.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0, y: 0, z: 0 },
    },
    {
      id: 'part2',
      label: 'Part 2',
      path: '/models/RobotArm/Part2.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0, y: 0.3, z: 0 },
    },
    {
      id: 'part3',
      label: 'Part 3',
      path: '/models/RobotArm/Part3.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0, y: 0.6, z: 0 },
    },
    {
      id: 'part4',
      label: 'Part 4',
      path: '/models/RobotArm/Part4.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0, y: 0.9, z: 0 },
    },
    {
      id: 'part5',
      label: 'Part 5',
      path: '/models/RobotArm/Part5.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0.25, y: 1.2, z: 0 },
    },
    {
      id: 'part6',
      label: 'Part 6',
      path: '/models/RobotArm/Part6.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: -0.25, y: 1.5, z: 0 },
    },
    {
      id: 'part7',
      label: 'Part 7',
      path: '/models/RobotArm/Part7.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: 0.3, y: 1.8, z: 0 },
    },
    {
      id: 'part8',
      label: 'Part 8',
      path: '/models/RobotArm/Part8.glb',
      assembled: { x: 0, y: 0, z: 0 },
      exploded: { x: -0.3, y: 2.1, z: 0 },
    },
  ],
}
