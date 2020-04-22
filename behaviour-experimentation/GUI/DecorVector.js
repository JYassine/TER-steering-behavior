import Decor from "./Decor.js"

export default class DecorVector extends Decor {


    constructor(origin,length,scene) {
        super(origin)
        this.length=length;
        this.scene=scene;
        this.ratioScaling = 4
    }


    create(color, visible) {
        this.meshVisualization = BABYLON.Mesh.CreateLines("vector", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(-this.length, 0, 0), new BABYLON.Vector3(-this.length * 0.95, 0.05 * -this.length, 0),
            new BABYLON.Vector3(-this.length, 0, 0), new BABYLON.Vector3(-this.length * 0.95, -0.05 * -this.length, 0)
        ], this.scene);
        
        super.create(color,visible)



    }

    update(meshToVisualize) {
        this.meshVisualization.rotation.y = Math.atan2(meshToVisualize.z, -meshToVisualize.x)
        this.meshVisualization.position = this.origin.clone()
        this.meshVisualization.scaling = new BABYLON.Vector3(meshToVisualize.length() / this.ratioScaling, meshToVisualize.length() / this.ratioScaling, meshToVisualize.length() / this.ratioScaling)
    }

}