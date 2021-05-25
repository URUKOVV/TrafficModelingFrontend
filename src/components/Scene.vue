<template>
  <div id="container"/>
</template>

<script>
import * as THREE from 'three'
import {FpsCameraControl} from "../modules/FpsCameraControl/fpsCameraControl"
import {Street} from "../modules/TrafficSimulation/street"

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
      added: false,
      mutex: false,
      is_logged: false,
      ws_cars: [],
      scene_cars: {},
      container: null,
      scene: null,
      renderer: null,
      clock: null,
      cube: null,
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
      this.ws_cars = JSON.parse(message.data)
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

      const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
      const geometry = new THREE.BoxGeometry(1,1,1)
      this.cube = new THREE.Mesh(geometry, material)

      const panel_material = new THREE.MeshBasicMaterial({color: 0x00ff00})
      const panel_geometry = new THREE.PlaneGeometry(1000, 1000)
      this.panel = new THREE.Mesh(panel_geometry, panel_material)
      this.panel.position.set(0,0,0)
      this.panel.lookAt(0,1,0)

      this.streets.push(
          new Street(new THREE.Vector3(10, 0.1,0), new THREE.Vector3(-10, 0.1, 0)),
          new Street(new THREE.Vector3(-10, 0.1, 0), new THREE.Vector3(-10, 0.1, 30))
      )
      for (let i=0; i<this.streets.length; i++){
        this.scene.add(this.streets[i])
      }

      this.scene.add(this.panel)
      this.scene.add(this.cube)
    },
    simulate: function () {
      this.fpsCameraControl.simulate(this.clock.getDelta())
      // обработка положений автомобилей
      const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
      const geometry = new THREE.BoxGeometry(1,1,1)
      if (this.ws_cars !== null) {
        for (let i = 0; i < this.ws_cars.length; i++) {
          let car = this.ws_cars[i]
          const scene_car = this.scene.getObjectByName(car.id)
          let position = car.position
          if (!scene_car) {
            let cube = new THREE.Mesh(geometry, material)
            cube.name = car.id
            cube.position.set(position.x, 0.1, position.y)
            this.scene.add(cube)
          } else {
            scene_car.position.set(position.x, 0.1, position.y)
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