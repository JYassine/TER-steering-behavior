import * as YUKA from './yuka_library/build/yuka.module.js';
import * as THREE from './yuka_library/examples/lib/three.module.js';
import * as DAT from './yuka_library/examples/lib/dat.gui.module.js';

let renderer, scene, camera;

let entityManager, time, evader, target;
const pursuersMesh = []
const pursuers = []
var maxPursuer = 200;
const params = {
    separation: 0.1
};
init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 90, 0);
    camera.lookAt(scene.position);

    //


    const pursuerGeometry = new THREE.ConeBufferGeometry(0.2, 1, 8);
    pursuerGeometry.rotateX(Math.PI * 0.5);
    const pursuerMaterial = new THREE.MeshNormalMaterial();

    for (let i = 0; i < maxPursuer; i++) {
        let pursuerMesh = new THREE.Mesh(pursuerGeometry, pursuerMaterial);
        pursuerMesh.matrixAutoUpdate = false;
        scene.add(pursuerMesh)
        pursuersMesh.push(pursuerMesh)
    }



    const evaderGeometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
    const evaderMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const evaderMesh = new THREE.Mesh(evaderGeometry, evaderMaterial);
    evaderMesh.matrixAutoUpdate = false;
    scene.add(evaderMesh);


    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //

    window.addEventListener('resize', onWindowResize, false);

    // Setup 

    entityManager = new YUKA.EntityManager();
    time = new YUKA.Time();

    target = new YUKA.Vector3();


    evader = new YUKA.Vehicle();
    evader.maxSpeed = 10;
    evader.setRenderComponent(evaderMesh, sync);

    const seekBehavior = new YUKA.SeekBehavior(target);
    evader.steering.add(seekBehavior);
    entityManager.add(evader);

    
    const separationBehavior = new YUKA.SeparationBehavior();
    const pursuitBehavior = new YUKA.PursuitBehavior(evader, 2);
    
	separationBehavior.weight = params.separation;
    pursuersMesh.forEach(pursuerM => {
        let pursuer = new YUKA.Vehicle();

        pursuer.updateNeighborhood = true;
        pursuer.neighborhoodRadius = 10;
        pursuer.position.x = 10 - Math.random() * 20;
        pursuer.position.z = 10 - Math.random() * 20;
        pursuer.maxSpeed=3

        pursuer.updateWorldMatrix();
        pursuer.setRenderComponent(pursuerM, sync);
        pursuer.steering.add( separationBehavior );
    
        pursuer.steering.add(pursuitBehavior);
        entityManager.add(pursuer);
        pursuers.push(pursuer)
    })


    // GUI
    const gui = new DAT.GUI({ width: 300 });
    gui.add(params, 'separation', 0.1, 2).name('separation').onChange((value) => separationBehavior.weight = value);
    gui.open();


}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    const delta = time.update().getDelta();

    entityManager.update(delta);

    const elapsedTime = time.getElapsed();

    target.x = Math.cos(elapsedTime) * Math.sin(elapsedTime * 0.7) * 24;
    target.z = Math.sin(elapsedTime * 0.8) * 24;
    entityManager.update(delta);


    renderer.render(scene, camera);

}

function sync(entity, renderComponent) {

    renderComponent.matrix.copy(entity.worldMatrix);

}
