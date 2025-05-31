// src/game.ts
import {
  engine,
  Transform,
  GltfContainer,
  PointerEvents,
  PointerEventType,
  InputAction,
  Entity,
  inputSystem,
  Schemas
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'

export const CarComponent = engine.defineComponent('CarComponent', {
  speed: Schemas.Number,
  isAccelerating: Schemas.Boolean,
  isBraking: Schemas.Boolean,
  isTurningLeft: Schemas.Boolean,
  isTurningRight: Schemas.Boolean,
  rotationAngle: Schemas.Number,
  startZ: Schemas.Number,
  startTime: Schemas.Number,
  bestTime: Schemas.Number
})

export class RacingCar {
  static cars: Entity[] = []

  constructor(position: Vector3, model: string) {
    const entity = engine.addEntity()
    RacingCar.cars.push(entity)

    Transform.create(entity, {
      position,
      scale: Vector3.create(1, 1, 1),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })

    GltfContainer.create(entity, { src: `assets/scene/Models/${model}/${model}.glb` }) // Chemin corrigé

    PointerEvents.create(entity, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            hoverText: 'Démarrer !'
          }
        }
      ]
    })

    CarComponent.create(entity, {
      speed: 0,
      isAccelerating: false,
      isBraking: false,
      isTurningLeft: false,
      isTurningRight: false,
      rotationAngle: 180,
      startZ: position.z,
      startTime: 0,
      bestTime: Infinity
    })
  }
}

function clickSystem() {
  for (const [entity] of engine.getEntitiesWith(CarComponent, PointerEvents)) {
    const input = inputSystem.getInputCommand(InputAction.IA_POINTER, PointerEventType.PET_DOWN)
    if (input && input.hit && input.hit.entityId === entity) {
      const carData = CarComponent.getMutable(entity)
      carData.isAccelerating = !carData.isAccelerating
      if (carData.isAccelerating) {
        carData.startTime = Date.now() / 1000
      }
    }
  }
}

function carSystem(dt: number) {
  for (const [entity] of engine.getEntitiesWith(CarComponent)) {
    const carData = CarComponent.getMutable(entity)
    const transform = Transform.getMutable(entity)
    const maxSpeed = 10
    const acceleration = 0.25
    const deceleration = 0.1
    const rotationSpeed = 90

    carData.isAccelerating = inputSystem.isTriggered(InputAction.IA_FORWARD, PointerEventType.PET_DOWN)
    carData.isBraking = inputSystem.isTriggered(InputAction.IA_BACKWARD, PointerEventType.PET_DOWN)
    carData.isTurningLeft = inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_DOWN)
    carData.isTurningRight = inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_DOWN)

    if (carData.isAccelerating) {
      carData.speed = Math.min(maxSpeed, carData.speed + acceleration * dt)
    } else if (carData.isBraking) {
      carData.speed = Math.max(0, carData.speed - deceleration * dt * 2)
    } else {
      carData.speed = Math.max(0, carData.speed - deceleration * dt)
    }

    if (carData.isTurningLeft) {
      carData.rotationAngle += rotationSpeed * dt
    }
    if (carData.isTurningRight) {
      carData.rotationAngle -= rotationSpeed * dt
    }
    transform.rotation = Quaternion.fromEulerDegrees(0, carData.rotationAngle, 0)

    const forward = Vector3.rotate(Vector3.Forward(), transform.rotation)
    transform.position = Vector3.add(
      transform.position,
      Vector3.scale(forward, carData.speed * dt)
    )

    transform.position.x = Math.max(2, Math.min(14, transform.position.x))
    transform.position.z = Math.max(2, Math.min(14, transform.position.z))

    if (transform.position.z > 14) {
      const currentTime = Date.now() / 1000
      const lapTime = currentTime - carData.startTime
      carData.bestTime = Math.min(carData.bestTime, lapTime)
      console.log(`Temps du tour : ${lapTime.toFixed(2)}s, Meilleur temps : ${carData.bestTime.toFixed(2)}s`)

      carData.speed = 0
      carData.isAccelerating = false
      carData.isBraking = false
      transform.position = Vector3.create(transform.position.x, 0.1, carData.startZ)
      carData.startTime = currentTime
    }
  }
}

export function setupGame() {
  new RacingCar(Vector3.create(6, 0.1, 2), 'car_red') // Chemin sera assets/scene/Models/car_red/car_red.glb
  new RacingCar(Vector3.create(8, 0.1, 2), 'car_blue') // Chemin sera assets/scene/Models/car_blue/car_blue.glb

  engine.addSystem(carSystem)
  engine.addSystem(clickSystem)
}