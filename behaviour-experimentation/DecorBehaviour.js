export default class DecorBehaviour {


    constructor(origin) {
        this.origin = origin;
        this.ratioScaling = 4
        this.meshVisualization = new BABYLON.AbstractMesh;
    }


    createVector(length, color, scene, visible) {
        this.meshVisualization = BABYLON.Mesh.CreateLines("vector", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(-length, 0, 0), new BABYLON.Vector3(-length * 0.95, 0.05 * -length, 0),
            new BABYLON.Vector3(-length, 0, 0), new BABYLON.Vector3(-length * 0.95, -0.05 * -length, 0)
        ], scene);

        this.meshVisualization.color = color;
        this.meshVisualization.position = this.origin.clone();
        this.meshVisualization.isVisible = visible;

    }

    update(vectorToVizualise) {
        this.meshVisualization.rotation.y = Math.atan2(vectorToVizualise.z, -vectorToVizualise.x)
        this.meshVisualization.position = this.origin.clone()
        this.meshVisualization.scaling = new BABYLON.Vector3(vectorToVizualise.length() / this.ratioScaling, vectorToVizualise.length() / this.ratioScaling, vectorToVizualise.length() / this.ratioScaling)

    }

}