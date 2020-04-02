import Behaviour from "../Behaviour.js";

export default class SeekBehaviour extends Behaviour {

    constructor(mesh) {
        super(mesh)
        this.desired = undefined
        this.velocity = new BABYLON.Vector3(-0.2, 0, 0)
        this.maxDistance=0;
    }
    

    run(target) {
        var x = this.position.x-target.position.x-this.maxDistance;
        var z = this.position.z-target.position.z-this.maxDistance;
        this.desired = target.position.subtract(new BABYLON.Vector3(x,this.position.y,z)); 

        // Scale to maximum speed
        this.desired.normalize()
        this.desired.multiplyInPlace(new BABYLON.Vector3(this.maxSpeed, this.maxSpeed, this.maxSpeed))

        // Steering = Desired minus velocity
        this.steer = this.desired.subtract(this.velocity);
        
        super.applyForce(this.steer)

        this.facePoint(target.position)
    }
}