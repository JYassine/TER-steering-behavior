import AvoidanceBehavior from "./AvoidanceBehavior.js";
import SeekBehaviour from "../seekBehaviour/SeekBehaviour.js";
import DecorVector from "../GUI/DecorVector.js";
import Utilities from "../Utilities.js"
import GUI from "../GUI/GUI.js"
import Vehicle from "../Vehicle.js";

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
var UiPanel;
var targets = []
var avoidanceBehaviors=[];
var mouseTarget;
var colorVectors = {
    "red": new BABYLON.Color3(1, 0, 0),
    "yellow": new BABYLON.Color3(1, 1, 0),
    "blue": new BABYLON.Color3(0, 0, 1),
    "purple": new BABYLON.Color3(1, 0, 1)
}
var decorVectors = {
    "maxSpeed": [],
    "maxForce": [],
    "velocity": [],
    "avoidanceForce":[]
}
var checkboxGUI = []
var paramsGUI = [
    { name: "maxSpeed", anim: 15, weight: 15 },
    { name: "maxForce", anim: 30, weight: 30 },
    { name: "mass", anim: 60, weight: 60 },
    { name: "desiredSeparation", anim: 300, weight: 300 },
    {name: "maxSeeAhead", anim: 50, weight: 50  }
]


var listObstacles = []




var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(-1500, 500, 40), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;


    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2000, height: 2000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red


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
        var entity = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
        entity.scaling = new BABYLON.Vector3(20, 20, 20)
        entity.material = materialShip;
        entity.checkCollisions = true
        entity.position.y = 20
        entity.position.x += 500

        
        var avoidanceBehavior = new AvoidanceBehavior(listObstacles)
        var vehicle = new Vehicle(entity)
        /** Avoidance behavior */

        
        vehicle.maxSpeed = paramsGUI[0].anim.toFixed(2)
        vehicle.maxForce = paramsGUI[1].anim.toFixed(2)
        vehicle.mass = paramsGUI[2].anim.toFixed(2)
        vehicle.desiredSeparation = paramsGUI[3].anim.toFixed(2)
        avoidanceBehavior.maxSeeAhead= paramsGUI[4].anim.toFixed(2)


        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(entity.name, 0, 40, "bold 36px Arial", "red", "transparent", true);

        var xChar = Utilities.createText(dynamicTexture, 70, scene);
        xChar.position = entity.position.clone()

        nameEntities.push(xChar);

        

        //Vector of seek behaviours
        var decorMaxSpeed = new DecorVector(vehicle.mesh.position, 100, scene)
        var decorMaxForce = new DecorVector(vehicle.mesh.position, 100, scene)
        var decorVelocity = new DecorVector(vehicle.mesh.position, 100, scene)
        
        var decorAvoidance = new DecorVector(vehicle.mesh.position, 100, scene)
        decorMaxSpeed.create(colorVectors[Object.keys(colorVectors)[0]], false)
        decorMaxForce.create(colorVectors[Object.keys(colorVectors)[1]], false)
        decorVelocity.create(colorVectors[Object.keys(colorVectors)[2]], false)
        
        decorAvoidance.create(colorVectors[Object.keys(colorVectors)[3]], false)
        decorVectors["maxSpeed"].push(decorMaxSpeed)
        decorVectors["maxForce"].push(decorMaxForce)
        decorVectors["velocity"].push(decorVelocity)
        decorVectors["avoidanceForce"].push(decorAvoidance)

        entities.push(vehicle)
        avoidanceBehaviors.push(avoidanceBehavior)

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

    buttonSelect.onPointerDownObservable.add(function () {

        //HANDLE SELECTION AT CLICK
        entities.forEach(entity => {

            entity.mesh.actionManager = new BABYLON.ActionManager(scene);
            entity.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, function (ev) {


                if (UiPanelSelection !== undefined) {
                    UiPanelSelection.dispose();
                    UiPanelSelection = undefined;

                }

                //UI SELECTION 
                UiPanelSelection = new BABYLON.GUI.StackPanel();
                UiPanelSelection.width = "220px";
                UiPanelSelection.fontSize = "14px";
                UiPanelSelection.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                UiPanelSelection.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
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

                GUI.displayChangeParametersEntity("30px", paramsGUISelection, entity, UiPanelSelection)


                var buttonDone = BABYLON.GUI.Button.CreateSimpleButton("buttonDone", "DONE");
                buttonDone.paddingTop = "10px";
                buttonDone.width = "50px";
                buttonDone.height = "50px";
                buttonDone.color = "white";
                buttonDone.background = "green";

                UiPanelSelection.addControl(buttonDone);


                buttonDone.onPointerDownObservable.add(function (e) {

                    selectedEntity = false
                    UiPanelSelection.dispose()
                    UiPanelSelection = undefined
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

    buttonStop.onPointerDownObservable.add(function () {


        for (let i = 0; i < entities.length; i++) {
            entities[i].mesh.dispose()
            nameEntities[i].dispose();
        }
        for (var decorVector in decorVectors) {
            decorVectors[decorVector].forEach(dc => {
                dc.meshVisualization.dispose()
            })
        }

        entities = []

        nameEntities = []
        decorVectors = {
            "maxSpeed": [],
            "maxForce": [],
            "velocity": [],
            "avoidanceForce" : []
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
                            decorVectors[child.name].forEach(v => {

                                v.meshVisualization.isVisible = true

                            })
                        }
                    })

                } else {
                    checkboxGUI.forEach(child => {
                        if (child.isChecked === false) {
                            if (decorVectors[child.name] !== undefined) {

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



    for (let i = 0; i < 10; i++) {

        var mySphere = BABYLON.MeshBuilder.CreateSphere("mySphere", { diameter: 10, diameterX: 10 }, scene);
        mySphere.scaling = new BABYLON.Vector3(10, 10, 10)
        mySphere.material = materialShip;
        mySphere.position.y = 0
        mySphere.position.x = Utilities.getRandom(-1000, 2000)
        mySphere.position.z = Utilities.getRandom(-1000, 2000)
        listObstacles[i] = mySphere
    }



    scene.registerAfterRender(function () {

        if (mouseTarget != undefined && selectedEntity===false) {

            for (let i = 0; i < entities.length; i++) {
                mouseTarget.y = entities[i].mesh.position.y

                entities[i].separate(entities)
                entities[i].rotate()
                entities[i].applyBehaviour(new SeekBehaviour(mouseTarget))
                entities[i].applyBehaviour(avoidanceBehaviors[i])
                entities[i].update()
                
                
                var directionRotation = (entities[i].velocity.clone()).normalize()
                var dR = Math.atan2(directionRotation.z, -directionRotation.x)
                    
                //Update name position
                nameEntities[i].position = entities[i].position.clone()
                nameEntities[i].rotation.y = dR

                //Update the visualization of vectors
                decorVectors["maxSpeed"][i].update(entities[i].desired)
                decorVectors["maxForce"][i].update(entities[i].steer)
                decorVectors["velocity"][i].update(entities[i].velocity)
                decorVectors["avoidanceForce"][i].update(avoidanceBehaviors[i].avoidanceForce)

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