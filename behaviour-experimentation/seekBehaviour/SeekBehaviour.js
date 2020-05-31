import Behaviour from "../Behaviour.js";

export default class SeekBehaviour extends Behaviour {

    constructor(target) {
        super();
        this.target= target;
    }

    apply(vehicle) {
        var x = vehicle.mesh.position.x;
        var z = vehicle.mesh.position.z;
        vehicle.desired = this.target.subtract(new BABYLON.Vector3(x, vehicle.position.y, z));


        // Scale to maximum speed
        vehicle.desired.normalize()
        var desiredScaled = vehicle.desired.scale(vehicle.maxSpeed)
        vehicle.desired = desiredScaled

        // Steering = Desired minus velocity
        vehicle.steer = vehicle.desired.subtract(vehicle.velocity);

        // Limit the steer vector to maxForce
        const lengthSteer = vehicle.steer.length();
        let tempSteer = vehicle.steer.clone();
        const scaledToMaxForce = tempSteer.normalize().scale(vehicle.maxForce);

        if (!(lengthSteer < vehicle.maxForce)) {
            vehicle.steer = scaledToMaxForce
        }
        vehicle.applyForce(vehicle.steer)
    }

}