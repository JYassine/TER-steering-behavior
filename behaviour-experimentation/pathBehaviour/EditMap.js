import Road from "./Road.js"
import Direction from "./Direction.js"

export default class EditMap {
    constructor(height, width, widthTile, scene) {
        this.height = height;
        this.width = width;
        this.widthTile = widthTile;
        this.scene = scene
        this.edit = []
        this.map = []
        this.direction = Direction.FORWARD;
    }


    createEditMap(gridMaterial) {
        for (let i = this.height / 2; i > (-this.height / 2) - this.widthTile; i -= this.widthTile) {
            for (let j = -(this.height / 2); j < (this.height / 2) + this.widthTile; j += this.widthTile) {
                var myBox = BABYLON.MeshBuilder.CreateBox("myBox", { height: this.widthTile, width: this.widthTile, depth: 10 }, this.scene);
                myBox.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                myBox.material = gridMaterial
                myBox.position.x = i
                myBox.position.z = j
                myBox.position.y = 0
                this.edit.push(myBox)
            }
        }
    }

    handlePointerHover() {

        var materialHover = new BABYLON.StandardMaterial("shiptx1", this.scene);
        materialHover.diffuseColor = new BABYLON.Color3(0, 0, 1); //Red


        var materialOutHover = new BABYLON.GridMaterial("grid", this.scene);
        materialOutHover.gridRatio = 10


        this.edit.forEach(tileMap => {
            tileMap.actionManager = new BABYLON.ActionManager(this.scene);
            tileMap.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
                tileMap.material = materialHover

            }));

            tileMap.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {

                tileMap.material = materialOutHover

            }));
        });
    }


    handlePointerClick( map, direction) {

        var materialHover = new BABYLON.StandardMaterial("shiptx1", this.scene);
        materialHover.diffuseColor = new BABYLON.Color3(0, 0, 1); //Red


        var materialOutHover = new BABYLON.GridMaterial("grid", this.scene);
        materialOutHover.gridRatio = 10

        this.edit.forEach(tileMap => {

            tileMap.actionManager = new BABYLON.ActionManager(this.scene);
            tileMap.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
                tileMap.material = materialHover

            }));

            tileMap.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {

                tileMap.material = materialOutHover

            }));
            tileMap.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function (ev) {
                var positionTile = tileMap.position.clone()
                tileMap.dispose()
                var road1 = new Road(200, positionTile, direction)
                road1.createRoad(this.scene)
                map.push(road1)

            }));
        });



    }

    handleSuppressClick(editMap,edit, map, scene) {

        var materialHover = new BABYLON.StandardMaterial("shiptx1", this.scene);
        materialHover.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red


        var materialOutHover = new BABYLON.StandardMaterial("myMaterial", this.scene);

        materialOutHover.diffuseTexture = new BABYLON.Texture("../resources/droite.jpg", this.scene);


        var gridMaterial = new BABYLON.GridMaterial("grid", this.scene);
        gridMaterial.gridRatio = 10


        this.map.forEach(tileMap => {
            tileMap.road.actionManager = new BABYLON.ActionManager(this.scene);
            tileMap.road.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
                tileMap.road.material = materialHover

            }));

            tileMap.road.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {

                tileMap.road.material = materialOutHover

            }));
            tileMap.road.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function (ev) {
                let posTile = tileMap.road.position.clone()
                tileMap.road.dispose()
                for (let i = 0; i < map.length; i++) {
                    if (posTile.x === map[i].road.position.x && posTile.z === map[i].road.position.z) {
                        map.splice(i, 1)
                        break;
                    }
                }

                var myBox = BABYLON.MeshBuilder.CreateBox("myBox", { height: 200, width: 200, depth: 10 }, scene);
                myBox.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                myBox.material = gridMaterial
                myBox.position = posTile

                for (let i = 0; i < edit.length; i++) {
                    if (posTile.x === edit[i].position.x && posTile.z === edit[i].position.z) {
                        edit[i] = myBox
                        editMap.handlePointerHover()
                        
                    }
                }
            }));
        });



    }



    delete() {
        this.edit.forEach(tileMap => {
            tileMap.dispose()

        })
        this.edit = []
    }
}