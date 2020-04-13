import Path from "./Path.js"
import PathBehaviour from "./PathBehaviour.js";
import SeekBehaviour from "../seekBehaviour/SeekBehaviour.js";
import Behaviour from "../Behaviour.js";
var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var entitiesCreated = false;

var selectedEntity = false;
var circlesWanders = []
var colorVectors = {
    "red": new BABYLON.Color3(1, 0, 0),
    "blue": new BABYLON.Color3(0, 0, 1)
}
var checkboxGUI = []
var entities = []
var ground;
var UiPanel;
var UiPanelSelection;
var pathBehaviour;

var decorVectors = {
    "wanderDistance": [],
    "wanderRadius": []
}
var paramsGUI = [
    { name: "wanderDistance", anim: 10, weight: 10 },
    { name: "wanderRadius", anim: 2, weight: 2 }
]

var target;


var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(100, 200, 600), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red


    var path = new Path(new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(1000, 0, 0))
    path.createPath(scene, new BABYLON.Color3(1, 0, 0), new BABYLON.Vector3(-470, 0, 0))

    var entity = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
    entity.scaling = new BABYLON.Vector3(20, 20, 20)
    entity.material = materialShip;
    entity.checkCollisions = true
    entity.position.y = 1
    entity.position.x=-2000
    entity.position.z=-300

    var entity2 = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
    entity2.scaling = new BABYLON.Vector3(5, 5, 5)
    entity2.material = materialShip;
    entity2.checkCollisions = true
    entity2.position.y = 1
    entity2.position.x=-500
    
    
    target = new Behaviour(entity2)
    


    pathBehaviour = new PathBehaviour(entity)


    scene.registerAfterRender(function () {

        
        
        pathBehaviour.run(path)

        var directionRotation1 = (pathBehaviour.t.velocity.clone()).normalize()
        var rotationY = Math.atan2(directionRotation1.z, -directionRotation1.x)

        pathBehaviour.t.mesh.rotation.x = Math.PI/2
        pathBehaviour.t.mesh.rotation.z = Math.PI/2
        
        pathBehaviour.t.mesh.rotation.y = rotationY
        pathBehaviour.t.update()
        pathBehaviour.borders(path)


        var directionRotation = (target.velocity.clone()).normalize()
        directionRotation = Math.atan2(directionRotation.z, -directionRotation.x)

        target.mesh.rotation.x = Math.PI / 2;
        target.mesh.rotation.z = Math.PI / 2;
        target.mesh.rotation.y = directionRotation
        
        target.mesh.position = pathBehaviour.targetP.clone()

        target.update()

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