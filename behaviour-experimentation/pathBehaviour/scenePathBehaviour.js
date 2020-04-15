
import PathBehaviour from "./PathBehaviour.js";
import Behaviour from "../Behaviour.js";
import GUI from "../GUI.js"
import Utilities from "../Utilities.js"
import DecorBehaviour from "../DecorBehaviour.js"
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
var ts = []
var UiPanel;
var targets = []
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
    { name: "mass", anim: 200, weight: 200 },
    { name: "desiredSeparation", anim: 300, weight: 300 }
]


var createPath = () => {

    let mX = 600
    let mZ = 900
    var step = 100;
    var paths = []
    
    for (let i = -900; i <= -mX + mX / 2; i += step) {
        paths.push(new BABYLON.Vector3(i, 0, 0))
    }

    for (let i = 0; i < mZ / 2; i += step) {
        paths.push(new BABYLON.Vector3(-mX + mX / 2, 0, i))
    }

    for (let i = 0; i < mX / 2; i += step) {
        paths.push(new BABYLON.Vector3(i, 0, mX / 2))
    }


    for (let i = 200; i < mX; i += step) {
        paths.push(new BABYLON.Vector3(mX, 0, i))
    }

    for (let i = mX; i < mZ; i += step) {
        paths.push(new BABYLON.Vector3(i, 0, mX))
    }

    for (let i = mX; i >= -200; i -= step) {
        paths.push(new BABYLON.Vector3(mZ, 0, i))
    }

   

    return paths

}

var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(-1500, 2000, 40), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;


    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2000, height: 2000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    UiPanel = new BABYLON.GUI.StackPanel();


    UiPanel.width = "220px";
    UiPanel.fontSize = "14px";
    UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(UiPanel);


    GUI.displayChangeParametersEntities("70px", paramsGUI, ts, UiPanel)
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
        var pathBehaviourEntity;

        entity = BABYLON.Mesh.CreateCylinder("entity", 2, 0, 1, 6, 1, scene, false);
        entity.scaling = new BABYLON.Vector3(20, 20, 20)
        entity.material = materialShip;
        entity.checkCollisions = true
        entity.position.y = 1
        entity.position.z = -200
        entity.position.x = -900

        target = BABYLON.Mesh.CreateCylinder("target", 2, 0, 1, 6, 1, scene, false);
        target.scaling = new BABYLON.Vector3(7, 7, 7)
        target.material = materialShip;
        target.checkCollisions = true
        target.position.y = 1

        target = new Behaviour(target)
        pathBehaviourEntity = new PathBehaviour(entity)

        pathBehaviourEntity.t.maxSpeed = paramsGUI[0].anim.toFixed(2)
        pathBehaviourEntity.t.maxForce = paramsGUI[1].anim.toFixed(2)
        pathBehaviourEntity.t.mass = paramsGUI[2].anim.toFixed(2)
        pathBehaviourEntity.t.desiredSeparation = paramsGUI[3].anim.toFixed(2)


        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(pathBehaviourEntity.name, 0, 40, "bold 36px Arial", "red", "transparent", true);

        var xChar = Utilities.createText(dynamicTexture, 70, scene);
        xChar.position = pathBehaviourEntity.position.clone()

        nameEntities.push(xChar);


        //Vector of seek behaviours
        var decorMaxSpeed = new DecorBehaviour(pathBehaviourEntity.mesh.position)
        var decorMaxForce = new DecorBehaviour(pathBehaviourEntity.mesh.position)
        var decorVelocity = new DecorBehaviour(pathBehaviourEntity.mesh.position)
        decorMaxSpeed.createVector(100, colorVectors[Object.keys(colorVectors)[0]], scene, false)
        decorMaxForce.createVector(100, colorVectors[Object.keys(colorVectors)[1]], scene, false)
        decorVelocity.createVector(100, colorVectors[Object.keys(colorVectors)[2]], scene, false)
        decorVectors["maxSpeed"].push(decorMaxSpeed)
        decorVectors["maxForce"].push(decorMaxForce)
        decorVectors["velocity"].push(decorVelocity)


        targets.push(target)
        entities.push(pathBehaviourEntity)
        ts.push(pathBehaviourEntity.t)

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
            entities[i].getMesh().dispose();
            nameEntities[i].dispose();
            targets[i].getMesh().dispose();

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



    var paths = createPath()


    var track = BABYLON.MeshBuilder.CreateLines('track', { points: paths }, scene);

    track.color = new BABYLON.Color3(1, 0, 0);



    scene.registerAfterRender(function () {

        if (entitiesCreated === true && selectedEntity === false) {

            for (let i = 0; i < entities.length; i++) {

                // Update entities
                
                entities[i].separate(entities)
                entities[i].run(paths)
                var directionRotation1 = (entities[i].t.velocity.clone()).normalize()
                var rotationY = Math.atan2(directionRotation1.z, -directionRotation1.x)
                entities[i].t.mesh.rotation.x = Math.PI / 2
                entities[i].t.mesh.rotation.z = Math.PI / 2
                entities[i].t.mesh.rotation.y = rotationY
            
                entities[i].t.update()

                // Update targets
                var directionRotation = (targets[i].velocity.clone()).normalize()
                directionRotation = Math.atan2(directionRotation.z, -directionRotation.x)
                targets[i].mesh.position = entities[i].targetP.clone()
                targets[i].update()

                //Update name position
                nameEntities[i].position = entities[i].position.clone()
                nameEntities[i].rotation.y = directionRotation

                //Update the visualization of vectors
                decorVectors["maxSpeed"][i].update(entities[i].t.desired)
                decorVectors["maxForce"][i].update(entities[i].t.steer)
                decorVectors["velocity"][i].update(entities[i].t.velocity)
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