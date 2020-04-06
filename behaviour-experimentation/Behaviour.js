export default class Behaviour {

    constructor(mesh) {
        this.mesh = mesh
        this.target = undefined
        this.position = mesh.position
        this.velocity = new BABYLON.Vector3(2, 0, 0)
        this.acceleration = new BABYLON.Vector3(0, 0, 0)
        this.maxSpeed = 2
        this.maxForce = 0.1
        this.mass = 10
        this.name="Heinsenberg"

    }


    run(target) {


    }

    getMesh() {
        return this.mesh
    }

    applyForce(force) {
        if (this.mass > 0) {

            this.acceleration.addInPlace(force.scale(1 / this.mass));
        }else{
            
            this.acceleration.addInPlace(force);
        }
    }

    update() {

        this.velocity.addInPlace(this.acceleration);

        //Limit velocity to max speed
        const length = this.velocity.length();
        let tempVelocity = this.velocity.clone();
        const scaledVector = tempVelocity.normalize().scale(this.maxSpeed);
        this.velocity = length < this.maxSpeed ? this.velocity : scaledVector;

        this.position.addInPlace(this.velocity);
        this.acceleration.multiplyInPlace(new BABYLON.Vector3(0, 0, 0));

    }


}