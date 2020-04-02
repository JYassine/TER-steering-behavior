import Behaviour from "../Behaviour.js";
import Utilities from "../Utilities.js";

export default class WanderBehaviour extends Behaviour{

    constructor(mesh){
        super(mesh);
        this.wanderCenter=0;
        this.wanderDistance=new BABYLON.Vector3(-1,0,-2);
        this.wanderRadius=new BABYLON.Vector3(-1.2,0,-1.2);
        this.wanderAngle=0;
        this.wanderForce= new BABYLON.Vector3(0,0,0)
        this.displacement=new BABYLON.Vector3(0,0,0)
        
        
    }

    updateParameters(wanderDistance,wanderRadius){
        this.wanderRadius= new BABYLON.Vector3(wanderRadius,wanderRadius,wanderRadius)
        this.wanderDistance= new BABYLON.Vector3(wanderDistance,wanderRadius,wanderDistance)
        
    }

    setAngle = function(value) {
        this.displacement.x = Math.cos(value) * Utilities.getMagnitude(this.displacement);
        this.displacement.z = Math.sin(value) * Utilities.getMagnitude(this.displacement);
    }

    run(target) {
        this.wanderCenter = new BABYLON.Vector3(this.velocity.x,this.velocity.y,this.velocity.z);
        this.wanderCenter.normalize();
        this.wanderCenter.multiplyInPlace(this.wanderDistance);

        
        this.displacement = new BABYLON.Vector3(-1.1, 0,-0.8)
        this.displacement.multiplyInPlace(this.wanderRadius);

        this.setAngle(this.wanderAngle);
        this.wanderAngle += Utilities.getRandom(-1,3);
        this.wanderForce = this.wanderCenter.addInPlace(this.displacement);
        this.applyForce(this.wanderForce);
        
    

       
    }
}