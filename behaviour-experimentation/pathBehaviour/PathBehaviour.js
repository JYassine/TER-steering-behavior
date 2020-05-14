import Behaviour from "../Behaviour.js";
import SeekBehaviour from "../seekBehaviour/SeekBehaviour.js";
import Direction from "./Direction.js";

export default class PathBehaviour extends Behaviour {

    constructor(mesh) {
        super(mesh)
        this.radiusPath=2
        
        this.t = new SeekBehaviour(this.mesh)
        this.t.maxSpeed = 5
        this.t.maxForce = 10
        this.t.mass = 50
        this.targetP = undefined;
        this.predictpos = undefined;
        this.normal = undefined;
    }

    isPointOnSegment(a, b, p) {
        const tolerance = 0.1
        const ab = BABYLON.Vector3.Distance(a, b)
        const pa = BABYLON.Vector3.Distance(p, a)
        const pb = BABYLON.Vector3.Distance(p, b)
        const difference = ab - (pa + pb)

        return difference < tolerance && difference > -tolerance
    }

    run(paths) {

        var predict = this.velocity.clone().normalize().scale(20)
        this.predictpos = predict.add(this.position)
        var dirB;

        let worldRecord = 1000000;

        for (let i = 0; i < paths.length-1; i++) {
            var a = paths[i].path
            var b = paths[i+1].path
            dirB = paths[i+1].direction
            var normalPoint = this.normalPoint(this.predictpos, a, b);

            var distance=null;
            

            if (this.isPointOnSegment(a, b, normalPoint)) {
                distance = BABYLON.Vector3.Distance(this.predictpos, normalPoint)
                
            } else {
                
                const distanceA = BABYLON.Vector3.Distance(this.predictpos, a)
                const distanceB = BABYLON.Vector3.Distance(this.predictpos, b)
                distance = Math.min(distanceA, distanceB)
                normalPoint = distanceA < distanceB ? a : b
                
            }

            

            var distance = BABYLON.Vector3.Distance(this.predictpos, normalPoint)

            if (distance < worldRecord) {
                worldRecord = distance;
                this.normal = normalPoint;
                this.normal.y=0
                
                var dir = new BABYLON.Vector3(0,0,0)

                if(dirB === Direction.RIGHT){
                    dir.x=-6;
                }else if(dirB===Direction.BACK){
                    dir.z+=6;
                }else if(dirB===Direction.LEFT){
                    dir.x+=6;
                }else{
                    dir.z-=6;
                }


                dir = dir.scale(10*(1-1/distance));
                dir.y=0
                this.targetP = this.normal.clone().add(dir)
                
                
            }
        }

        if (worldRecord > this.radiusPath) {
            this.t.run(this.targetP)
        }else{
            this.t.applyForce(new BABYLON.Vector3(0,0,0))
        }

    }

    normalPoint(vectorPath, a, b) {
        var ap = vectorPath.subtract(a)
        var ab = b.subtract(a)

        ab.normalize(); 
        var dot = BABYLON.Vector3.Dot(ap, ab)
        ab = ab.scale(dot);

        var normalPoint = a.add(ab);
        return normalPoint;
    }



}