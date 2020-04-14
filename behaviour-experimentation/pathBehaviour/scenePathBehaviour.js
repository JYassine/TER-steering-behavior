
import PathBehaviour from "./PathBehaviour.js";
import Behaviour from "../Behaviour.js";
var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var ground;
var pathBehaviour;
var target;


var createPath = () => {

    let mX=500
    let mZ=900
    var step = 100;

    var paths = []
    for(let i=0;i <= mX; i+=step){
        
        paths.push(new BABYLON.Vector3(i,0,0))

    }
    
    for(let i=step; i < mX ;i+=step){
        
        paths.push(new BABYLON.Vector3(mX,0,i))

    }

    for(let i=mX; i < mZ ;i+=step){
        
        paths.push(new BABYLON.Vector3(i,0,mX))

    }

    for(let i=mX; i >= -200 ;i-=step){
        
        paths.push(new BABYLON.Vector3(mZ,0,i))

    }

    return paths

}

var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(100, 200, 600), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2000, height: 2000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

    var paths = createPath()
    
    
    var track = BABYLON.MeshBuilder.CreateLines('track', {points: paths}, scene);

	track.color = new BABYLON.Color3(1, 0, 0);

    var entity = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
    entity.scaling = new BABYLON.Vector3(20, 20, 20)
    entity.material = materialShip;
    entity.checkCollisions = true
    entity.position.y = 1
    
    entity.position.z = -200

    var entity2 = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
    entity2.scaling = new BABYLON.Vector3(5, 5, 5)
    entity2.material = materialShip;
    entity2.checkCollisions = true
    entity2.position.y = 1
    
    
    target = new Behaviour(entity2)
    pathBehaviour = new PathBehaviour(entity)
    

    scene.registerAfterRender(function () {

        pathBehaviour.run(paths)
        var directionRotation1 = (pathBehaviour.t.velocity.clone()).normalize()
        var rotationY = Math.atan2(directionRotation1.z, -directionRotation1.x)
        pathBehaviour.t.mesh.rotation.x = Math.PI/2
        pathBehaviour.t.mesh.rotation.z = Math.PI/2
        pathBehaviour.t.mesh.rotation.y = rotationY
        pathBehaviour.t.update()

        
        var directionRotation = (target.velocity.clone()).normalize()
        directionRotation = Math.atan2(directionRotation.z, -directionRotation.x)
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