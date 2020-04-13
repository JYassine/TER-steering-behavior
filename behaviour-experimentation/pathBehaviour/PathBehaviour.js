import Behaviour from "../Behaviour.js";
import SeekBehaviour from "../seekBehaviour/SeekBehaviour.js";

export default class PathBehaviour extends Behaviour {

    constructor(mesh) {
        super(mesh)
        this.r=10
        this.t = new SeekBehaviour(this.mesh)
        this.t.maxSpeed = 3
        this.t.maxForce = 8
        this.t.mass = 1
        this.targetP = undefined
    }


    run(targetPath) {

        var predict = this.velocity.clone().normalize().scale(3)
        var predictpos = this.position.addInPlace(predict)

        var a = targetPath.firstPoint;
        var b = targetPath.lastPoint;

        var normalPoint = this.getNormalPoint(predictpos, a, b);

        var dir = b.subtract(a)
        dir.normalize();
        dir = dir.scale(10);  // This could be based on velocity instead of just an arbitrary 10 pixels
        this.targetP = normalPoint.addInPlace(dir)

        // How far away are we from the path?
        var distance = BABYLON.Vector3.Distance(predictpos, normalPoint);
        // Only if the distance is greater than the path's radius do we bother to steer
        if (distance > targetPath.radius) {


            console.log("DISTANCE : "+ distance)
            
            console.log("RADIUS : "+ targetPath.radius)
            this.t.run(this.targetP)
            console.log(this.targetP)

        }
    }

    getNormalPoint(vectorPath, a, b) {
        // Vector from a to p
        var ap = vectorPath.subtract(a)
        // Vector from a to b
        var ab = b.subtract(a)

        ab.normalize(); // Normalize the line
        // Project vector "diff" onto line by using the dot product
        var dot = BABYLON.Vector3.Dot(ap, ab)
        ab = ab.scale(dot);

        var normalPoint = a.addInPlace(ab);
        return normalPoint;
    }


    borders(path) {
        if (this.t.position.x > path.lastPoint.x + this.r) {
            this.t.position.x = path.firstPoint.x - this.r;
            this.t.position.z = path.firstPoint.z + (this.t.position.z-path.lastPoint.z);
        }
      }


}