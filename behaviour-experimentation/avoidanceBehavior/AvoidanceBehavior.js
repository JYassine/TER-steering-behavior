import Behaviour from "../Behaviour.js";


export default class AvoidanceBehavior extends Behaviour {

    constructor(mesh) {
        super(mesh)
        this.ahead = undefined;
        this.ahead2 = undefined
        this.aheadMesh = undefined;
        this.aheadMesh2 = undefined;
        this.maxSeeAhead = 30
        this.maxAvoidForce =2
        this.avoidanceForce = new BABYLON.Vector3(0,0,0)

    }


    run(target, desired,listObstacles) {
        this.ahead = this.position.add(desired.clone().normalize().scale(this.maxSeeAhead))
        this.ahead2 =  this.position.add(desired.clone().normalize().scale(this.maxSeeAhead*0.5))
        this.aheadMesh.position=this.ahead
        this.aheadMesh2.position=this.ahead2
        var mostThreatening = this.findObstacle(listObstacles);

        if (mostThreatening !== undefined) {
            this.avoidanceForce = this.ahead.subtract(mostThreatening.position).normalize().scale(this.maxAvoidForce)
            this.avoidanceForce.y= 0
            
            this.applyForce(this.avoidanceForce);
        } 


    }

    findObstacle(listObstacles) {

        var mostThreatening = undefined
        var obstacle = undefined
        var collision = false;

        for (let i = 0; i < listObstacles.length; i++) {
            obstacle = listObstacles[i];
            if (this.aheadMesh.intersectsMesh(obstacle, true) || this.aheadMesh2.intersectsMesh(obstacle, true) ) {
                console.log("HI NIGGA")
                collision = true
            }

            if (collision && (mostThreatening === undefined || BABYLON.Vector3.Distance(this.position, obstacle.position) < BABYLON.Vector3.Distance(this.position, mostThreatening.position))) {
                mostThreatening = obstacle;
            }

        }

        return mostThreatening;
    }



}