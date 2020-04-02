import WanderBehaviour from "./WanderBehaviour.js";

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var pursuerCreated = false;
var materialShip;
var pursuers = []
var radiusUI = []
var ground;
var target;
var paramsGUI = [
    { name: "distance", anim: 2, weight: 2 },
    { name: "radius", anim: 2, weight: 2 }
]

var paramsPursuer = {
    "distance": paramsGUI[0].anim,
    "radius": paramsGUI[1].anim

}

var createRadiusCircle = () => {

    var circle = BABYLON.MeshBuilder.CreateCylinder("cone", { diameter: 400, tessellation: 50 }, scene);
    
    var materialCircle = new BABYLON.StandardMaterial("shiptx1", scene);
    materialCircle.diffuseColor = new BABYLON.Color3(0, 1, 0); //Red

    circle.material=materialCircle

    radiusUI.push(circle)

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
            param.anim = v * (-param.weight);
            paramsPursuer = {
                "distance": paramsGUI[0].anim,
                "radius": paramsGUI[1].anim
            }
            header.text = param.name + ":" + -(param.anim);
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

        var pursuer = BABYLON.MeshBuilder.CreateBox("myBox", { height: 40, width: 40, depth: 40 }, scene);
        pursuer.material = materialShip;
        pursuer.checkCollisions = true
        pursuer.position.y = 20
        pursuer.position.x += 100

        /** Seek behaviour */
        var wanderBehaviour = new WanderBehaviour(pursuer)
        createRadiusCircle()
        pursuers.push(wanderBehaviour)
        pursuerCreated = true

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
        radiusUI.forEach(radius => {
            radius.dispose()
        });
        pursuers = []
        radiusUI=[]
        pursuerCreated = false
    });


    UiPanel.addControl(buttonPursuer);
    UiPanel.addControl(buttonStop);

    var time = 0;
    scene.registerAfterRender(function () {

        if (pursuerCreated === true) {
            pursuers.forEach(p => {
                p.updateParameters(paramsPursuer["distance"], paramsPursuer["radius"])
            });
            for (let i = 0; i < pursuers.length; i++) {
                radiusUI[i].position.x = pursuers[i].position.x
                radiusUI[i].position.z = pursuers[i].position.z
                radiusUI[i].scaling=new BABYLON.Vector3(paramsPursuer["radius"],paramsPursuer["radius"],paramsPursuer["radius"])
                
                pursuers[i].run(target)
                pursuers[i].update()
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