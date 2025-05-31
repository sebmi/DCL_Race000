// src/scene.ts
import { engine, Transform, GltfContainer } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

export function setupScene() {
  const createBoundary = (position: Vector3, scale: Vector3) => {
    const wall = engine.addEntity()
    Transform.create(wall, { position, scale })
    GltfContainer.create(wall, { src: 'assets/scene/Models/wall/wall.glb' }) // Chemin corrigé
  }

  createBoundary(Vector3.create(8, 0, 0), Vector3.create(16, 2, 1))
  createBoundary(Vector3.create(8, 0, 16), Vector3.create(16, 2, 1))
  createBoundary(Vector3.create(0, 0, 8), Vector3.create(1, 2, 16))
  createBoundary(Vector3.create(16, 0, 8), Vector3.create(1, 2, 16))
}