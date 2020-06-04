import PathBehaviour from "./PathBehaviour.js";
import Vehicle from "../Vehicle.js";
import GUI from "../GUI/GUI.js"
import Utilities from "../Utilities.js"
import DecorVector from "../GUI/DecorVector.js"
import EditMap from "./EditMap.js"
import Direction from "./Direction.js";
import Road from "./Road.js";
var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var ground;
var entitiesCreated = false;
var selectedEntity = false;
var entities = []
var UiPanelSelection;
var advancedTexture;
var nameEntities = []
var mapRoads=[];
var direction;
var editMap;
var UiPanel;
var UiPanelEditMap;
var targets = []
var mouseTarget;
var imageStreet;
var pathBehaviours=[];
var imageStreetPosed = false;
var heightMap=200;
var suppressImage;
var colorVectors = {
    "red": new BABYLON.Color3(1, 0, 0),
    "yellow": new BABYLON.Color3(1, 1, 0),
    "blue": new BABYLON.Color3(0, 0, 1)
}
var decorVectors = {
    "maxSpeed": [],
    "maxForce": [],
    "velocity": []
}
var checkboxGUI = []
var paramsGUI = [
    { name: "maxSpeed", anim: 15, weight: 15 },
    { name: "maxForce", anim: 30, weight: 30 },
    { name: "mass", anim: 60, weight: 60 },
    { name: "desiredSeparation", anim: 50, weight: 50 }
]




var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {


    

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 3000, 60), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var gridMaterial = new BABYLON.GridMaterial("grid", scene);
    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 3000, height: 3000 }, scene);
    gridMaterial.gridRatio = 10


    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red


    var materialTileMap = new BABYLON.StandardMaterial("shiptx1", scene);
    materialTileMap.diffuseColor = new BABYLON.Color3(0, 0, 1); //Red

    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    UiPanel = new BABYLON.GUI.StackPanel();

    window.addEventListener("mousemove", function () {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        mouseTarget = pickResult.pickedPoint

    });


    UiPanel.width = "220px";
    UiPanel.fontSize = "14px";
    UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(UiPanel);


    GUI.displayChangeParametersEntities("70px", paramsGUI, entities, UiPanel)
    GUI.displayVectors(decorVectors, checkboxGUI, UiPanel, colorVectors)



    // BUTTONS TO STOP / START / SELECT ENTITIES
    var buttonSelect = GUI.createButton("Select Entity", "10px", "100px", "100px", "white", "orange");
    var buttonStart = GUI.createButton("Start new entity", "10px", "100px", "100px", "white", "green");
    var buttonStop = GUI.createButton("Stop all entities", "10px", "100px", "100px", "white", "red");

    UiPanel.addControl(buttonStart)
    UiPanel.addControl(buttonSelect)
    UiPanel.addControl(buttonStop)


    buttonStart.onPointerDownObservable.add(function () {
        var target;
        var entity;

        entity = BABYLON.Mesh.CreateCylinder("entity", 2, 0, 1, 6, 1, scene, false);
        entity.scaling = new BABYLON.Vector3(20, 20, 20)
        entity.material = materialShip;
        entity.checkCollisions = true
        entity.position.y = editMap.map[0].road.position.y
        entity.position.z = editMap.map[0].road.position.z
        entity.position.x = editMap.map[0].road.position.x-100

        var vehicle = new Vehicle(entity)

        target = BABYLON.Mesh.CreateCylinder("target", 2, 0, 1, 6, 1, scene, false);
        target.scaling = new BABYLON.Vector3(7, 7, 7)
        target.material = materialShip;
        target.checkCollisions = true
        target.position.y = 1

        var vehicleTarget = new Vehicle(target)

        var pathBehaviour = new PathBehaviour(editMap.concMap,vehicleTarget)
        pathBehaviour.radiusPath = 40

        vehicle.maxSpeed = paramsGUI[0].anim.toFixed(2)
        vehicle.maxForce = paramsGUI[1].anim.toFixed(2)
        vehicle.mass = paramsGUI[2].anim.toFixed(2)
        vehicle.desiredSeparation = paramsGUI[3].anim.toFixed(2)


        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(vehicle.name, 0, 40, "bold 36px Arial", "red", "transparent", true);

        var xChar = Utilities.createText(dynamicTexture, 70, scene);
        xChar.position = vehicle.position.clone()

        nameEntities.push(xChar);


        //Vector of seek behaviours
        var decorMaxSpeed = new DecorVector(vehicle.mesh.position, 100, scene)
        var decorMaxForce = new DecorVector(vehicle.mesh.position, 100, scene)
        var decorVelocity = new DecorVector(vehicle.mesh.position, 100, scene)
        decorMaxSpeed.create(colorVectors[Object.keys(colorVectors)[0]], false)
        decorMaxForce.create(colorVectors[Object.keys(colorVectors)[1]], false)
        decorVelocity.create(colorVectors[Object.keys(colorVectors)[2]], false)
        decorVectors["maxSpeed"].push(decorMaxSpeed)
        decorVectors["maxForce"].push(decorMaxForce)
        decorVectors["velocity"].push(decorVelocity)


        targets.push(vehicleTarget)
        entities.push(vehicle)
        pathBehaviours.push(pathBehaviour)

        entitiesCreated = true
        buttonSelect.isEnabled = true;

        //Update the checkbox GUI 
        checkboxGUI.forEach(child => {
            child.isEnabled = true
            checkboxGUI.forEach(child => {
                if (child.isChecked) {
                    if (decorVectors[child.name].length > 0) {
                        decorVectors[child.name].forEach(v => {
                            v.meshVisualization.isVisible = true
                        })
                    }
                }
            })
        })

    });

    buttonStop.onPointerDownObservable.add(function () {

        for (let i = 0; i < entities.length; i++) {
            entities[i].mesh.dispose();
            nameEntities[i].dispose();
            targets[i].mesh.dispose();

        }

        for (var decorVector in decorVectors) {
            decorVectors[decorVector].forEach(dc => {
                dc.meshVisualization.dispose()
            })
        }

        entities = []
        targets = []
        nameEntities = []
        decorVectors = {
            "maxSpeed": [],
            "maxForce": [],
            "velocity": []
        }
        entitiesCreated = false
        selectedEntity = false;
        checkboxGUI.forEach(checkbox => {
            if (checkbox.isEnabled === true) {
                checkbox.isEnabled = false
                checkbox.isChecked = false
            }

            checkbox.onIsCheckedChangedObservable.add(function (value) {
                if (value) {
                    checkboxGUI.forEach(child => {
                        if (child.isChecked) {
                            if (decorVectors[child.name].length > 0) {
                                decorVectors[child.name].forEach(v => {

                                    v.meshVisualization.isVisible = true

                                })
                            }
                        }
                    })

                } else {
                    checkboxGUI.forEach(child => {
                        if (child.isChecked === false) {
                            if (decorVectors[child.name].length > 0) {
                                decorVectors[child.name].forEach(v => {
                                    v.meshVisualization.isVisible = false
                                })
                            }
                        }
                    })

                }
            });

        })


    });


    buttonSelect.onPointerDownObservable.add(function () {

        //HANDLE SELECTION AT CLICK
        entities.forEach(entity => {
            entity.mesh.actionManager = new BABYLON.ActionManager(scene);
            entity.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnDoublePickTrigger, function (ev) {

                if (UiPanelSelection !== undefined) {
                    UiPanelSelection.dispose();
                    UiPanelSelection = undefined;

                }

                //UI SELECTION 
                UiPanelSelection = new BABYLON.GUI.StackPanel();
                UiPanelSelection.width = "220px";
                UiPanelSelection.fontSize = "14px";
                UiPanelSelection.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                UiPanelSelection.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                advancedTexture.addControl(UiPanelSelection);


                var inputName = new BABYLON.GUI.InputText();
                inputName.width = 0.2;
                inputName.maxWidth = 0.2;
                inputName.height = "50px";
                inputName.width = "100px";
                inputName.paddingTop = "10px";
                inputName.text = entity.name
                inputName.color = "orange";
                inputName.background = "grey";
                inputName.verticalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                UiPanelSelection.addControl(inputName);

                var paramsGUISelection = [...paramsGUI]

                GUI.displayChangeParametersEntity("30px", paramsGUISelection, entity.t, UiPanelSelection)


                var buttonDone = BABYLON.GUI.Button.CreateSimpleButton("buttonDone", "DONE");
                buttonDone.paddingTop = "10px";
                buttonDone.width = "50px";
                buttonDone.height = "50px";
                buttonDone.color = "white";
                buttonDone.background = "green";

                UiPanelSelection.addControl(buttonDone);

                buttonDone.onPointerDownObservable.add(function () {

                    selectedEntity = false
                    UiPanelSelection.dispose()
                    UiPanelSelection = undefined


                    var materialSelected = new BABYLON.StandardMaterial("selectedEntity", scene);
                    materialSelected.diffuseColor = new BABYLON.Color3(1, 0, 0);

                    entity.name = inputName.text
                    var materialSelected = new BABYLON.StandardMaterial("selectedEntity", scene);
                    materialSelected.diffuseColor = new BABYLON.Color3(1, 0, 0);
                    for (let i = 0; i < nameEntities.length; i++) {
                        Utilities.updateTextMesh(entities[i].name, nameEntities[i], scene);
                        entities[i].mesh.material = materialSelected

                    }
                });




            }));
        });
        selectedEntity = true;
        var materialSelected = new BABYLON.StandardMaterial("selectedEntity", scene);
        materialSelected.diffuseColor = new BABYLON.Color3(0, 0, 1);

        entities.forEach(p => {
            p.mesh.material = materialSelected

        })


    });


    UiPanelEditMap = new BABYLON.GUI.StackPanel();
    UiPanelEditMap.width = "220px";
    UiPanelEditMap.fontSize = "14px";
    UiPanelEditMap.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    UiPanelEditMap.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(UiPanelEditMap);



    var buttonStreetBackWard = GUI.createButton("Street back", "10px", "100px", "100px", "white", "black")
    buttonStreetBackWard.isVisible = false;
    buttonStreetBackWard.isPointerBlocker = true;
    UiPanelEditMap.addControl(buttonStreetBackWard)

    buttonStreetBackWard.onPointerDownObservable.add(function () {
        direction = Direction.BACK;
        editMap.handlePointerClick(editMap.map, direction,scene,editMap.concMap)

    });



    var buttonStreetForward = GUI.createButton("Street Forward", "10px", "100px", "100px", "white", "black")
    buttonStreetForward.isVisible = false;
    buttonStreetForward.isPointerBlocker = true;
    UiPanelEditMap.addControl(buttonStreetForward)

    buttonStreetForward.onPointerDownObservable.add(function () {
        direction = Direction.FORWARD
        
        editMap.handlePointerClick(editMap.map, direction,scene,editMap.concMap)

    });

    var buttonStreetLeft = GUI.createButton("Street Left", "10px", "100px", "100px", "white", "black")

    buttonStreetLeft.isPointerBlocker = true;
    buttonStreetLeft.isVisible = false;
    UiPanelEditMap.addControl(buttonStreetLeft)

    buttonStreetLeft.onPointerDownObservable.add(function () {
        direction = Direction.LEFT;
        
        editMap.handlePointerClick(editMap.map, direction,scene,editMap.concMap)

    });

    var buttonStreetRight = GUI.createButton("Street Right", "10px", "100px", "100px", "white", "black")
    buttonStreetRight.isVisible = false;

    buttonStreetRight.isPointerBlocker = true;
    UiPanelEditMap.addControl(buttonStreetRight)

    buttonStreetRight.onPointerDownObservable.add(function () {
        direction = Direction.RIGHT;
        
        editMap.handlePointerClick(editMap.map, direction,scene,editMap.concMap)

    });



    var buttonEdit = GUI.createButton("Edit map", "10px", "100px", "100px", "white", "green")
    UiPanelEditMap.addControl(buttonEdit)

    var buttonQuitEdit = GUI.createButton("Quit edit map", "10px", "100px", "100px", "white", "orange")
    buttonQuitEdit.isVisible = false;
    UiPanelEditMap.addControl(buttonQuitEdit)


    var buttonSuppress = GUI.createButton("Suppress street", "10px", "100px", "100px", "white", "red")
    buttonSuppress.isVisible = false;
    UiPanelEditMap.addControl(buttonSuppress)

    
    
    var buttonSaveMap = GUI.createButton("Save map", "10px", "100px", "100px", "white", "purple")
    buttonSaveMap.isVisible = false;
    
    UiPanelEditMap.addControl(buttonSaveMap)

    
    buttonSaveMap.onPointerDownObservable.add(function () {
        console.log(editMap.map)

        var map =[]
        editMap.map.forEach(road=>{
            map.push({"direction":road.direction,"height":road.height,"pathPoint":road.pathPoint,"position":road.position})
        });
        Utilities.saveData(map, "mapRace.json");

    });




    buttonEdit.onPointerDownObservable.add(function () {
        buttonQuitEdit.isVisible = true;
        buttonSuppress.isVisible = true;
        buttonStreetBackWard.isVisible = true;
        buttonStreetForward.isVisible = true;
        buttonStreetLeft.isVisible = true;
        buttonStreetRight.isVisible = true;
        buttonSelect.isEnabled = false;
        buttonStop.isEnabled = false;
        buttonStart.isEnabled = false;
        buttonSaveMap.isVisible=false;
        for (let i = 0; i < entities.length; i++) {
            entities[i].mesh.dispose();
            nameEntities[i].dispose();
            targets[i].mesh.dispose();

        }


        if (editMap === undefined) {
            editMap = new EditMap(3000, 3000, 200, scene)
            editMap.createEditMap(gridMaterial)



        } else {
            editMap.edit.forEach(tileMap => {
                tileMap.box.isVisible = true;
            })
        }


        editMap.handlePointerHover();

    });


    buttonQuitEdit.onPointerDownObservable.add(function () {
        buttonQuitEdit.isVisible = false;
        buttonSuppress.isVisible = false;

        buttonStreetBackWard.isVisible = false;
        buttonStreetForward.isVisible = false;
        buttonStreetLeft.isVisible = false;
        buttonStreetRight.isVisible = false;
        buttonSelect.isEnabled = true;
        buttonStop.isEnabled = true;
        buttonStart.isEnabled = true;
      

       editMap.map.forEach(road=>{
            road.pathPoint.forEach(p=>{
                var direction = road.direction
                var path = p
                mapRoads.push({direction,path})
            })
        })

        if(editMap.map.length>0){
            buttonSelect.isEnabled = true;
            buttonStop.isEnabled = true;
            
            buttonSaveMap.isVisible=true;
            
        }
    
        editMap.delete()

    })

    buttonSuppress.onPointerDownObservable.add(function () {
        suppressImage = true
        editMap.handleSuppressClick(editMap, editMap.edit, editMap.map, editMap.scene, editMap.concMap)

    });


    scene.registerAfterRender(function () {

        if (imageStreet != undefined && imageStreetPosed === false && mouseTarget != undefined) {
            imageStreet[0].position = mouseTarget
        }


        if (entitiesCreated === true && selectedEntity === false) {
            for (let i = 0; i < entities.length; i++) {
                // Update entities

                entities[i].position.y = 1
                entities[i].rotate()
                entities[i].separate(entities)
                entities[i].applyBehaviour(pathBehaviours[i])
                entities[i].update()

                // Update targets
                var directionRotation = (targets[i].velocity.clone()).normalize()
                directionRotation = Math.atan2(directionRotation.z, -directionRotation.x)
                targets[i].mesh.position = pathBehaviours[i].targetP.clone()
                targets[i].update()

                //Update name position
                nameEntities[i].position = entities[i].position.clone()
                nameEntities[i].rotation.y = directionRotation

                //Update the visualization of vectors
                decorVectors["maxSpeed"][i].update(entities[i].desired)
                decorVectors["maxForce"][i].update(entities[i].steer)
                decorVectors["velocity"][i].update(entities[i].velocity)
            }
        }


    });



    return scene;

};

engine = createDefaultEngine();
if (!engine) throw 'engine should not be null.';
scene = createScene();

engine.runRenderLoop(function () {
    if (scene) {
        scene.render();
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});