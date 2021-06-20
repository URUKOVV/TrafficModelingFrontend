import {MeshBasicMaterial, Mesh, SphereGeometry} from "three"

const red_material = new MeshBasicMaterial({color: 0xff0000})
const green_material = new MeshBasicMaterial({color: 0x00ff00})

export class Semphore extends Mesh{
    // eslint-disable-next-line constructor-super
    constructor(
        position,
        state
    ) {
        let material;
        if (state === 1) {
            material = green_material
        } else {
            material = red_material
        }
        super(new SphereGeometry(0.5), material)
        this.position.set(
            position.x,
            3.0,
            position.y
        )
    }

    setState(state) {
        if (state === 1) {
            this.material = green_material
        } else {
            this.material = red_material
        }
    }
}