import WanderBehaviour from "./WanderBehaviour.js";
import DecorBehaviour from "../DecorBehaviour.js";

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var pursuerCreated = false;
var materialShip;
var circlesWanders = []
var colorVectors = {
    "red": new BABYLON.Color3(1, 0, 0),
    "yellow": new BABYLON.Color3(1, 1, 0),
    "blue": new BABYLON.Color3(0, 0, 1)
}
var decorVectors = {
    "distance": [],
    "radius": []
}
var checkboxGUI = []
var pursuers = []
var ground;
var target;

var decorVectors = {
    "distance": [],
    "radius": []
}
var paramsGUI = [
    { name: "distance", anim: 10, weight: 10 },
    { name: "radius", anim: 2, weight: 2 }
]

var paramsPursuer = {
    "distance": paramsGUI[0].anim,
    "radius": paramsGUI[1].anim

}

var createCircleWanders = () => {

    var circle = BABYLON.MeshBuilder.CreateCylinder("cone", { diameter: 100, tessellation: 50 }, scene);

    var materialCircle = new BABYLON.StandardMaterial("shiptx1", scene);
    materialCircle.diffuseColor = new BABYLON.Color3(0, 1, 0); //green
    circle.material = materialCircle

    circlesWanders.push(circle)

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


    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red


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
            param.anim = v * (param.weight);
            paramsPursuer = {
                "distance": paramsGUI[0].anim,
                "radius": paramsGUI[1].anim
            }
            header.text = param.name + ":" + (param.anim);
        })
    });

    /** ADD BUTTON TO CREATE NEW PURSUERS */

    var buttonPursuer = BABYLON.GUI.Button.CreateSimpleButton("but0", "Add new wander entity");
    buttonPursuer.paddingTop = "10px";
    buttonPursuer.width = "200px";
    buttonPursuer.height = "100px";
    buttonPursuer.color = "white";
    buttonPursuer.background = "green";

    buttonPursuer.onPointerDownObservable.add(function () {

        var pursuer = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
        pursuer.scaling = new BABYLON.Vector3(20, 20, 20)
        pursuer.material = materialShip;
        pursuer.checkCollisions = true
        pursuer.position.y = 20

        
        createCircleWanders()
        /** Seek behaviour */
        var wanderBehaviour = new WanderBehaviour(pursuer)
        var decorDistance = new DecorBehaviour(wanderBehaviour.position)
        var decorRadius = new DecorBehaviour(circlesWanders[circlesWanders.length-1].position)
        decorDistance.createVector(100, new BABYLON.Color3(1, 0, 0), scene, false)
        decorRadius.createVector(100, new BABYLON.Color3(0, 0, 1), scene, false)
        decorVectors["distance"].push(decorDistance)
        decorVectors["radius"].push(decorRadius)
        pursuers.push(wanderBehaviour)
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

    var buttonStop = BABYLON.GUI.Button.CreateSimpleButton("but1", "Stop wanders entity");
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
            "distance": [],
            "radius": []
        }
        pursuerCreated = false
        checkboxGUI.forEach(child => {
            if (child.isEnabled === true) {
                child.isEnabled = false
                child.isChecked = false
            }
        })
    });

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


    UiPanel.addControl(buttonPursuer);
    UiPanel.addControl(buttonStop);

    var time = 0;
    scene.registerAfterRender(function () {

        if (pursuerCreated === true) {
            pursuers.forEach(p => {
                p.wanderRadius = paramsPursuer["radius"]
                p.wanderDistance = paramsPursuer["distance"]
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
                decorVectors["distance"][i].update(pursuers[i].wanderCenter)
                var directionRotationCenter = (pursuers[i].wanderCenter.clone()).normalize()
                directionRotationCenter = Math.atan2(directionRotationCenter.z, -directionRotationCenter.x)

                circlesWanders[i].position = pursuers[i].wanderCenter.clone().add(pursuers[i].position.clone())
                circlesWanders[i].locallyTranslate(new BABYLON.Vector3(-28*(paramsPursuer["distance"]), 0, 0))
                circlesWanders[i].rotation.y = directionRotation

                decorVectors["radius"][i].origin = circlesWanders[i].position.clone()
                decorVectors["radius"][i].origin.y+=5
                decorVectors["radius"][i].update(pursuers[i].displacement)
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