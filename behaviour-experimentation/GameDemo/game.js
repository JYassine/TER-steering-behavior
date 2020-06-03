
import Vehicle from "../Vehicle.js"
var canvas = document.getElementById("renderCanvas");
var engine = null;
var ground;
var decelerate;
var scene;
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(100, 200, 600), scene);

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 5000, height: 5000 }, scene);

    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

    var mesh = BABYLON.Mesh.CreateCylinder("spaceship", 2, 0, 1, 6, 1, scene, false);
    mesh.scaling = new BABYLON.Vector3(20, 20, 20)
    mesh.material = materialShip;
    mesh.checkCollisions = true

    canvas.focus();

    var vehicle = new Vehicle(mesh)
    vehicle.maxSpeed = 16
    vehicle.maxForce = 30
    vehicle.mass = 20
    vehicle.position.y = 8


    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        {
            trigger: BABYLON.ActionManager.OnKeyDownTrigger,
            parameter: "z"
        },
        function () {
            var forward = vehicle.position.subtract(camera.position).normalize();
            forward.scaleInPlace(vehicle.maxSpeed)
            forward.y = 0
            vehicle.applyForce(forward)
        }
    ));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        {
            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
            parameter: "z"
        },
        function () {

            decelerate = setInterval(() => {
                
                if (vehicle.velocity.subtract(new BABYLON.Vector3(0.1, 0, 0.1)).length() > 0) {
                    if (vehicle.velocity.x > 0 && vehicle.velocity.z < 0) {
                        vehicle.velocity.subtractInPlace(new BABYLON.Vector3(0.1, 0, -0.1));
                    } else if (vehicle.velocity.x < 0 && vehicle.velocity.z > 0) {

                        vehicle.velocity.subtractInPlace(new BABYLON.Vector3(-0.1, 0, 0.1));
                    } else if (vehicle.velocity.x > 0 && vehicle.velocity.z > 0) {

                        vehicle.velocity.subtractInPlace(new BABYLON.Vector3(0.1, 0, 0.1));
                    } else  {

                        vehicle.velocity.subtractInPlace(new BABYLON.Vector3(-0.1, 0, -0.1));
                    }
                    
                    if(vehicle.velocity.length() < 0.3){
                        vehicle.velocity= new BABYLON.Vector3(0,0,0)
                        clearInterval(decelerate)
                        decelerate=undefined
                    }
                }


            }, 50)
        }
    ));
    scene.registerAfterRender(function () {

        camera.setTarget(vehicle.mesh.position)
        vehicle.rotate()
        vehicle.update()



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