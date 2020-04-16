import SeekBehaviour from "./SeekBehaviour.js";
import DecorBehaviour from "../DecorBehaviour.js";
import Utilities from "../Utilities.js";
import WanderBehaviour from "../wanderBehaviour/WanderBehaviour.js"
import GUI from "../GUI.js"

var canvas = document.getElementById("renderCanvas");
var engine = null;
var scene = null;
var pursuerCreated = false;
var selectedEntity = false;
var pursuers = []
var checkboxGUI = []
var namesPursuers = [];
var mouseTargeted = false;
var wanderTargeted = false;
var wanderTarget;
var UiPanelWander;
var UiPanelSelection;
var UiPanelTarget;
var circlesWanders = []
var mouseTarget;
var buttonTarget;
var mouseText;
var checkboxMouse;
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
    "velocity": [],
}

var decorVectorsWander = {

    "wanderDistance": [],
    "wanderRadius": []
}
var paramsGUI = [
    { name: "maxSpeed", anim: 15, weight: 15 },
    { name: "maxForce", anim: 30, weight: 30 },
    { name: "mass", anim: 200, weight: 200 },
    { name: "desiredSeparation", anim: 300, weight: 300 }
]

var paramsGUIWander = [
    
    { name: "wanderDistance", anim: 10, weight: 10 },
    { name: "wanderRadius", anim: 2, weight: 2 },
    
    { name: "maxSpeed", anim: 6, weight: 6 },
    { name: "maxForce", anim: 30, weight: 30 }, 
]

var createCircleWanders = () => {

    var circle = BABYLON.MeshBuilder.CreateCylinder("cone", { diameter: 100, tessellation: 50 }, scene);

    var materialCircle = new BABYLON.StandardMaterial("shiptx1", scene);
    materialCircle.diffuseColor = new BABYLON.Color3(0, 1, 0); //green
    circle.material = materialCircle

    circle.isVisible = false;

    circlesWanders.push(circle)

}




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
    var target = new BABYLON.Vector3(0, 0, 0);


    // UI
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    UiPanel = new BABYLON.GUI.StackPanel();


    UiPanel.width = "220px";
    UiPanel.fontSize = "14px";
    UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(UiPanel);

    GUI.displayChangeParametersEntities("40px", paramsGUI, pursuers, UiPanel)
    GUI.displayVectors(decorVectors, checkboxGUI, UiPanel, colorVectors)


    // BUTTONS TO STOP / START / SELECT ENTITIES
    var buttonSelect = GUI.createButton("Select seek Entity", "10px", "100px", "100px", "white", "orange");
    var buttonStart = GUI.createButton("Start new seek entity", "10px", "100px", "100px", "white", "green");
    var buttonStop = GUI.createButton("Stop all seek entities", "10px", "100px", "100px", "white", "red");

    UiPanel.addControl(buttonStart)
    UiPanel.addControl(buttonSelect)
    UiPanel.addControl(buttonStop)


    window.addEventListener("mousemove", function () {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (mouseTargeted) {
            mouseTarget = pickResult.pickedPoint
        } else {
            mouseTarget = new BABYLON.Vector3(0, 0, 0)
        }
    });


    buttonStart.onPointerDownObservable.add(function () {
        var pursuer;
        var seekBehaviour;

        /** Pursuer */
        pursuer = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
        pursuer.scaling = new BABYLON.Vector3(20, 20, 20)
        pursuer.material = materialShip;
        pursuer.checkCollisions = true
        pursuer.position.y = 20
        pursuer.position.x += 500

        /** Seek behaviour */
        seekBehaviour = new SeekBehaviour(pursuer)
        seekBehaviour.maxSpeed = paramsGUI[0].anim.toFixed(2)
        seekBehaviour.maxForce = paramsGUI[1].anim.toFixed(2)
        seekBehaviour.mass = paramsGUI[2].anim.toFixed(2)
        seekBehaviour.desiredSeparation = paramsGUI[3].anim.toFixed(2)



        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(seekBehaviour.name, 0, 40, "bold 36px Arial", "red", "transparent", true);
        var xChar = Utilities.createText(dynamicTexture, 70, scene);
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
                    if (decorVectors[child.name] !== undefined) {

                        decorVectors[child.name].forEach(v => {
                            v.meshVisualization.isVisible = true
                        })

                    }
                }
            })
        })

    });


    buttonStop.onPointerDownObservable.add(function () {


        for (let i = 0; i < pursuers.length; i++) {
            pursuers[i].getMesh().dispose()
            namesPursuers[i].dispose();
        }
        for (var decorVector in decorVectors) {
            decorVectors[decorVector].forEach(dc => {
                dc.meshVisualization.dispose()
            })
        }

        pursuers = []

        namesPursuers = []
        decorVectors = {
            "maxSpeed": [],
            "maxForce": [],
            "velocity": []
        }
        pursuerCreated = false
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

    buttonSelect.onPointerDownObservable.add(function () {

        //HANDLE SELECTION AT CLICK
        pursuers.forEach(entity => {

            entity.mesh.actionManager = new BABYLON.ActionManager(scene);
            entity.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, function (ev) {


                buttonTarget.isVisible = false;
                checkboxMouse.isVisible = false;
                mouseText.isVisible = false;

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

                    buttonTarget.isVisible = true;
                    checkboxMouse.isVisible = true;
                    mouseText.isVisible = true;

                    selectedEntity = false
                    UiPanelSelection.dispose()
                    UiPanelSelection = undefined

                    entity.name = inputName.text
                    var materialSelected = new BABYLON.StandardMaterial("selectedEntity", scene);
                    materialSelected.diffuseColor = new BABYLON.Color3(1, 0, 0);
                    for (let i = 0; i < namesPursuers.length; i++) {
                        Utilities.updateTextMesh(pursuers[i].name, namesPursuers[i], scene);

                        pursuers[i].mesh.material = materialSelected

                    }



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

    // UI TARGET
    UiPanelTarget = new BABYLON.GUI.StackPanel();
    UiPanelTarget.width = "200px";
    UiPanelTarget.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    UiPanelTarget.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(UiPanelTarget);


    buttonTarget = GUI.createButton("Create wander target", "10px", "100px", "100px", "white", "green");
    buttonTarget.paddingBottom = "10px"
    UiPanelTarget.addControl(buttonTarget)


    checkboxMouse = new BABYLON.GUI.Checkbox();
    checkboxMouse.width = "30px";
    checkboxMouse.height = "30px";
    checkboxMouse.isChecked = false;
    checkboxMouse.color = "green"
    UiPanelTarget.addControl(checkboxMouse)

    buttonTarget.onPointerDownObservable.add(function () {
        if (wanderTarget != undefined) {
            wanderTarget.mesh.dispose()
            wanderTarget = undefined
        }
        var wTarget = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
        wTarget.scaling = new BABYLON.Vector3(20, 20, 20)
        wTarget.material = materialShip;
        wTarget.checkCollisions = true
        wTarget.position.y = 0
        wanderTarget = new WanderBehaviour(wTarget)

        createCircleWanders()
        var decorDistance = new DecorBehaviour(wanderTarget.position)
        var decorRadius = new DecorBehaviour(circlesWanders[circlesWanders.length - 1].position)
        decorDistance.createVector(100, new BABYLON.Color3(1, 0, 0), scene, false)
        decorRadius.createVector(100, new BABYLON.Color3(0, 0, 1), scene, false)

        decorVectorsWander["wanderDistance"].push(decorDistance)
        decorVectorsWander["wanderRadius"].push(decorRadius)


        wanderTarget.wanderDistance = paramsGUIWander[0].anim.toFixed(2)
        wanderTarget.wanderRadius = paramsGUIWander[1].anim.toFixed(2)
        wanderTarget.maxSpeed=paramsGUIWander[2].anim.toFixed(2)
        wanderTarget.maxForce = paramsGUIWander[3].anim.toFixed(2)


        wanderTargeted = true;
        mouseTargeted = false;
        checkboxMouse.isChecked = false

        if (UiPanelWander === undefined) {
            UiPanelWander = new BABYLON.GUI.StackPanel();
            UiPanelWander.width = "220px";
            UiPanelWander.fontSize = "14px";
            UiPanelWander.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            UiPanelWander.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(UiPanelWander);


            GUI.displayChangeParametersEntity("40px", paramsGUIWander, wanderTarget, UiPanelWander)
            GUI.displayVectors(decorVectorsWander, checkboxGUI, UiPanelWander, colorVectors)

        }

    });



    mouseText = new BABYLON.GUI.TextBlock();
    mouseText.text = "target the mouse"
    mouseText.height = "20px"
    mouseText.marginRight = "5px";
    mouseText.fontWeight = "bold"
    mouseText.color = "green"
    UiPanelTarget.addControl(mouseText)

    checkboxMouse.onIsCheckedChangedObservable.add(function (value) {
        if (value) {
            mouseTargeted = true;
            wanderTargeted = false;
            if (wanderTarget != undefined) {

                wanderTarget.mesh.dispose()
                wanderTarget = undefined
                circlesWanders[0].dispose()
                circlesWanders = []
                checkboxGUI.length -= 2
                for (var decorVector in decorVectorsWander) {
                    decorVectorsWander[decorVector].forEach(dc => {
                        dc.meshVisualization.dispose()
                    })
                }
                decorVectorsWander = {
                    "wanderDistance": [],
                    "wanderRadius": []
                }

            }
            if (UiPanelWander != undefined) {

                UiPanelWander.dispose()
                UiPanelWander = undefined

            }
        } else {
            mouseTargeted = false;
        }
    });




    //UPDATE PURSUERS
    var time = 0;
    var radius = 300
    scene.registerAfterRender(function () {

        if (mouseTarget != undefined) {

            target.x = mouseTarget.x
            target.z = mouseTarget.z


        }

        if (wanderTargeted) {

            target.x = wanderTarget.position.x
            target.z = wanderTarget.position.z

            var directionRotation = (wanderTarget.velocity.clone()).normalize()
            var dR = Math.atan2(directionRotation.z, -directionRotation.x)

            wanderTarget.mesh.rotation.x = Math.PI / 2;
            wanderTarget.mesh.rotation.z = Math.PI / 2;
            wanderTarget.mesh.rotation.y = dR


            wanderTarget.run(target)
            wanderTarget.update()

            decorVectorsWander["wanderDistance"][0].update(wanderTarget.wanderCenter)
            var directionRotationCenter = (wanderTarget.wanderCenter.clone()).normalize()
            var drCenter = Math.atan2(directionRotationCenter.z, -directionRotationCenter.x)


            // Update the visualization of circles 
            circlesWanders[0].position = wanderTarget.wanderCenter.clone().add(wanderTarget.position.clone())
            circlesWanders[0].locallyTranslate(new BABYLON.Vector3(-28 * wanderTarget.wanderDistance, 0, 0))
            circlesWanders[0].rotation.y = drCenter
            if (checkboxGUI[4].isChecked) {
                circlesWanders[0].isVisible = true;
            } else {
                circlesWanders[0].isVisible = false;
            }


            decorVectorsWander["wanderRadius"][0].origin = circlesWanders[0].position.clone()
            decorVectorsWander["wanderRadius"][0].origin.y += 5
            decorVectorsWander["wanderRadius"][0].update(wanderTarget.displacement)



        }


        if (pursuerCreated === true && selectedEntity === false) {
            for (let i = 0; i < pursuers.length; i++) {
                var directionRotation = (pursuers[i].velocity.clone()).normalize()
                directionRotation = Math.atan2(directionRotation.z, -directionRotation.x)

                // Update pursuers  
                target.y = pursuers[i].position.y
                pursuers[i].mesh.rotation.x = Math.PI / 2;
                pursuers[i].mesh.rotation.z = Math.PI / 2;
                pursuers[i].mesh.rotation.y = directionRotation

                pursuers[i].separate(pursuers)
                pursuers[i].run(target)
                pursuers[i].update()



                //Update name position
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