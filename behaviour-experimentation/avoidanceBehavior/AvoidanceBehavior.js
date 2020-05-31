import Behaviour from "../Behaviour.js";


export default class AvoidanceBehavior extends Behaviour {

    constructor(listObstacles) {
        super();
        this.listObstacles=listObstacles
        this.ahead = undefined;
        this.ahead2 = undefined;
        this.maxSeeAhead = 10
        this.maxAvoidForce = 3
        this.avoidanceForce = new BABYLON.Vector3(0, 0, 0)
      

    }


    apply(vehicle){
        var dynamic_length=0;
        dynamic_length = this.maxSeeAhead + (vehicle.velocity.length() / vehicle.maxSpeed) * vehicle.maxSeeAhead;
        dynamic_length = parseInt(dynamic_length)
        this.ahead = vehicle.position.add((vehicle.velocity.clone().normalize().scale(dynamic_length)));
        this.ahead2 = vehicle.position.add((vehicle.velocity).clone().normalize()).scale(dynamic_length*0.5);
        var mostThreatening = this.findObstacle(vehicle,this.listObstacles);

        if (mostThreatening !== undefined) {
            
            this.avoidanceForce  = this.ahead.subtract(mostThreatening.position).normalize().scale(this.maxAvoidForce*vehicle.maxSpeed);
            this.avoidanceForce.y=0;
            
            vehicle.applyForce(this.avoidanceForce)
       
        } else {
            this.listObstacles.forEach(o => {
                var material = o.material.clone()
                material.diffuseColor = new BABYLON.Color3(1, 0, 0)
                o.material = material
            })

            this.avoidanceForce = new BABYLON.Vector3.Zero()
        }

    }

    lineIntersectsCircle(vehicle,ahead, ahead2,obstacle) {
        return BABYLON.Vector3.Distance(obstacle.position, vehicle.position) <= obstacle.getBoundingInfo().boundingSphere.radius*10 ||BABYLON.Vector3.Distance(obstacle.position, ahead) <= obstacle.getBoundingInfo().boundingSphere.radius*10 || BABYLON.Vector3.Distance(obstacle.position, ahead2) <= obstacle.getBoundingInfo().boundingSphere.radius*10;
    }


    findObstacle(vehicle,listObstacles) {

        var mostThreatening = undefined
        var obstacle = undefined
        var collision = false;

        for (let i = 0; i < listObstacles.length; i++) {
            obstacle = listObstacles[i];
            if (this.lineIntersectsCircle(vehicle,this.ahead,this.ahead2,obstacle)) {
                var material = obstacle.material.clone()
                material.diffuseColor= new BABYLON.Color3(0,1,0)
                collision = true
                obstacle.material = material
            }

            if (collision && (mostThreatening === undefined || BABYLON.Vector3.Distance(vehicle.position, obstacle.position) < BABYLON.Vector3.Distance(vehicle.position, mostThreatening.position))) {
                mostThreatening = obstacle;
            }

        }

        return mostThreatening;
    }


   

    


}