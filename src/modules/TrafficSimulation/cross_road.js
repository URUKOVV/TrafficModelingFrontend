import {MeshBasicMaterial, Mesh, PlaneGeometry, Matrix4} from "three"

const material = new MeshBasicMaterial({color: 0x333333})

export class CrossRoad extends Mesh{
    // eslint-disable-next-line constructor-super
    constructor(
        position
    ) {
        super(new PlaneGeometry(5, 5), material)
        this.position.set(
            position.x,
            0.1,
            position.y
        )

        let matrix1 = new Matrix4()
        let matrix2 = new Matrix4()

        let up = -Math.PI/2

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
    }
}