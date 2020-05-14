export default class Behaviour {

    constructor(mesh) {
        this.mesh = mesh
        this.target = undefined
        this.position = mesh.position
        this.velocity = new BABYLON.Vector3(2, 0, 0)
        this.acceleration = new BABYLON.Vector3(0, 0, 0)
        this.maxSpeed = 2
        this.maxForce = 0.1
        this.mass = 10
        this.name = "Heinsenberg"
        this.desiredSeparation=5
        this.ahead = undefined;
        this.ahead2 = undefined;
        this.maxSeeAhead = 10
        this.maxAvoidForce = 3
        this.avoidanceForce = new BABYLON.Vector3(0, 0, 0)

    }


    run(target) {


    }

    avoid(listObstacles) {
    
        var dynamic_length=0;
        dynamic_length = this.maxSeeAhead + (this.velocity.length() / this.maxSpeed) * this.maxSeeAhead;
        dynamic_length = parseInt(dynamic_length)
        this.ahead = this.position.add((this.velocity.clone().normalize().scale(dynamic_length)));
        this.ahead2 = this.position.add((this.velocity).clone().normalize()).scale(dynamic_length*0.5);
        var mostThreatening = this.findObstacle(listObstacles);

        if (mostThreatening !== undefined) {
            
            this.avoidanceForce  = this.ahead.subtract(mostThreatening.position).normalize().scale(this.maxAvoidForce*this.maxSpeed);
            this.avoidanceForce.y=0;
            
            this.applyForce(this.avoidanceForce)
       
        } else {
            listObstacles.forEach(o => {
                var material = o.material.clone()
                material.diffuseColor = new BABYLON.Color3(1, 0, 0)
                o.material = material
            })

            this.avoidanceForce = new BABYLON.Vector3.Zero()
        }


    }

    separate(vehicles) {
        let sum = new BABYLON.Vector3(0, 0, 0)
        let count = 0;
        vehicles.forEach(v => {
            let d = BABYLON.Vector3.Distance(this.position, v.position);
            if ((d > 0) && (d < this.desiredSeparation)) {
                let diff = this.position.subtract(v.position);
                diff.normalize();
                diff = diff.scale(1/d);
                sum.addInPlace(diff);
                count++;
            }

        });

        if (count > 0) {
            sum = sum.scale(1/count);
            sum.normalize();
            sum = sum.scale(this.maxSpeed);
            sum.y=0
            var sumSteer = sum.subtract(this.velocity)
            const lengthSteer = sumSteer.length();
            let tempSteer = sumSteer.clone();
            const scaledToMaxForce = tempSteer.normalize().scale(this.maxForce);

            if (!(lengthSteer < this.maxForce)) {
                sumSteer = scaledToMaxForce
            }
            this.applyForce(sumSteer);
        }
    }

    getMesh() {
        return this.mesh
    }

    applyForce(force) {
        if (this.mass > 0) {

            this.acceleration.addInPlace(force.scale(1 / this.mass));
        } else {

            this.acceleration.addInPlace(force);
        }
    }

    findObstacle(listObstacles) {

        var mostThreatening = undefined
        var obstacle = undefined
        var collision = false;

        for (let i = 0; i < listObstacles.length; i++) {
            obstacle = listObstacles[i];
            if (this.lineIntersectsCircle(this.ahead,this.ahead2,obstacle)) {
                var material = obstacle.material.clone()
                material.diffuseColor= new BABYLON.Color3(0,1,0)
                collision = true
                obstacle.material = material
            }

            if (collision && (mostThreatening === undefined || BABYLON.Vector3.Distance(this.position, obstacle.position) < BABYLON.Vector3.Distance(this.position, mostThreatening.position))) {
                mostThreatening = obstacle;
            }

        }

        return mostThreatening;
    }

    
    lineIntersectsCircle(ahead, ahead2,obstacle) {
        return BABYLON.Vector3.Distance(obstacle.position, this.position) <= obstacle.getBoundingInfo().boundingSphere.radius*10 ||BABYLON.Vector3.Distance(obstacle.position, ahead) <= obstacle.getBoundingInfo().boundingSphere.radius*10 || BABYLON.Vector3.Distance(obstacle.position, ahead2) <= obstacle.getBoundingInfo().boundingSphere.radius*10;
    }



    rotate(){
        
        var directionRotation = (this.velocity.clone()).normalize()
        var dR = Math.atan2(directionRotation.z, -directionRotation.x)

        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.rotation.z = Math.PI / 2;
        this.mesh.rotation.y = dR
    }

    update() {

        this.velocity.addInPlace(this.acceleration);

        //Limit velocity to max speed
        const length = this.velocity.length();
        let tempVelocity = this.velocity.clone();
        const scaledVector = tempVelocity.normalize().scale(this.maxSpeed);
        this.velocity = length < this.maxSpeed ? this.velocity : scaledVector;

        this.position.addInPlace(this.velocity);
        this.acceleration.multiplyInPlace(new BABYLON.Vector3(0, 0, 0));

    }


}