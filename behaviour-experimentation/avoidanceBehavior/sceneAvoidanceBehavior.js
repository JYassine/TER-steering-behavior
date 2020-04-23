import AvoidanceBehavior from "./AvoidanceBehavior.js";
import SeekBehaviour from "../seekBehaviour/SeekBehaviour.js";
import DecorVector from "../GUI/DecorVector.js";

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
var mouseTarget;
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

var listObstacles = []




var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(-1500, 500, 40), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;


    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2000, height: 2000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    window.addEventListener("mousemove", function () {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);

        mouseTarget = pickResult.pickedPoint

    });


    for (let i = 0; i < 1; i++) {

        var mySphere = BABYLON.MeshBuilder.CreateSphere("mySphere", { diameter: 10, diameterX: 10 }, scene);
        mySphere.scaling = new BABYLON.Vector3(10, 10, 10)
        mySphere.material = materialShip;
        mySphere.position.y = 50
        mySphere.position.x = 100 + (i * 200)
        mySphere.position.z = 100 + (i * 200)
        listObstacles[i] = mySphere
    }

    var entity = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
    entity.scaling = new BABYLON.Vector3(20, 20, 20)
    entity.material = materialShip;
    entity.checkCollisions = true
    entity.position.y = 20
    entity.position.x += 500

    /** Avoidance behavior */

    var avoidanceBehavior = new AvoidanceBehavior(entity)
    avoidanceBehavior.maxSpeed = paramsGUI[0].anim.toFixed(2)
    avoidanceBehavior.maxForce = paramsGUI[1].anim.toFixed(2)
    avoidanceBehavior.mass = paramsGUI[2].anim.toFixed(2)
    avoidanceBehavior.desiredSeparation = paramsGUI[3].anim.toFixed(2)

    
    var vectorAhead = new DecorVector(avoidanceBehavior.mesh.position,5,scene)
    vectorAhead.create(new BABYLON.Color3(1,0,0),true)
    avoidanceBehavior.aheadMesh = vectorAhead.meshVisualization

    var seekBehaviour = new SeekBehaviour(entity)
    seekBehaviour.maxSpeed = 6
    seekBehaviour.maxForce = paramsGUI[1].anim.toFixed(2)
    seekBehaviour.mass = 30
    seekBehaviour.desiredSeparation = paramsGUI[3].anim.toFixed(2)


    scene.registerAfterRender(function () {

        if (mouseTarget != undefined) {
            mouseTarget.y = seekBehaviour.mesh.position.y
            
            vectorAhead.update(seekBehaviour.desired.scale(avoidanceBehavior.maxSeeAhead))
            
            seekBehaviour.rotate()
            seekBehaviour.run(mouseTarget)
            
            avoidanceBehavior.run(mouseTarget,seekBehaviour.desired,listObstacles)
            seekBehaviour.applyForce(avoidanceBehavior.avoidanceForce)
            seekBehaviour.update()
            /*console.log("AVOIDANCE :  : "+ avoidanceBehavior.aheadMesh.position)
            
            console.log("ENTITY :  : "+ entity.position)*/
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