import {Vector3, Matrix4} from "three"

export class FpsCameraControl {
    constructor(camera, domElem = document) {
        this.camera  = camera
        this.domElem = domElem

        this.target = new Vector3(0.0,0.0,0.0)
        this.enabled = true
        this.movementSpeed = 10.0
        this.mouseSens = 0.5

        this.mouseLButton = false
        this.prevMousePosX = 0
        this.prevMousePosY = 0
        this.mouseDeltaX = 0
        this.mouseDeltaY = 0
        this.pitchMax = 90
        this.pitchMin = -90
        this.pitch = 45.0
        this.yaw = 45.0
        this.r = 15
        this.up = new Vector3(0.0, 1.0, 0.0)

        this.eyepos = new Vector3(0,0,0)
        this.calcEyePos()
        this.camera.position.set(this.eyepos.x, this.eyepos.y, this.eyepos.z)
        this.rotationMatrix = new Matrix4()
        this.updateRotationMatrix()
        this.forward = false
        this.backward = false
        this.left = false
        this.right = false
        this.shift = false

        this._mouseMove = this.mouseMove.bind(this)
        this._mouseDown = this.mouseDown.bind(this)
        this._mouseUp = this.mouseUp.bind(this)
        this._mouseWheel = this.mouseWheel.bind(this)
        this._keyDown = this.keyDown.bind(this)
        this._keyUp = this.keyUp.bind(this)
        this._resize = this.onResize.bind(this)

        this.bindEvents()
    }

    calcEyePos() {
        // let mulPitchPi = this.pitch * Math.PI
        this.eyepos.x = this.r * Math.cos((this.pitch * Math.PI)/180.0)*(Math.cos((this.yaw * Math.PI)/180.0)) + this.target.x
        this.eyepos.y = this.r * Math.sin((this.pitch * Math.PI)/180.0)
        this.eyepos.z = this.r * Math.cos((this.pitch * Math.PI)/180.0) * Math.sin((this.yaw * Math.PI)/180.0) + this.target.z
    }
    updateRotationMatrix() {
        this.rotationMatrix.lookAt(
            new Vector3(this.eyepos.x + this.target.x, this.eyepos.y + this.target.y, this.eyepos.z + this.target.z),
            this.target,
            this.up,
        )
        this.camera.setRotationFromMatrix(this.rotationMatrix)
    }

    bindEvents() {
        this.domElem.addEventListener('mousemove', this._mouseMove)
        this.domElem.addEventListener('mousedown', this._mouseDown)
        this.domElem.addEventListener('mouseup', this._mouseUp)
        this.domElem.addEventListener('mousewheel', this._mouseWheel)

        window.addEventListener('keydown', this._keyDown)
        window.addEventListener('keyup', this._keyUp)
    }

    setMouseFlags = function (keyCode, isPress) {
        switch (keyCode) {
            case 1:
                this.mouseLButton = isPress
                break
            case 3:
                break
            default:
                break
        }
    }

    setKeyFlags = function (keyCode, isPress) {
        switch (keyCode) {
            case 83:
                this.backward = isPress
                break
            case 87:
                this.forward = isPress
                break
            case 65:
                this.left = isPress
                break
            case 68:
                this.right = isPress
                break
            case 16:
                this.shift = isPress
                break
            default:
                break
        }
    }

    mouseMove(event) {
        if (this.mouseLButton) {
            let deltaX =  event.offsetX - this.prevMousePosX
            let deltaY =  event.offsetY - this.prevMousePosY
            if (this.pitch < this.pitchMax && deltaY > 0) this.pitch += deltaY * this.mouseSens
            if (this.pitch > this.pitchMin && deltaY < 0) this.pitch += deltaY * this.mouseSens
            if (this.pitch > this.pitchMax) this.pitch = this.pitchMax
            if (this.pitch < this.pitchMin) this.pitch = this.pitchMin
            this.yaw += deltaX * this.mouseSens
            this.calcEyePos()
            this.updateRotationMatrix()
            this.prevMousePosX = event.offsetX
            this.prevMousePosY = event.offsetY
        }
    }

    mouseDown(event) {
        this.setMouseFlags(event.which, true)
        this.prevMousePosX = event.offsetX
        this.prevMousePosY = event.offsetY
        this.mouseDeltaX = 0
        this.mouseDeltaY = 0
    }

    mouseUp(event) {
        this.setMouseFlags(event.which, false)
        this.mouseDeltaX = 0
        this.mouseDeltaY = 0
    }

    mouseWheel(event) {
        if (event.deltaY > 0) {
            this.camera.translateZ(this.camera.speed)
        } else {
            this.camera.translateZ(-this.camera.speed)
        }
    }

    keyDown(event) {
        this.setKeyFlags(event.which, true)
    }

    keyUp(event) {
        this.setKeyFlags(event.which, false)
    }

    onResize() {
        this.camera.aspect = this.domElem.clientWidth/this.domElem.clientHeight
        this.camera.updateProjectionMatrix()
    }

    simulate(frametime) {
        // movement logic
        let actualSpeed = frametime * this.movementSpeed
        if (this.shift) actualSpeed *= 3
        if (this.backward) {
            this.camera.translateZ(actualSpeed)
        }

        if (this.forward) {
            this.camera.translateZ(-actualSpeed)
        }

        if (this.right) {
            this.camera.translateX(actualSpeed)
        }

        if (this.left) {
            this.camera.translateX(-actualSpeed)
        }
        this.calcEyePos()
        this.updateRotationMatrix()
    }
}