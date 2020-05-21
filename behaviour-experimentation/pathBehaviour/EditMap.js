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
        this.concMap = []
    }


    createEditMap(gridMaterial) {
        for (let i = this.height / 2; i > (-this.height / 2) - this.widthTile; i -= this.widthTile) {
            for (let j = -(this.height / 2); j < (this.height / 2) + this.widthTile; j += this.widthTile) {
                var box = BABYLON.MeshBuilder.CreateBox("box", { height: this.widthTile, width: this.widthTile, depth: 10 }, this.scene);
                box.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                box.material = gridMaterial
                box.position.x = i
                box.position.z = j
                box.position.y = 0
                var editable = true;
                this.edit.push({ editable, box })
            }
        }
    }

    handlePointerHover() {

        var materialHover = new BABYLON.StandardMaterial("shiptx1", this.scene);
        materialHover.diffuseColor = new BABYLON.Color3(0, 0, 1); //Red


        var materialOutHover = new BABYLON.GridMaterial("grid", this.scene);
        materialOutHover.gridRatio = 10


        this.edit.forEach(tileMap => {
            tileMap.box.actionManager = new BABYLON.ActionManager(this.scene);
            tileMap.box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
                tileMap.box.material = materialHover

            }));

            tileMap.box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {

                tileMap.box.material = materialOutHover

            }));
        });
    }


    handlePointerClick(map, direction,scene,concMap) {

        var materialHover = new BABYLON.StandardMaterial("shiptx1", this.scene);
        materialHover.diffuseColor = new BABYLON.Color3(0, 0, 1); //Red


        var materialOutHover = new BABYLON.GridMaterial("grid", this.scene);
        materialOutHover.gridRatio = 10

        this.edit.forEach(tileMap => {

            tileMap.box.actionManager = new BABYLON.ActionManager(this.scene);
            tileMap.box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (ev) {
                tileMap.box.material = materialHover

            }));

            tileMap.box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (ev) {

                tileMap.box.material = materialOutHover

            }));
            tileMap.box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function (ev) {
                var positionTile = tileMap.box.position.clone()
                tileMap.box.dispose()
                tileMap.editable = false;
                var road1 = new Road(200, positionTile, direction)
                road1.createRoad(scene)
                map.push(road1)
                
                if (map.length > 0) {

                    if (map[0].pathPoint.length === 0) {
                        map[0].createPath()
                        map[0].pathPoint.forEach(path => {
                            var direction = map[0].direction;
                            concMap.push({ direction, path })
                        })
                    }else{
                        
                        map[map.length-1].createPath(map[map.length-2].pathPoint[map[map.length-2].pathPoint.length-1])
                        map[map.length-1].pathPoint.forEach(path => {
                            var direction = map[map.length-1].direction;
                            concMap.push({ direction, path })
                        })

                        

                    }
        
                }
                
                
                scene.removeMesh( scene.getMeshByName("path"));

                var myConc = []

                map.forEach(road=>{
                    road.pathPoint.forEach(point=>{
                        var clonePath = point.clone()
                        clonePath.y+=20
                        myConc.push(clonePath)
                    });
                });


                var track = BABYLON.MeshBuilder.CreateLines("path", {points: myConc}, scene);               
               
            }));
        });



    }

    handleSuppressClick(editMap, edit, map, scene,concMap) {

        var materialHover = new BABYLON.StandardMaterial("shiptx1", this.scene);
        materialHover.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red



        var gridMaterial = new BABYLON.GridMaterial("grid", this.scene);
        gridMaterial.gridRatio = 10

        
        var materialOutHover = new BABYLON.StandardMaterial("myMaterial", this.scene);

        var roadmaterialpt = new BABYLON.RoadProceduralTexture("customtext", 512, scene);
        materialOutHover.diffuseTexture = roadmaterialpt;

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
                        concMap=[]
                        map.forEach(road=>{
                            road.pathPoint.forEach(p=>{
                                var direction = road.direction
                                var path = p
                                concMap.push({direction,path})
                            })
                        })

                        break;
                    }
                }
                

                var myConc=[]
                var index = scene.removeMesh( scene.getMeshByName("path"));

                map.forEach(road=>{
                    road.pathPoint.forEach(point=>{
                        var clonePath = point.clone()
                        clonePath.y+=20
                        myConc.push(clonePath)
                    });
                });
               
                var track = BABYLON.MeshBuilder.CreateLines("path", {points: myConc}, scene);



                var box = BABYLON.MeshBuilder.CreateBox("myBox", { height: 200, width: 200, depth: 10 }, scene);
                box.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                box.material = gridMaterial
                box.position = posTile

                for (let i = 0; i < edit.length; i++) {
                    if (posTile.x === edit[i].box.position.x && posTile.z === edit[i].box.position.z) {
                        edit[i].box = box
                        editMap.handlePointerHover()

                    }
                }
            }));
        });



    }



    delete() {
        this.edit.forEach(tileMap => {
            tileMap.box.isVisible = false;
            tileMap.box.actionManager = undefined;
        })
        this.map.forEach(m=>{
            
            //var materialOutHover = new BABYLON.StandardMaterial("myMaterial", this.scene);

            //materialOutHover.diffuseTexture = new BABYLON.Texture("../resources/droite.jpg", this.scene);
            m.road.actionManager = undefined;
            //m.road.material=materialOutHover
        })
    }
}