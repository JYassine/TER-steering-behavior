import Direction from "./Direction.js";

export default class Road {

    constructor(height,position,direction) {

        this.height = height;
        this.direction = direction;
        this.road = undefined
        this.position=position;

    }


    createRoad( scene) {

        //var materialRoad = new BABYLON.StandardMaterial("materialRoad", scene);
        //materialRoad.diffuseColor = new BABYLON.Color3(0, 0, 0); //Red

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseTexture = new BABYLON.Texture("../resources/droite.jpg", scene);

        var road = BABYLON.MeshBuilder.CreateBox("myBox", { height: this.height, width: this.height, depth: 10 }, scene);
        switch (this.direction) {
            case Direction.BACK:
                road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                road.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
                break;
            case Direction.FORWARD:
                
                road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                road.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
                break;
            case Direction.LEFT:
                
                road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                break;
            case Direction.RIGHT:
                
                road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                road.rotate(BABYLON.Axis.Y, Math.PI , BABYLON.Space.WORLD);
                break;

        }
        road.material = myMaterial;
        road.position=this.position
        this.road = road;
        return road;

    }
}