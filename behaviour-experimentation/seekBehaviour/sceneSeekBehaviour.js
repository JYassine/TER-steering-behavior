import SeekBehaviour from "./SeekBehaviour.js";
import DecorBehaviour from "../DecorBehaviour.js";
import Utilities from "../Utilities.js";
import GUI from "../GUI.js"

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var pursuerCreated = false;
var selectedEntity = false;
var pursuers = []
var checkboxGUI = []
var namesPursuers = [];
var UiPanelSelection;
var UiPanel;
var advancedTexture;
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
var paramsGUI = [
    { name: "maxSpeed", anim: 15, weight: 15 },
    { name: "maxForce", anim: 30, weight: 30 },
    { name: "mass", anim: 200, weight: 200 }
]





var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(100, 200, 600), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

    /** Target */
    var target = BABYLON.MeshBuilder.CreateBox("myBox", { height: 60, width: 60, depth: 60 }, scene);
    target.position.y = 25
    target.material = materialShip


    // UI
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    UiPanel = new BABYLON.GUI.StackPanel();

    
    UiPanel.width = "220px";
    UiPanel.fontSize = "14px";
    UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(UiPanel);

    GUI.displayChangeParametersEntities("70px",paramsGUI, pursuers, UiPanel)
    GUI.displayVectors(decorVectors, checkboxGUI, UiPanel, colorVectors)

    
    // BUTTONS TO STOP / START / SELECT ENTITIES
    var buttonSelect = GUI.createButton("Select Entity","10px","100px","100px","white","orange");
    var buttonStart = GUI.createButton("Start new entity","10px","100px","100px","white","green");
    var buttonStop = GUI.createButton("Stop all entities","10px","100px","100px","white","red");

    UiPanel.addControl(buttonStart)
    UiPanel.addControl(buttonSelect)
    UiPanel.addControl(buttonStop)

    buttonStart.onPointerDownObservable.add(function () {
        /** Pursuer */
        var pursuer = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
        pursuer.scaling = new BABYLON.Vector3(20, 20, 20)
        pursuer.material = materialShip;
        pursuer.checkCollisions = true
        pursuer.position.y = 20
        pursuer.position.x += 500

        /** Seek behaviour */
        var seekBehaviour = new SeekBehaviour(pursuer)
        seekBehaviour.maxSpeed = paramsGUI[0].anim.toFixed(2)
        seekBehaviour.maxForce = paramsGUI[1].anim.toFixed(2)
        seekBehaviour.mass = paramsGUI[2].anim.toFixed(2)


        var xChar = Utilities.createText(seekBehaviour.name, "red", 70,scene);
        xChar.position = seekBehaviour.position.clone()

        namesPursuers.push(xChar);


        //Vector of seek behaviours
        var decorMaxSpeed = new DecorBehaviour(seekBehaviour.mesh.position)
        var decorMaxForce = new DecorBehaviour(seekBehaviour.mesh.position)
        var decorVelocity = new DecorBehaviour(seekBehaviour.mesh.position)
        decorMaxSpeed.createVector(100, colorVectors[Object.keys(colorVectors)[0]], scene, false)
        decorMaxForce.createVector(100, colorVectors[Object.keys(colorVectors)[1]], scene, false)
        decorVelocity.createVector(100, colorVectors[Object.keys(colorVectors)[2]], scene, false)
        decorVectors["maxSpeed"].push(decorMaxSpeed)
        decorVectors["maxForce"].push(decorMaxForce)
        decorVectors["velocity"].push(decorVelocity)


        pursuers.push(seekBehaviour)
        pursuerCreated = true
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
        pursuers.forEach(p => {
            p.getMesh().dispose()
        });
        for (var decorVector in decorVectors) {
            decorVectors[decorVector].forEach(dc => {
                dc.meshVisualization.dispose()
            })
        }
        namesPursuers.forEach(name => {
            name.dispose()
        })

        pursuers = []
        namesPursuers = []
        decorVectors = {
            "maxSpeed": [],
            "maxForce": [],
            "velocity": []
        }
        pursuerCreated = false
        selectedEntity = false;
        checkboxGUI.forEach(child => {
            if (child.isEnabled === true) {
                child.isEnabled = false
                child.isChecked = false
            }
        })
    });

    buttonSelect.onPointerDownObservable.add(function () {

        //HANDLE SELECTION AT CLICK
        pursuers.forEach(entity => {
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

                    pursuers.forEach(p => {
                        p.mesh.material = materialSelected
                        entity.name = inputName.text

                    })
                });




            }));
        });
        selectedEntity = true;
        var materialSelected = new BABYLON.StandardMaterial("selectedEntity", scene);
        materialSelected.diffuseColor = new BABYLON.Color3(0, 0, 1);

        pursuers.forEach(p => {
            p.mesh.material = materialSelected

        })


    });


    //UPDATE PURSUERS
    var time = 0;
    var radius = 300
    scene.registerAfterRender(function () {
        target.position.x = Math.cos(time / 25) * Math.sin((time / 25) * 0.8) * radius;
        target.position.z = Math.sin((time / 25) * 0.5) * radius;


        if (pursuerCreated === true && selectedEntity === false) {
            for (let i = 0; i < pursuers.length; i++) {
                var directionRotation = (pursuers[i].velocity.clone()).normalize()
                directionRotation = Math.atan2(directionRotation.z, -directionRotation.x)

                // Update pursuers
                pursuers[i].mesh.rotation.x = Math.PI / 2;
                pursuers[i].mesh.rotation.z = Math.PI / 2;
                pursuers[i].mesh.rotation.y = directionRotation
                pursuers[i].run(target)
                pursuers[i].update()

                //Update name position
                namesPursuers[i].dispose()
                namesPursuers[i] = Utilities.createText(pursuers[i].name, "red", 70,scene);
                namesPursuers[i].position = pursuers[i].position.clone()
                namesPursuers[i].rotation.y = directionRotation

                //Update the visualization of vectors
                decorVectors["maxSpeed"][i].update(pursuers[i].desired)
                decorVectors["maxForce"][i].update(pursuers[i].steer)
                decorVectors["velocity"][i].update(pursuers[i].velocity)

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