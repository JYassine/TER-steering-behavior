export default class Decor{

    constructor(origin){
        
        this.origin = origin;
        this.ratioScaling = 4
        this.meshVisualization = new BABYLON.AbstractMesh;

    }

    create(color, visible){
        
        this.meshVisualization.color = color;
        this.meshVisualization.position = this.origin.clone();
        this.meshVisualization.isVisible = visible;
    }

    update(meshVisualize) {

    }

}