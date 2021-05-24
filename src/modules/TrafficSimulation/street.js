import {Vector3, MeshBasicMaterial, Mesh, PlaneGeometry, Matrix4} from "three"

const material = new MeshBasicMaterial({color: 0x333333})

export class Street extends Mesh{
    // eslint-disable-next-line constructor-super
    constructor(positionStart, positionEnd) {
        if (!(positionStart instanceof Vector3 && positionEnd instanceof Vector3)) return

        super(new PlaneGeometry(10, positionStart.distanceTo(positionEnd)), material)
        this.position.set(
            positionStart.x - (positionStart.x - positionEnd.x)/2,
            positionStart.y - (positionStart.y - positionEnd.y)/2,
            positionStart.z - (positionStart.z - positionEnd.z)/2
            )

        let matrix1 = new Matrix4()
        let matrix2 = new Matrix4()
        let up = -Math.PI/2

        let tempPoint = new Vector3(this.position.x, this.position.y, this.position.z + 1)

        let a = tempPoint.distanceTo(positionStart)
        let b = this.position.distanceTo(positionStart)
        let c = this.position.distanceTo(tempPoint)

        let cos = (
            (Math.pow(a, 2) +
            Math.pow(b, 2) -
            Math.pow(c, 2))/(2 * a * b)
        )
        console.log(this.position, tempPoint, positionStart, cos)


        matrix1.set(
            1, 0, 0, 0,
            0, Math.cos(up), -Math.sin(up), 0,
            0, Math.sin(up), Math.cos(up), 0,
            0, 0, 0, 1
        )
        matrix2.set(
            Math.cos(up), -Math.sin(up), 0, 0,
            Math.sin(up), Math.cos(up), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        )

        this.setRotationFromMatrix(matrix1.multiply(matrix2))

        // let tempPoint = new Vector3(this.position.x + 2, this.position.y, this.position.z)
        //
        // let a = tempPoint.distanceTo(positionStart)
        // let b = this.position.distanceTo(positionStart)
        // let c = this.position.distanceTo(tempPoint)
        //
        // let cos = (
        //     (Math.pow(a, 2) +
        //     Math.pow(b, 2) -
        //     Math.pow(c, 2))/(2 * a * b)
        // )
        //
        //
        // console.log(cos)

        // this.lookAt(new Vector3(this.position.x, this.position.y + 1, this.position.z))

        //this.setRotationFromMatrix(this.matrix.makeRotationY(Math.PI/2))
        // this.setRotationFromMatrix(this.matrix.makeRotationZ())
        // this.setRotationFromMatrix(this.matrix.makeRotationZ(Math.PI/2))
        // this.rotateOnAxis()
        this.positionStart = positionStart
        this.positionEnd = positionEnd
        this.queueForward = []
        this.queueBackward = []
        this.length = positionStart.distanceTo(positionEnd)
    }
}