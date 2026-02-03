import type { ModelDef } from '@/viewer/types'
import { RobotArmModel } from '@/viewer/objects/RobotArm/model'

const REGISTRY: Record<string, ModelDef> = {
  RobotArm: RobotArmModel,
}

export function getModelOrThrow(modelId: string): ModelDef {
  const model = REGISTRY[modelId]
  if (!model) {
    throw new Error(`Unknown modelId: ${modelId}`)
  }
  return model
}
