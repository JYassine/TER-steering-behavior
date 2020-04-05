import Behaviour from "../Behaviour.js";

export default class WanderBehaviour extends Behaviour{

    constructor(mesh){
        super(mesh);
        this.wanderCenter=0;
        this.wanderDistance=0
        this.wanderRadius=0
        this.wanderAngle=1;
        this.wanderForce= new BABYLON.Vector3(0,0,0)
        this.displacement=new BABYLON.Vector3(1,0,1)
        this.random = 8;
        
        
    }


    run(target) {

        this.wanderCenter = new BABYLON.Vector3(this.velocity.x,this.velocity.y,this.velocity.z);
        this.wanderCenter.normalize();
        var wanderCenterScaled = this.wanderCenter.scale(this.wanderDistance)
        this.wanderCenter=wanderCenterScaled;

        const randomAngle = (Math.random() * 3 - 1) * this.random;
        const angle = (this.wanderAngle + randomAngle) + Math.PI;
        this.wanderAngle = angle;
        
        this.displacement.x = Math.cos((Math.PI / 180) * this.wanderAngle) ;
        this.displacement.z = Math.sin((Math.PI / 180) * this.wanderAngle) ;

        
        var displacementScaled = this.displacement.scale(this.wanderRadius)
        this.displacement=displacementScaled
        this.wanderForce = this.wanderCenter.add(this.displacement);
        this.applyForce(this.wanderForce);
        
    

       
    }
}