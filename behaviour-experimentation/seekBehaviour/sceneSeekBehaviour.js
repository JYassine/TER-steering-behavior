import SeekBehaviour from "./SeekBehaviour.js";
import DecorBehaviour from "../DecorBehaviour.js";

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var pursuerCreated = false;
var selectedEntity = false;
var pursuers = []
var checkboxGUI = []
var UiPanelSelection;
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
    { name: "steeringForce", anim: 30, weight: 30 },
    { name: "mass", anim: 200, weight: 200 }
]


var paramsPursuer = {
    "maxSpeed": paramsGUI[0].anim,
    "steeringForce": paramsGUI[1].anim,
    "mass": paramsGUI[2].anim
}

var paramsGUISelection = [
    { name: "maxSpeed", anim: 15, weight: 15 },
    { name: "steeringForce", anim: 30, weight: 30 },
    { name: "mass", anim: 200, weight: 200 }
]


var paramsPursuerSelection = {
    "maxSpeed": paramsGUI[0].anim,
    "steeringForce": paramsGUI[1].anim,
    "mass": paramsGUI[2].anim
}



var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(100, 200, 600), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;


    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

    /** Target */
    var target = BABYLON.MeshBuilder.CreateBox("myBox", { height: 60, width: 60, depth: 60 }, scene);
    target.position.y = 25
    target.material = materialShip

    //UI

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var UiPanel = new BABYLON.GUI.StackPanel();
    UiPanel.width = "220px";
    UiPanel.fontSize = "14px";
    UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(UiPanel);

    paramsGUI.forEach((param) => {
        var header = new BABYLON.GUI.TextBlock();
        header.text = param.name + ":" + param.anim
        header.height = "70px";
        header.color = "yellow";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        header.paddingTop = "10px";

        UiPanel.addControl(header);

        var slider = new BABYLON.GUI.Slider();

        slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        slider.minimum = 0;
        slider.maximum = 1;
        slider.color = "green";
        slider.value = param.anim;
        slider.height = "20px";
        slider.width = "205px";
        UiPanel.addControl(slider);
        slider.onValueChangedObservable.add((v) => {
            param.anim = v * param.weight;
            paramsPursuer = {
                "maxSpeed": paramsGUI[0].anim,
                "steeringForce": paramsGUI[1].anim,
                "mass": paramsGUI[2].anim
            }
            header.text = param.name + ":" + param.anim.toFixed(2);
            pursuers.forEach(p => {
                p.maxSpeed = paramsPursuer["maxSpeed"]
                p.maxForce = paramsPursuer["steeringForce"]
                p.mass = paramsPursuer["mass"]
            })
        })
    });


    // GUI VISUALIZATION OF VECTORS

    var vectorsHeader = new BABYLON.GUI.TextBlock();
    vectorsHeader.text = "SHOW VECTORS "
    vectorsHeader.height = "70px"
    vectorsHeader.marginRight = "5px";
    vectorsHeader.fontWeight = "bold"
    vectorsHeader.color = "yellow";
    vectorsHeader.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;


    UiPanel.addControl(vectorsHeader);

    let i = 0;
    for (var vectorName in decorVectors) {

        var checkbox = new BABYLON.GUI.Checkbox();
        checkbox.width = "30px";
        checkbox.height = "30px";
        checkbox.name = vectorName
        checkbox.isChecked = false;
        checkbox.color = Object.keys(colorVectors)[i];
        checkbox.isEnabled = false;

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

        var vectorText = new BABYLON.GUI.TextBlock();
        vectorText.text = vectorName
        vectorText.height = "20px"
        vectorText.marginRight = "5px";
        vectorText.fontWeight = "bold"
        vectorText.color = Object.keys(colorVectors)[i]
        vectorText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;



        UiPanel.addControl(checkbox);
        UiPanel.addControl(vectorText);
        checkboxGUI.push(checkbox)
        i++;

    }

    
    /** ADD BUTTON TO CREATE AND STOP NEW PURSUERS */
    
    var buttonSelect = BABYLON.GUI.Button.CreateSimpleButton("buttonSelect", "Select pursuers");
    buttonSelect.paddingTop = "10px";
    buttonSelect.width = "100px";
    buttonSelect.height = "100px";
    buttonSelect.color = "white";
    buttonSelect.background = "orange";
    buttonSelect.isEnabled=false;


    var buttonPursuer = BABYLON.GUI.Button.CreateSimpleButton("but0", "Start new pursuers");
    buttonPursuer.paddingTop = "10px";
    buttonPursuer.width = "100px";
    buttonPursuer.height = "100px";
    buttonPursuer.color = "white";
    buttonPursuer.background = "green";

    buttonPursuer.onPointerDownObservable.add(function () {
        /** Pursuer */
        var pursuer = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
        pursuer.scaling = new BABYLON.Vector3(20, 20, 20)
        pursuer.material = materialShip;
        pursuer.checkCollisions = true
        pursuer.position.y = 20
        pursuer.position.x += 500

        /** Seek behaviour */
        var seekBehaviour = new SeekBehaviour(pursuer)
        seekBehaviour.maxSpeed = paramsPursuer["maxSpeed"]
        seekBehaviour.maxForce = paramsPursuer["steeringForce"]
        seekBehaviour.mass = paramsPursuer["mass"]


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
        buttonSelect.isEnabled=true;

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

    var buttonStop = BABYLON.GUI.Button.CreateSimpleButton("but1", "Stop pursuers");
    buttonStop.paddingTop = "10px";
    buttonStop.width = "100px";
    buttonStop.height = "100px";
    buttonStop.color = "white";
    buttonStop.background = "red";

    buttonStop.onPointerDownObservable.add(function () {
        pursuers.forEach(p => {
            p.getMesh().dispose()
        });
        for (var decorVector in decorVectors) {
            decorVectors[decorVector].forEach(dc => {
                dc.meshVisualization.dispose()
            })
        }
        pursuers = []
        decorVectors = {
            "maxSpeed": [],
            "maxForce": [],
            "velocity": []
        }
        pursuerCreated = false
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

                    if(UiPanelSelection!==undefined){
                        UiPanelSelection.dispose();
                        UiPanelSelection=undefined;
                        
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

                    paramsGUISelection.forEach((param) => {

                        var header = new BABYLON.GUI.TextBlock();
                        header.text = param.name + ":" + param.anim
                        header.height = "30px";
                        header.color = "yellow";
                        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                        header.paddingTop = "10px";

                        UiPanelSelection.addControl(header);

                        var slider = new BABYLON.GUI.Slider();

                        slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                        slider.minimum = 0;
                        slider.maximum = 1;
                        slider.color = "green";
                        slider.value = param.anim;
                        slider.height = "20px";
                        slider.width = "205px";
                        UiPanelSelection.addControl(slider);
                        slider.onValueChangedObservable.add((v) => {
                            param.anim = v * param.weight;
                            paramsPursuerSelection = {
                                "maxSpeed": paramsGUISelection[0].anim,
                                "steeringForce": paramsGUISelection[1].anim,
                                "mass": paramsGUISelection[2].anim
                            }
                            header.text = param.name + ":" + param.anim.toFixed(2);
                            
                            entity.maxSpeed = paramsPursuerSelection["maxSpeed"]
                            entity.maxForce = paramsPursuerSelection["steeringForce"]
                            entity.mass = paramsPursuerSelection["mass"]
                        })


                    });


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




    UiPanel.addControl(buttonPursuer);
    UiPanel.addControl(buttonSelect);
    UiPanel.addControl(buttonStop);


    



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
                // Update the pursuer
                pursuers[i].mesh.rotation.x = Math.PI / 2;
                pursuers[i].mesh.rotation.z = Math.PI / 2;
                pursuers[i].mesh.rotation.y = directionRotation
                pursuers[i].run(target)
                pursuers[i].update()

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