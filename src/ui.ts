// ui.ts
import { engine, Entity, Transform, TextShape } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { CarComponent } from './game'

// Créer l'interface utilisateur
export function setupUI() {
  // Entité pour le texte du temps
  const timeEntity = engine.addEntity()
  Transform.create(timeEntity, {
    position: Vector3.create(8, 2, 8), // Position dans la scène
    scale: Vector3.create(0.5, 0.5, 0.5)
  })
  TextShape.create(timeEntity, {
    text: 'Temps: 0s',
    fontSize: 2,
    textColor: { r: 1, g: 1, b: 1, a: 1 }
  })

  // Entité pour le texte du meilleur temps
  const bestTimeEntity = engine.addEntity()
  Transform.create(bestTimeEntity, {
    position: Vector3.create(8, 1.5, 8), // Juste en dessous
    scale: Vector3.create(0.5, 0.5, 0.5)
  })
  TextShape.create(bestTimeEntity, {
    text: 'Meilleur temps: -',
    fontSize: 2,
    textColor: { r: 1, g: 1, b: 1, a: 1 }
  })

  // Système pour mettre à jour l'UI
  engine.addSystem((dt: number) => {
    for (const [entity, carData] of engine.getEntitiesWith(CarComponent)) {
      if (carData.isAccelerating) {
        const currentTime = Date.now() / 1000
        const lapTime = currentTime - carData.startTime
        TextShape.getMutable(timeEntity).text = `Temps: ${lapTime.toFixed(2)}s`
        TextShape.getMutable(bestTimeEntity).text = `Meilleur temps: ${carData.bestTime === Infinity ? '-' : carData.bestTime.toFixed(2)}s`
      }
    }
  })
}