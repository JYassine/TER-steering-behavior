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
    "maxForce" : paramsGUI[0].anim,
    "maxSpeed" : paramsGUI[1].anim
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


    scene.registerAfterRender(function () {
        if (pursuerCreated === true) {
            pursuers.forEach(p=>{
                p.maxSpeed= paramsPursuer["maxSpeed"]
                p.maxForce= paramsPursuer["maxForce"]
            });
            for (let i = 0; i < pursuers.length; i++) {
                pursuers[i].seek(target)
                pursuers[i].facePoint(pursuers[i].getMesh(), target.position)
                pursuers[i].update()
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