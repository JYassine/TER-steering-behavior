import SeekBehaviour from "./SeekBehaviour.js";

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var pursuerCreated = false;
var pursuers = []
var paramsGUI = [
    { name: "maxForce", anim: 5, weight: 5 },
    { name: "maxSpeed", anim: 15, weight: 15 }
]

var paramsPursuer = {
    "maxForce": paramsGUI[0].anim,
    "maxSpeed": paramsGUI[1].anim
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
    target.material=materialShip

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
                "maxForce": paramsGUI[0].anim,
                "maxSpeed": paramsGUI[1].anim
            }
            header.text = param.name + ":" + param.anim;
        })
    });

    /** ADD BUTTON TO CREATE NEW PURSUERS */

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
        pursuers.push(seekBehaviour)
        pursuerCreated = true

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
        pursuers = []
        pursuerCreated = false
    });


    UiPanel.addControl(buttonPursuer);
    UiPanel.addControl(buttonStop);


    var time=0;
    var radius=300
    scene.registerAfterRender(function () {
        target.position.x = Math.cos( time/25 ) * Math.sin( (time/25) * 0.8 ) * radius;
        target.position.z = Math.sin( (time/25) * 0.5 ) * radius;
        
        if (pursuerCreated === true) {
            pursuers.forEach(p => {
                p.maxSpeed = paramsPursuer["maxSpeed"]
                p.maxForce = paramsPursuer["maxForce"]
            });
            for (let i = 0; i < pursuers.length; i++) {
                pursuers[i].seek(target)
                pursuers[i].facePoint(target.position)
                pursuers[i].update()
            }
        }
        time+=1

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