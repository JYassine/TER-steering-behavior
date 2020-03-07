import Vector from "./Vector2D.js";

export default class Vehicle {

    constructor(x,y,ctx){
        this.ctx=ctx
        this.position = new Vector(x,y)
        this.velocity= new Vector(0,-2)
        this.acceleration = new Vector(0,0)
        this.radius=25
        this.color="red"
        this.maxSpeed=4
        this.maxForce=0.4

    }


    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    }

    seek(target) {
        var desired = Vector.subtract(target,this.position);  // A vector pointing from the position to the target
        
        // Scale to maximum speed
        desired.normalize()
        desired.multiply(this.maxSpeed)
        // Steering = Desired minus velocity
        var steer = Vector.subtract(desired,this.velocity);
        
        this.applyForce(steer);
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    update () {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.multiply(0);
    }


}