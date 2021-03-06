import PathBehaviour from "../pathBehaviour/PathBehaviour.js";
import Vehicle from "../Vehicle.js";
import GUI from "../GUI/GUI.js"
import Utilities from "../Utilities.js"
import Road from "../pathBehaviour/Road.js"
import DecorVector from "../GUI/DecorVector.js"
var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var ground;
var entitiesCreated = false;
var entities = []
var advancedTexture;
var nameEntities = []
var UiPanel;
var UiPanelEditMap;
var targets = []
var pathBehaviours = [];
var vehiclePlayer = undefined;
var decelerate;
var raceStarted = false;
var howToPlay;
var infoVehicle;
var concMap;
var map;
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
    { name: "mass", anim: 60, weight: 60 },
    { name: "desiredSeparation", anim: 50, weight: 50 }
]

var createMap = (arrayMap) => {
    var concMap = []
    for (let i = 0; i < arrayMap.length; i++) {

        var road = new Road(arrayMap[i].height, arrayMap[i].position, arrayMap[i].direction)
        road.pathPoint = arrayMap[i].pathPoint
        road.createRoad(scene)
        arrayMap[i].pathPoint.forEach(point => {
            concMap.push({ "direction": arrayMap[i].direction, "path": new BABYLON.Vector3(point.x, point.y, point.z) });

        });
    }

    return concMap;

}
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
var createScene = function () {



    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 2000, 60), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", scene);
    terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    terrainMaterial.specularPower = 64;

    terrainMaterial.mixTexture = new BABYLON.Texture("../resources/mixMap.png", scene);


    terrainMaterial.diffuseTexture1 = new BABYLON.Texture("../resources/grass.png", scene);
    terrainMaterial.diffuseTexture2 = new BABYLON.Texture("../resources/grass.png", scene);
    terrainMaterial.diffuseTexture3 = new BABYLON.Texture("../resources/grass.png", scene);

    // Bump textures according to the previously set diffuse textures
    terrainMaterial.bumpTexture1 = new BABYLON.Texture("../resources/grassn.png", scene);
    terrainMaterial.bumpTexture2 = new BABYLON.Texture("../resources/grassn.png", scene);
    terrainMaterial.bumpTexture3 = new BABYLON.Texture("../resources/grassn.png", scene);

    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 3000, height: 3000 }, scene);

    ground.material = terrainMaterial;


    var materialShip = new BABYLON.StandardMaterial("shiptx1", scene);
    materialShip.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red


    var materialTileMap = new BABYLON.StandardMaterial("shiptx1", scene);
    materialTileMap.diffuseColor = new BABYLON.Color3(0, 0, 1); //Red

    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    UiPanel = new BABYLON.GUI.StackPanel();



    UiPanel.width = "220px";
    UiPanel.fontSize = "14px";
    UiPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    UiPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(UiPanel);


    canvas.focus();



    GUI.displayChangeParametersEntities("70px", paramsGUI, entities, UiPanel)
    GUI.displayVectors(decorVectors, checkboxGUI, UiPanel, colorVectors)



    // BUTTONS TO STOP / START / SELECT ENTITIES
    var buttonStart = GUI.createButton("Start new entity", "10px", "100px", "100px", "white", "green");
    var buttonStop = GUI.createButton("Stop all entities", "10px", "100px", "100px", "white", "red");

    var buttonStartRace = GUI.createButton("Start the race", "10px", "100px", "100px", "white", "green")
    buttonStartRace.isEnabled = false;


    var buttonStopRace = GUI.createButton("Stop the race", "10px", "100px", "100px", "white", "red")
    buttonStopRace.isEnabled = false;

    UiPanel.addControl(buttonStart)
    UiPanel.addControl(buttonStop)


    buttonStart.onPointerDownObservable.add(function () {
        var target;
        var entity;


        entity = BABYLON.Mesh.CreateCylinder("entity", 2, 0, 1, 6, 1, scene, false);
        entity.scaling = new BABYLON.Vector3(20, 20, 20)
        entity.material = materialShip;
        entity.checkCollisions = true
        entity.position.z = concMap[0].path.z
        entity.position.x = concMap[0].path.x - 100

        var vehicle = new Vehicle(entity)

        target = BABYLON.Mesh.CreateCylinder("target", 2, 0, 1, 6, 1, scene, false);
        target.scaling = new BABYLON.Vector3(7, 7, 7)
        target.material = materialShip;
        target.checkCollisions = true
        target.position.y = 1

        var vehicleTarget = new Vehicle(target)

        var pathBehaviour = new PathBehaviour(concMap, vehicleTarget)
        pathBehaviour.radiusPath = 40

        vehicle.maxSpeed = paramsGUI[0].anim.toFixed(2)
        vehicle.maxForce = paramsGUI[1].anim.toFixed(2)
        vehicle.mass = paramsGUI[2].anim.toFixed(2)
        vehicle.desiredSeparation = paramsGUI[3].anim.toFixed(2)


        vehicleTarget.maxSpeed = paramsGUI[0].anim.toFixed(2)
        vehicleTarget.maxForce = paramsGUI[1].anim.toFixed(2)
        vehicleTarget.mass = paramsGUI[2].anim.toFixed(2)


        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(vehicle.name, 0, 40, "bold 36px Arial", "red", "transparent", true);

        var xChar = Utilities.createText(dynamicTexture, 70, scene);
        xChar.position = vehicle.position.clone()

        nameEntities.push(xChar);


        //Vector of seek behaviours
        var decorMaxSpeed = new DecorVector(vehicle.mesh.position, 100, scene)
        var decorMaxForce = new DecorVector(vehicle.mesh.position, 100, scene)
        var decorVelocity = new DecorVector(vehicle.mesh.position, 100, scene)
        decorMaxSpeed.create(colorVectors[Object.keys(colorVectors)[0]], false)
        decorMaxForce.create(colorVectors[Object.keys(colorVectors)[1]], false)
        decorVelocity.create(colorVectors[Object.keys(colorVectors)[2]], false)
        decorVectors["maxSpeed"].push(decorMaxSpeed)
        decorVectors["maxForce"].push(decorMaxForce)
        decorVectors["velocity"].push(decorVelocity)


        targets.push(vehicleTarget)
        entities.push(vehicle)
        pathBehaviours.push(pathBehaviour)

        entitiesCreated = true;
        buttonStartRace.isEnabled = true;


        camera.setTarget(entities[entities.length - 1].mesh.position)

        camera.position = new BABYLON.Vector3(1200, 200, 1600)

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

    buttonStop.onPointerDownObservable.add(function () {

        for (let i = 0; i < entities.length; i++) {
            entities[i].mesh.dispose();
            nameEntities[i].dispose();
            targets[i].mesh.dispose();

        }

        for (var decorVector in decorVectors) {
            decorVectors[decorVector].forEach(dc => {
                dc.meshVisualization.dispose()
            })
        }

        raceStarted = false;

        entities = []
        targets = []
        nameEntities = []
        decorVectors = {
            "maxSpeed": [],
            "maxForce": [],
            "velocity": []
        }
        entitiesCreated = false
        selectedEntity = false;
        checkboxGUI.forEach(checkbox => {
            if (checkbox.isEnabled === true) {
                checkbox.isEnabled = false
                checkbox.isChecked = false
            }

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

        })


    });


    UiPanelEditMap = new BABYLON.GUI.StackPanel();
    UiPanelEditMap.width = "220px";
    UiPanelEditMap.fontSize = "14px";
    UiPanelEditMap.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    UiPanelEditMap.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(UiPanelEditMap);


    buttonStop.isEnabled = false;
    buttonStart.isEnabled = false;


    var buttonLoad = GUI.createButton("Load Map", "10px", "100px", "100px", "white", "green")
    UiPanelEditMap.addControl(buttonLoad)

    UiPanelEditMap.addControl(buttonStartRace)
    UiPanelEditMap.addControl(buttonStopRace)

    buttonStopRace.onPointerDownObservable.add(function () {
        raceStarted = false;
        for (let i = 0; i < entities.length; i++) {
            targets[i].mesh.dispose()
            entities[i].mesh.dispose()
            nameEntities[i].dispose()
        }

        vehiclePlayer.mesh.dispose()
        vehiclePlayer = undefined;
        scene.actionManager.dispose()
        scene.actionManager = undefined;
        camera.position = new BABYLON.Vector3(0, 3000, 60)
        camera.setTarget(BABYLON.Vector3.Zero())
        UiPanel.isVisible = true;
        buttonStartRace.isVisible = true;
        infoVehicle.isVisible=false;

    });

    buttonStartRace.onPointerDownObservable.add(function () {

        var entity;

        entity = BABYLON.Mesh.CreateCylinder("entity", 2, 0, 1, 6, 1, scene, false);
        entity.scaling = new BABYLON.Vector3(20, 20, 20)
        entity.material = materialShip.clone();
        entity.material.diffuseColor = new BABYLON.Color3(0, 1, 0)
        entity.checkCollisions = true
        entity.position.z = concMap[0].path.z
        entity.position.x = concMap[0].path.x - 100

        infoVehicle.isVisible=true;
        vehiclePlayer = new Vehicle(entity)
        vehiclePlayer.maxSpeed = 10
        vehiclePlayer.maxForce = 50
        vehiclePlayer.mass = 20
        vehiclePlayer.position.y = 8

        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: "z"
            },
            function () {

                var forward = vehiclePlayer.position.subtract(camera.position).normalize();
                forward.y = 0

                var diffAngle = Math.atan2(forward.x, forward.z);
                var currentAngle = diffAngle;
                vehiclePlayer.mesh.rotation.y = currentAngle + (Math.PI);
                var force = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, -0.5 * vehiclePlayer.maxSpeed), BABYLON.Matrix.RotationY(vehiclePlayer.mesh.rotation.y));
                vehiclePlayer.applyForce(force)
                vehiclePlayer.rotate()
            }
        ));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: "d"
            },
            function () {

                var forward = vehiclePlayer.position.subtract(camera.position).normalize();
                forward.y = 0
                var force = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 1 * vehiclePlayer.maxSpeed), BABYLON.Matrix.RotationY(vehiclePlayer.mesh.rotation.y));

                vehiclePlayer.applyForce(force)
                vehiclePlayer.rotate()

            }
        ));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: "q"
            },
            function () {

                var forward = vehiclePlayer.position.subtract(camera.position).normalize();

                forward.y = 0
                var force = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, -1 * vehiclePlayer.maxSpeed), BABYLON.Matrix.RotationY(vehiclePlayer.mesh.rotation.y));

                vehiclePlayer.applyForce(force)
                vehiclePlayer.rotate()

            }
        ));

        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnKeyDownTrigger,
                parameter: "s"
            },
            function () {

                if (vehiclePlayer.velocity.length() < 1) {
                    vehiclePlayer.velocity = new BABYLON.Vector3(0, 0, 0)
                }else{
                    if (vehiclePlayer.velocity.x > 0 && vehiclePlayer.velocity.z < 0) {
                        vehiclePlayer.velocity.subtractInPlace(new BABYLON.Vector3(0.1 * vehiclePlayer.maxSpeed, 0, -0.1 * vehiclePlayer.maxSpeed));
                    } else if (vehiclePlayer.velocity.x < 0 && vehiclePlayer.velocity.z > 0) {
    
                        vehiclePlayer.velocity.subtractInPlace(new BABYLON.Vector3(-0.1 * vehiclePlayer.maxSpeed, 0, 0.1 * vehiclePlayer.maxSpeed));
                    } else if (vehiclePlayer.velocity.x > 0 && vehiclePlayer.velocity.z > 0) {
    
                        vehiclePlayer.velocity.subtractInPlace(new BABYLON.Vector3(0.1 * vehiclePlayer.maxSpeed, 0, 0.1 * vehiclePlayer.maxSpeed));
                    } else {
    
                        vehiclePlayer.velocity.subtractInPlace(new BABYLON.Vector3(-0.1 * vehiclePlayer.maxSpeed, 0, -0.1 * vehiclePlayer.maxSpeed));
                    }
    

                }


            }


        ));







        camera.position = new BABYLON.Vector3(1200, 200, 1600)

        raceStarted = true;
        UiPanel.isVisible = false;
        buttonLoad.isVisible = false;
        buttonStartRace.isVisible = false;
        buttonStopRace.isEnabled = true;
        buttonStopRace.isVisible = true;

        howToPlay.isVisible = true;


        var buttonHowToPlay = GUI.createButton("GOT IT !", "10px", "50px", "50px", "white", "green");

        buttonHowToPlay.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        howToPlay.addControl(buttonHowToPlay)

        buttonHowToPlay.onPointerDownObservable.add(function () {

            howToPlay.isVisible = false;
        });



    });


    buttonLoad.onPointerDownObservable.add(function () {


        Utilities.readTextFile("./mapRace.json", function (text) {
            map = JSON.parse(text);
            concMap = createMap(map)
            var pointsPath = [];
            concMap.forEach(conc => {
                pointsPath.push(conc.path)

            });
            var track = BABYLON.MeshBuilder.CreateLines("path", { points: pointsPath }, scene);
            track.position.y = 8

        });

        buttonStart.isEnabled = true;


        camera.position = new BABYLON.Vector3(0, 3000, 60)
        camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        buttonLoad.isEnabled = false;

    });



    howToPlay = new BABYLON.GUI.Rectangle();

    howToPlay.isVisible = false;
    howToPlay.width = "0.4";
    howToPlay.height = "200px";
    howToPlay.cornerRadius = 20;
    howToPlay.color = "Orange";

    howToPlay.thickness = 4;
    howToPlay.background = "green";
    advancedTexture.addControl(howToPlay);


    var howToPlayText = new BABYLON.GUI.TextBlock();
    howToPlayText.text = "Accelerate : 'z' \n Decelerate : 's' \n Move Left : 'q' \n Move right : 'd' "
    howToPlayText.marginRight = "5px";
    howToPlayText.fontWeight = "bold"
    howToPlayText.color = "white"
    howToPlayText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    howToPlay.addControl(howToPlayText)

    infoVehicle = new BABYLON.GUI.Rectangle();

    infoVehicle.isVisible = false;
    infoVehicle.width = "0.8";
    infoVehicle.height = "200px";
    infoVehicle.paddingTop="30px"
    infoVehicle.cornerRadius = 20;
    infoVehicle.color = "Orange";
    
    infoVehicle.thickness = 4;
    infoVehicle.background = "green";
    infoVehicle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

    var vehicleMapSpeedText = new BABYLON.GUI.TextBlock();
    vehicleMapSpeedText.text = " current speed : " +"\n";
    vehicleMapSpeedText.marginRight = "5px";
    vehicleMapSpeedText.fontWeight = "bold"
    vehicleMapSpeedText.color = "white"
    vehicleMapSpeedText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    infoVehicle.addControl(vehicleMapSpeedText)

    
    UiPanelEditMap.addControl(infoVehicle)



    scene.registerAfterRender(function () {

        if (vehiclePlayer !== undefined) {

            camera.setTarget(vehiclePlayer.mesh.position)
            vehicleMapSpeedText.text = " current speed  : " +"\n" + vehiclePlayer.velocity.length().toFixed(2);
        
            //vehiclePlayer.rotate()
            vehiclePlayer.update()
        }

        if (entitiesCreated === true && raceStarted === true && howToPlay.isVisible !== true) {
            for (let i = 0; i < entities.length; i++) {
                // Update entities

                entities[i].position.y = 8
                entities[i].rotate()
                entities[i].separate(entities)
                entities[i].applyBehaviour(pathBehaviours[i])
                entities[i].update()


                // Update targets
                var directionRotation = (targets[i].velocity.clone()).normalize()
                directionRotation = Math.atan2(directionRotation.z, -directionRotation.x)
                targets[i].mesh.position = pathBehaviours[i].targetP.clone()
                targets[i].update()

                //Update name position
                nameEntities[i].position = entities[i].position.clone()
                nameEntities[i].rotation.y = directionRotation

                //Update the visualization of vectors
                decorVectors["maxSpeed"][i].update(entities[i].desired)
                decorVectors["maxForce"][i].update(entities[i].steer)
                decorVectors["velocity"][i].update(entities[i].velocity)
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