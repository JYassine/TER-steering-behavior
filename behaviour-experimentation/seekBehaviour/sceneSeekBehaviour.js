import SeekBehaviour from "./SeekBehaviour.js";
import DecorBehaviour from "../DecorBehaviour.js";

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var pursuerCreated = false;
var pursuers = []
var checkboxGUI = []
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
    var buttonPursuer = BABYLON.GUI.Button.CreateSimpleButton("but0", "Start new pursuers");
    buttonPursuer.paddingTop = "10px";
    buttonPursuer.width = "200px";
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
        var decorMaxSpeed = new DecorBehaviour(seekBehaviour.mesh.position)
        var decorMaxForce = new DecorBehaviour(seekBehaviour.mesh.position)
        var decorVelocity = new DecorBehaviour(seekBehaviour.mesh.position)
        decorMaxSpeed.createVector(100, colorVectors[Object.keys(colorVectors)[0]], scene)
        decorMaxForce.createVector(100, colorVectors[Object.keys(colorVectors)[1]], scene)
        decorVelocity.createVector(100, colorVectors[Object.keys(colorVectors)[2]], scene)
        decorVectors["maxSpeed"].push(decorMaxSpeed)
        decorVectors["maxForce"].push(decorMaxForce)
        decorVectors["velocity"].push(decorVelocity)
        pursuers.push(seekBehaviour)
        pursuerCreated = true

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
    buttonStop.width = "200px";
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


    UiPanel.addControl(buttonPursuer);
    UiPanel.addControl(buttonStop);



    
    //UPDATE PURSUERS
    var time = 0;
    var radius = 300
    scene.registerAfterRender(function () {
        target.position.x = Math.cos(time / 25) * Math.sin((time / 25) * 0.8) * radius;
        target.position.z = Math.sin((time / 25) * 0.5) * radius;


        if (pursuerCreated === true) {
            pursuers.forEach(p => {
                p.maxSpeed = paramsPursuer["maxSpeed"]
                p.maxForce = paramsPursuer["steeringForce"]
                p.mass = paramsPursuer["mass"]

            });
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