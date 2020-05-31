import Behaviour from "../Behaviour.js";

export default class WanderBehaviour extends Behaviour{

    constructor(){
        super()
        this.wanderCenter=0;
        this.wanderDistance=0
        this.wanderRadius=0
        this.wanderAngle=15;
        this.wanderForce= new BABYLON.Vector3(0,0,0)
        this.displacement=new BABYLON.Vector3(1,0,1)
        this.random = 10;
        
        
    }


    apply(vehicle) {

        this.wanderCenter = new BABYLON.Vector3(vehicle.velocity.x,vehicle.velocity.y,vehicle.velocity.z);
        this.wanderCenter.normalize();
        var wanderCenterScaled = this.wanderCenter.scale(this.wanderDistance)
        this.wanderCenter=wanderCenterScaled;

        const randomAngle = (Math.random() * -2 + 1) * this.random;
        const angle = (this.wanderAngle + randomAngle)  % 360;
        this.wanderAngle = angle;
        
        this.displacement.x = Math.cos((Math.PI / 180) * this.wanderAngle) ;
        this.displacement.z = Math.sin((Math.PI / 180) * this.wanderAngle) ;

        
        var displacementScaled = this.displacement.scale(this.wanderRadius)
        this.displacement=displacementScaled
        this.wanderForce = this.wanderCenter.add(this.displacement);
        vehicle.applyForce(this.wanderForce);

       
    }
}