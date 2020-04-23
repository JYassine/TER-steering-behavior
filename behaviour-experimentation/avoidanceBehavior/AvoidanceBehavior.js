import Behaviour from "../Behaviour.js";


export default class AvoidanceBehavior extends Behaviour {

    constructor(mesh) {
        super(mesh)
        this.ahead = undefined;
        this.aheadMesh = undefined;
        this.maxSeeAhead = 7
        this.maxAvoidForce =3
        this.avoidanceForce = new BABYLON.Vector3(0,0,0)

    }


    run(target, desired,listObstacles) {
        this.ahead = this.position.add(desired.clone().normalize().scale(this.maxSeeAhead))
        this.aheadMesh.position=this.ahead
        var mostThreatening = this.findObstacle(listObstacles);

        if (mostThreatening !== undefined) {
            var multiplier = 1 + ( this.ahead.length() - mostThreatening.position.z) / this.ahead.length()
            this.avoidanceForce.x = ( mostThreatening.getBoundingInfo().boundingSphere.radius - mostThreatening.position.x ) * multiplier
            var brakingWeight = 2.0
            this.avoidanceForce.z = ( mostThreatening.getBoundingInfo().boundingSphere.radius - mostThreatening.position.z ) * brakingWeight
            this.applyForce(this.avoidanceForce)
        }else{

            
            this.avoidanceForce=new BABYLON.Vector3.Zero()
        }
        

    }

    findObstacle(listObstacles) {

        var mostThreatening = undefined
        var obstacle = undefined
        var collision = false;

        for (let i = 0; i < listObstacles.length; i++) {
            obstacle = listObstacles[i];
            if (this.aheadMesh.intersectsMesh(obstacle, true)) {
                
                collision = true
            }

            if (collision && (mostThreatening === undefined || BABYLON.Vector3.Distance(this.position, obstacle.position) < BABYLON.Vector3.Distance(this.position, mostThreatening.position))) {
                mostThreatening = obstacle;
            }

        }
        return mostThreatening;
    }



}