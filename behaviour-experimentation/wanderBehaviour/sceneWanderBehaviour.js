import WanderBehaviour from "./WanderBehaviour.js";
import DecorVector from "../DecorVector.js";
import DecorCircle from "../DecorCircle.js";
import GUI from "../GUI.js";
import Utilities from "../Utilities.js";

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var entitiesCreated = false;

var selectedEntity = false;
var circlesWanders = []
var colorVectors = {
    "red": new BABYLON.Color3(1, 0, 0),
    "blue": new BABYLON.Color3(0, 0, 1)
}
var checkboxGUI = []
var entities = []
var nameEntities = []
var ground;
var target;
var UiPanel;
var UiPanelSelection;

var decorVectors = {
    "wanderDistance": [],
    "wanderRadius": []
}
var paramsGUI = [
    { name: "wanderDistance", anim: 10, weight: 10 },
    { name: "wanderRadius", anim: 2, weight: 2 },
    { name: "desiredSeparation", anim: 300, weight: 300 }
]


var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(100, 200, 600), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red


    //UI
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    UiPanel = new BABYLON.GUI.StackPanel();
    UiPanel.width = "220px";
    UiPanel.fontSize = "14px";
    UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(UiPanel);

    GUI.displayChangeParametersEntities("70px", paramsGUI, entities, UiPanel)

    /** ADD BUTTON TO CREATE NEW entity */


    var buttonSelect = GUI.createButton("Select Entity", "10px", "100px", "100px", "white", "orange");
    var buttonStart = GUI.createButton("Start new entity", "10px", "100px", "100px", "white", "green");
    var buttonStop = GUI.createButton("Stop all entities", "10px", "100px", "100px", "white", "red");

    // BUTTON START
    buttonStart.onPointerDownObservable.add(function () {

        var entity = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
        entity.scaling = new BABYLON.Vector3(20, 20, 20)
        entity.material = materialShip;
        entity.checkCollisions = true
        entity.position.y = 20


        
        var circle = new DecorCircle(BABYLON.Vector3.Zero(),50,scene)
        circle.create(new BABYLON.Color3(0,1,0),false)
        circlesWanders.push(circle)
        /** Seek behaviour */
        var wanderBehaviour = new WanderBehaviour(entity)
        var decorDistance = new DecorVector(wanderBehaviour.position,100,scene)
        var decorRadius = new DecorVector(circlesWanders[circlesWanders.length - 1].meshVisualization.position,100,scene)
        decorDistance.create(new BABYLON.Color3(1, 0, 0), false)
        decorRadius.create(new BABYLON.Color3(0, 0, 1), false)
        decorVectors["wanderDistance"].push(decorDistance)
        decorVectors["wanderRadius"].push(decorRadius)
        wanderBehaviour.wanderDistance = paramsGUI[0].anim.toFixed(2)
        wanderBehaviour.wanderRadius = paramsGUI[1].anim.toFixed(2)
        wanderBehaviour.desiredSeparation = paramsGUI[2].anim.toFixed(2)

        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(wanderBehaviour.name, 0, 40, "bold 36px Arial", "red", "transparent", true);
        var xChar = Utilities.createText(dynamicTexture, 70, scene);
        xChar.position = wanderBehaviour.position.clone()
        nameEntities.push(xChar);

        entities.push(wanderBehaviour)
        entitiesCreated = true
        checkboxGUI.forEach(child => {
            child.isEnabled = true
            checkboxGUI.forEach(child => {
                if (child.isChecked) {
                    if (decorVectors[child.name].length > 0) {
                        for (let i = 0; i < decorVectors[child.name].length; i++) {
                            decorVectors[child.name][i].meshVisualization.isVisible = true
                        }
                    }
                }
            })
        })

    });

    // BUTTON STOP
    buttonStop.onPointerDownObservable.add(function () {
        entities.forEach(p => {
            p.getMesh().dispose()
        });
        for (var decorVector in decorVectors) {
            decorVectors[decorVector].forEach(dc => {
                dc.meshVisualization.dispose()
            })
        }
        circlesWanders.forEach(circle => {
            circle.dispose()
        })

        if (UiPanelSelection != undefined) {
            UiPanelSelection.dispose()
        }
        entities = []
        circlesWanders = []
        decorVectors = {
            "wanderDistance": [],
            "wanderRadius": []
        }
        nameEntities.forEach(n => {
            n.dispose()
        })
        nameEntities = []
        entitiesCreated = false
        selectedEntity = false
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


    // BUTTON SELECT
    buttonSelect.onPointerDownObservable.add(function () {

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
                GUI.displayChangeParametersEntity("30px", paramsGUISelection, entity, UiPanelSelection)


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

                    entities.forEach(p => {
                        p.mesh.material = materialSelected
                        entity.name = inputName.text

                    })
                });




            }));
        });
        selectedEntity = true;
        var materialSelected = new BABYLON.StandardMaterial("selectedEntity", scene);
        materialSelected.diffuseColor = new BABYLON.Color3(0, 0, 1);

        entities.forEach(p => {
            p.mesh.material = materialSelected

        })

        Utilities.updateTextMesh(entities[i].name, namesPursuers[i], scene);

    });



    GUI.displayVectors(decorVectors, checkboxGUI, UiPanel, colorVectors)
    UiPanel.addControl(buttonStart)
    UiPanel.addControl(buttonSelect)
    UiPanel.addControl(buttonStop)

    var time = 0;
    scene.registerAfterRender(function () {

        if (entitiesCreated === true && selectedEntity === false) {
            for (let i = 0; i < entities.length; i++) {
                var directionRotation = (entities[i].velocity.clone()).normalize()
                var dR = Math.atan2(directionRotation.z, -directionRotation.x)

                // Update entities
                entities[i].mesh.rotation.x = Math.PI / 2;
                entities[i].mesh.rotation.z = Math.PI / 2;
                entities[i].mesh.rotation.y = dR
                entities[i].separate(entities)
                entities[i].run(target)
                entities[i].update()

                //Update the visualization of vectors
                decorVectors["wanderDistance"][i].update(entities[i].wanderCenter)
                decorVectors["wanderRadius"][i].origin = circlesWanders[i].meshVisualization.position.clone()
                decorVectors["wanderRadius"][i].origin.y += 5
                decorVectors["wanderRadius"][i].update(entities[i].displacement)

                // Update the visualization of circles 
                
                circlesWanders[i].update(entities[i])
                if (checkboxGUI[1].isChecked) {
                    circlesWanders[i].meshVisualization.isVisible = true;
                } else {
                    circlesWanders[i].meshVisualization.isVisible = false;
                }

                //Update name of entities
                nameEntities[i].dispose()
                nameEntities[i].position = entities[i].position.clone()
                nameEntities[i].rotation.y = dR

            }
        }
        time += 1

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