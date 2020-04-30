export default class Road{

    constructor(height,direction){

        this.height=height;
        this.direction=direction;
        this.road=undefined

    }


    createRoad(position,scene){
        
        //var materialRoad = new BABYLON.StandardMaterial("materialRoad", scene);
        //materialRoad.diffuseColor = new BABYLON.Color3(0, 0, 0); //Red

        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseTexture = new BABYLON.Texture("../resources/droite.jpg", scene);

        var road = BABYLON.MeshBuilder.CreateBox("myBox", {height: this.height, width: this.height, depth: 10}, scene);
        road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
        road.material = myMaterial;
        road.position = position;
        this.road=road;
        return road;

    }
}