import Behaviour from "../Behaviour.js";

export default class SeekBehaviour extends Behaviour {

    constructor(mesh) {
        super(mesh)
        this.desired = new BABYLON.Vector3(0, 0, 0)
        this.velocity = new BABYLON.Vector3(-0.2, 0, 0)
        this.steer=new BABYLON.Vector3(0,0,0)
        this.maxForce = 0
    }


    run(target) {
        var x = this.position.x;
        var z = this.position.z;
        this.desired = target.position.subtract(new BABYLON.Vector3(x, this.position.y, z));

        // Scale to maximum speed
        this.desired.normalize()
        var desiredScaled = this.desired.scale(this.maxSpeed)
        this.desired = desiredScaled

        // Steering = Desired minus velocity
        this.steer = this.desired.subtract(this.velocity);

        // Limit the steer vector to maxForce
        const lengthSteer = this.steer.length();
        let tempSteer = this.steer.clone();
        const scaledToMaxForce = tempSteer.normalize().scale(this.maxForce);

        if (!(lengthSteer < this.maxForce)) {
            this.steer = scaledToMaxForce
        }

        super.applyForce(this.steer)
    }

    update() {
        super.update();
    }
}