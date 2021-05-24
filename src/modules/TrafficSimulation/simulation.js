export class Simulation {
    constructor() {
        this.objects = []
    }

    addObject() {}
    removeObject() {}
    cleanObjects() {
        while(this.objects.length) {
            this.objects.pop()
        }
    }
}