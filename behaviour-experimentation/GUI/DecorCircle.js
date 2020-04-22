import Decor from "./Decor.js"

export default class DecorCircle extends Decor {


    constructor(origin,radius,scene) {
        super(origin)
        this.radius=radius;
        this.scene=scene;
        this.ratioScaling = 4
    }


    create(color, visible) {
        this.meshVisualization = BABYLON.MeshBuilder.CreateCylinder("circle", { diameter: this.radius*2, tessellation: 50 }, this.scene);
        super.create(color,visible)
        var materialCircle = new BABYLON.StandardMaterial("materialCircle", this.scene);
        materialCircle.diffuseColor = color; 
        this.meshVisualization.material = materialCircle
    }

    update(meshToVisualize) {
        
        super.update(meshToVisualize)
        var directionRotationCenter = (meshToVisualize.wanderCenter.clone()).normalize()
        var drCenter = Math.atan2(directionRotationCenter.z, -directionRotationCenter.x)

        this.meshVisualization.position = meshToVisualize.wanderCenter.clone().add(meshToVisualize.position.clone())
        this.meshVisualization.locallyTranslate(new BABYLON.Vector3(-28 * meshToVisualize.wanderDistance, 0, 0))
        this.meshVisualization.rotation.y = drCenter
    }

}