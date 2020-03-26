import Behaviour from "./Behaviour.js";

export default class SeekBehaviour extends Behaviour{

    constructor(mesh){
        super(mesh)
    }

    seek(target) {
        this.target = target
        var desired = target.position.subtract(this.position);  // A vector pointing from the position to the target
        
        // Scale to maximum speed
        desired.normalize()
        desired.multiplyInPlace(new BABYLON.Vector3(this.maxSpeed, this.maxSpeed, this.maxSpeed))
        
        // Steering = Desired minus velocity
        var steer = desired.subtract(this.velocity);
        super.applyForce(steer);
    }
}