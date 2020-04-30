import Road from "./Road.js"

export default class EditMap{
    constructor(height,width,widthTile,scene){
        this.height=height;
        this.width=width;
        this.widthTile=widthTile;
        this.scene=scene
        this.edit = []
        this.map=[]
    }


    createEditMap(gridMaterial){
        for(let i=this.height/2;i>(-this.height/2)-this.widthTile;i-=this.widthTile){
            for(let j=-(this.height/2);j<(this.height/2)+this.widthTile;j+=this.widthTile){
                var myBox = BABYLON.MeshBuilder.CreateBox("myBox", {height: this.widthTile, width: this.widthTile, depth: 10}, this.scene);
                myBox.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                myBox.material = gridMaterial
                myBox.position.x=i
                myBox.position.z=j
                myBox.position.y=0
                this.edit.push(myBox)
             }
        }
    }

    handlePointerHover(){
        
        var materialHover = new BABYLON.StandardMaterial("shiptx1", this.scene);
        materialHover.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

        
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


    handlePointerClick(map){
        
        this.edit.forEach(tileMap => {
            tileMap.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function (ev) {
                var positionTile = tileMap.position.clone()
                tileMap.dispose()
                var road1 = new Road(200,"turnLeft")
                road1.createRoad(positionTile,this.scene)
                map.push(road1)
            }));

        });
    }


    delete(){
        this.edit.forEach(tileMap=>{
            tileMap.dispose()

        })
        this.edit=[]
    }
}