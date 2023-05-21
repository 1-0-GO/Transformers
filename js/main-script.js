//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
// cameras
var activeCamera 
const cameras = {};
const frustumSize = 40;
// 3D objects
const axis = new THREE.AxisHelper(20);
const updatables = [];
const meshObjects = [];
const robotMainColor = 0xff3232;
const blue = 0x0000ff;
// other 
const clock = new THREE.Clock();
var scene, renderer;
const arrowKeysState = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false
  };


////////////////////////
/* AUXILARY FUNCTIONS */
////////////////////////
function addMesh(object) {
    if (object instanceof THREE.Mesh) {
        meshObjects.push(object);
    }
    return object;
}

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xadd8e6); // light-blue
    createTrailer(0, 0, -10);
    createRobot(0, 0, 10);
    axis.visible = false;
    scene.add(axis);    
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createOrthographicCamera(x, y, z) {
    'use strict';
    const aspect = window.innerWidth / window.innerHeight;
    var camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, 
                                        frustumSize * aspect / 2,
                                        frustumSize / 2, 
                                        frustumSize / - 2, 
                                        0.1, 
                                        1000 );
    camera.position.set(x, y, z);
    camera.lookAt(scene.position);
    return camera;
}

function createPerspectiveCamera(x,y,z) {
    'use strict';
    var camera = new THREE.PerspectiveCamera( 70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000 );
    camera.position.set(x,y,z)
    camera.lookAt(scene.position);
    return camera;
}

function createCameras() {
   cameras['frontalCamera'] = createOrthographicCamera(0, 0, 30); 
   cameras['lateralCamera'] = createOrthographicCamera(-30, 0, 0); 
   cameras['topCamera'] = createOrthographicCamera(0, 30, 0); 
   cameras['isometricCamera'] = createOrthographicCamera(30, 30, 30); 
   cameras['perspectiveCamera'] = createPerspectiveCamera(18, 18, 18); 
   activeCamera = cameras['frontalCamera'];
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createBoxMesh(width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
 
    const materials =  new THREE.MeshBasicMaterial({ color: color, wireframe: true});
    return addMesh(new THREE.Mesh(geometry, materials));
}

function createContainer(group) {
    const container = createBoxMesh(4.8, 7.2, 12, 0xcd8540);
    
   group.add(container);  
   return container;
}

function createWheel(group, x, y, z) {
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32);
    const material = new THREE.MeshBasicMaterial({ color: blue, wireframe: true});
    const wheel = addMesh(new THREE.Mesh(geometry, material));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    group.add(wheel);
    return wheel;
}

function createWheelsOnPlatform(group, dx, dz) {
    const wheels = new THREE.Group();

    const wheel0 = createWheel(wheels, 0, 0, 0); 
    const wheel1 = createWheel(wheels, dx, 0, 0);
    const wheel2 = createWheel(wheels, dx, 0, dz);
    const wheel3 = createWheel(wheels, 0, 0, dz);
    group.add(wheels);
    return wheels;
}

function createConnector(group, x, y, z) {
    const connector = createBoxMesh(4.8, 0.8, 0.8, blue);
    connector.position.set(x, y, z);
    group.add(connector);
}

function createTrailer(x, y, z) {
    'use strict';
    const trailer = new THREE.Group();

    const container = createContainer(trailer);
    const params = container.geometry.parameters;

    const dx = -1.2 + params.width;
    const dz = 2.4; 

    const wheels = createWheelsOnPlatform(trailer, dx, dz);
    wheels.position.set(0.6 - 0.5*params.width, -0.8 - 0.5*params.height, 1.2 - 0.5*params.depth);

    createConnector(trailer, 0, 0.4 - 0.5*params.height, 0.4 + 0.5*params.depth);

    // trailer animation
    updatables.push(trailer);
    trailer.direction = new THREE.Vector3();
    trailer.speed = 10;
    trailer.tick = (delta) => {
        // Calculate the trailer's direction based on the pressed keys
        trailer.direction.x = Number(arrowKeysState['ArrowRight']) - Number(arrowKeysState['ArrowLeft']);
        trailer.direction.z = Number(arrowKeysState['ArrowUp']) - Number(arrowKeysState['ArrowDown'])
        trailer.direction.normalize();

        // Update the trailer's position based on the direction, speed and time elapsed
        trailer.position.x += trailer.direction.x * delta * trailer.speed;
        trailer.position.z += trailer.direction.z * delta * trailer.speed;
    };

    trailer.position.set(x, y, z);
    scene.add(trailer);
}

function createBase(group) {
    const base = createBoxMesh(2.8, 1.0, 2.8, robotMainColor);
    
   group.add(base);  
   return base;
}

function createArm(group, x, y, z) {
    const arm = createBoxMesh(1.0, 1.0, 2.8, robotMainColor);
    
   group.add(arm);  
   return arm;
}

function createChest(group, x, y, z) {
    const chest = createBoxMesh(4.8, 2.8, 2.8, robotMainColor);

    chest.position.set(x, y, z);
    group.add(chest);
    return chest;
}

function createAntler(group, x, y, z) {
    const antler = createBoxMesh(0.2, 1.4, 0.2, blue);
    antler.position.set(x, y, z);
    group.add(antler);
    return antler;
}

function createHead(group, x, y, z) {
    const characterHeadGroup = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(1.0, 1.0, 1.2, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffce00, wireframe: true});
    const head = addMesh(new THREE.Mesh(geometry, material));
    const antler1 = createAntler(characterHeadGroup, 1.0, 0, 0);
    const antler2 = createAntler(characterHeadGroup, -1.0, 0, 0);
    characterHeadGroup.add(head);


    characterHeadGroup.position.set(x, y, z);
    group.add(characterHeadGroup);
    return characterHeadGroup;
}

function createRobot(x, y, z) {
    const robot = new THREE.Group();
    
    const base = createBase(robot);
    
    const g1 = new THREE.Group();
    const chest = createChest(g1, 0, 0, 0);
    const head = createHead(g1, 0, 2.0, 0);
    g1.position.set(0, 1.9, 0);
    robot.add(g1);


    robot.position.set(x, y, z);
    scene.add(robot);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';
    const delta = clock.getDelta();
    for(const object of updatables) {
        object.tick(delta);
    }
}

/////////////
/* DISPLAY */
/////////////
function display() {
    'use strict';
    renderer.render(scene, activeCamera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();  
    createCameras();

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    update();
    display();

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        const aspect = window.innerWidth / window.innerHeight;
        for (const key in cameras) {
            const camera = cameras[key];
            if(camera.isPerspectiveCamera) {
                camera.aspect = aspect;
            } else {
                camera.left = - frustumSize * aspect / 2;
				camera.right = frustumSize * aspect / 2;
				camera.top = frustumSize / 2;
				camera.bottom = - frustumSize / 2;
            }
            camera.updateProjectionMatrix(); 
        }
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';
    switch (e.key) {
        case 'ArrowUp': 
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            arrowKeysState[e.key] = true;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
    switch (e.key) {
        case '1':
            activeCamera = cameras['frontalCamera'];
            break;
        case '2':
            activeCamera = cameras['lateralCamera'];
            break;
        case '3':
            activeCamera = cameras['topCamera'];
            break;
        case '4':
            activeCamera = cameras['isometricCamera'];
            break; 
        case '5':
            activeCamera = cameras['perspectiveCamera'];
            break; 
        case '6':
            for(const mesh of meshObjects) {
                mesh.material.wireframe = !mesh.material.wireframe;
            }
            break;
        case '7':
            axis.visible = !axis.visible;
            break;
        case 'ArrowUp': 
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            arrowKeysState[e.key] = false;
            break;          
        default:
            // Do nothing for other keys
            return;
    }
}