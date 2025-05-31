import { engine, Transform, GltfContainer } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { setupGame } from './game'

export function main() {
  const track = engine.addEntity()
  Transform.create(track, {
    position: Vector3.create(8, 0, 8),
    scale: Vector3.create(16, 0.1, 16)
  })
  GltfContainer.create(track, { src: 'models/track.glb' })

  setupGame()
}
