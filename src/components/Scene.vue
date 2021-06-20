<template>
  <div id="container"/>
</template>

<script>
import * as THREE from 'three'
import {FpsCameraControl} from "../modules/FpsCameraControl/fpsCameraControl"
import {Street} from "../modules/TrafficSimulation/street"
import {CrossRoad} from "../modules/TrafficSimulation/cross_road"
import {Semphore} from "../modules/TrafficSimulation/semphore"

export default {
  name: "Scene",
  props: {
    wsApiPath: {
      type: String,
      required: true,
      default: '',
    }
  },
  data() {
    return {
      wsReceivedMessages: 0,
      roadIsInit: false,
      crossRoadIsInit: false,
      ws_cars: [],
      registeredCars: [],
      ws_data: {},
      ws_roads: [],
      ws_semaphores: [],
      ws_cross_roads: [],
      scene_cars: {},
      container: null,
      scene: null,
      renderer: null,
      clock: null,
      panel: null,
      fpsCameraControl: null,
      ambientLight: null,
      light: null,
      streets: [],
      websocket: null
    }
  },
  mounted() {
    this.initialize()
    this.simulate()
    window.addEventListener('resize', this.onResize)
    this.websocket = new WebSocket(this.wsApiPath)
    this.websocket.onmessage = this.wsOnMessage
    this.websocket.onerror = this.wsOnError
    this.websocket.onopen = this.wsOnOpen
  },
  methods: {
    wsOnOpen() {
      this.websocket.send(true)
    },
    wsOnError(message) {
      console.log(message)
    },
    wsOnMessage(message) {
      this.ws_data = JSON.parse(message.data)
      this.ws_cars = this.ws_data.cars || []
      this.ws_roads = this.ws_data.roads || []
      this.ws_semaphores = this.ws_data.semaphores || []
      this.ws_cross_roads = this.ws_data.crossRoads || []
      this.wsReceivedMessages += 1
      this.websocket.send(true)
    },
    initialize: function () {
      this.clock = new THREE.Clock()
      this.container = document.getElementById('container')

      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
      this.container.appendChild(this.renderer.domElement)

      this.scene = new THREE.Scene()

      this.light = new THREE.PointLight(0xffffff, 0.8, 100)
      this.light.position.set(5,5,5)
      this.light.castShadow = true
      this.light.shadow.camera.near = 0.1
      this.light.shadow.camera.far = 100

      this.fpsCameraControl = new FpsCameraControl(
          new THREE.PerspectiveCamera(
              45, this.container.clientWidth/this.container.clientHeight, 0.1, 1000
          ),
          this.container
      )

      const panel_material = new THREE.MeshBasicMaterial({color: 0x5C8829})
      const panel_geometry = new THREE.PlaneGeometry(1000, 1000)
      this.panel = new THREE.Mesh(panel_geometry, panel_material)
      this.panel.position.set(0,0,0)
      this.panel.lookAt(0,1,0)

      this.scene.add(this.panel)
    },
    simulate: function () {
      this.fpsCameraControl.simulate(this.clock.getDelta())
      // обработка положений автомобилей
      const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
      const geometry = new THREE.BoxGeometry(1,1,1)
      let existCarsId = []
      if (this.ws_cars !== null) {
        for (let i = 0; i < this.ws_cars.length; i++) {
          const car = this.ws_cars[i]
          existCarsId.push(car.id)
          const scene_car = this.scene.getObjectByName(car.id)
          const position = car.position
          if (!scene_car) {
            let cube = new THREE.Mesh(geometry, material)
            cube.name = car.id
            cube.position.set(position.x, 0.1, position.y)
            this.scene.add(cube)
            this.registeredCars.push(car.id)
          } else {
            scene_car.position.set(position.x, 0.1, position.y)
          }
        }
        // Удаление автомобилей
        const diff = this.registeredCars.filter(car_id => !existCarsId.includes(car_id))

        for (let i = 0; i < diff.length; i++) {
          this.scene.remove(this.scene.getObjectByName(diff[i]))
        }
        this.registeredCars = existCarsId
      }
      if (!this.roadIsInit) {
        if (this.ws_roads !== null && this.ws_roads.length) {
          for (let i = 0; i < this.ws_roads.length; i++) {
            let road = this.ws_roads[i]
            const scene_road = this.scene.getObjectByName(`road${road.id}`)
            let position = road.position
            if (!scene_road) {
              let street = new Street(
                  new THREE.Vector3(position.p1.x, 0.1, position.p1.y),
                  new THREE.Vector3(position.p2.x, 0.1, position.p2.y),
                  position.angle
              )
              street.name = `road${road.id}`
              this.scene.add(street)
            }
          }
          this.roadIsInit = true
        }
      }
      if (!this.crossRoadIsInit) {
        if (this.ws_cross_roads !== null && this.ws_cross_roads.length) {
          for (let i = 0; i < this.ws_cross_roads.length; i++) {
            let crossRoad = this.ws_cross_roads[i]
            let scene_cross_road = this.scene.getObjectByName(`crossRoad${crossRoad.id}`)
            if (!scene_cross_road) {
              scene_cross_road = new CrossRoad(crossRoad.position)
              scene_cross_road.name = `crossRoad${crossRoad.id}`
              this.scene.add(scene_cross_road)
            }
          }
          this.crossRoadIsInit = true
        }
      }
      if (this.ws_semaphores !== null && this.ws_semaphores.length) {
        for (let i = 0; i < this.ws_semaphores.length; i++) {
          let ws_semaphore = this.ws_semaphores[i]
          let scene_semaphore = this.scene.getObjectByName(`semaphore${ws_semaphore.id}`)
          if (!scene_semaphore) {
            scene_semaphore = new Semphore(ws_semaphore.position, ws_semaphore.state)
            scene_semaphore.name = `semaphore${ws_semaphore.id}`
            this.scene.add(scene_semaphore)
          } else {
            scene_semaphore.setState(ws_semaphore.state)
          }
        }
      }
      this.draw()
    },
    draw: function () {
      requestAnimationFrame(this.simulate)
      this.renderer.render(this.scene, this.fpsCameraControl.camera)
    },
    onResize: function () {
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
      this.fpsCameraControl._resize()
    }
  },

}
</script>

<style scoped>
div {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>