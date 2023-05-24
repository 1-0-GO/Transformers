//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
// cameras
var activeCamera; 
const cameras = {};
const frustumSize = 40;
// 3D objects
const axis = new THREE.AxisHelper(20);
const updatables = [];
const meshObjects = [];
const collisionObjects = {};
var collision = false;
const robotMainColor = 0xff3232;
const blue = 0x0000ff;
const yellow = 0xffce00;
const purple = 0xb13aff;
const light_brown = 0xcd8540;
const green = 0x289A3A
// other 
const clock = new THREE.Clock();
var scene, renderer;
const arrowKeysState = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'q': false,
    'a': false,
    'w': false
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
    const container = createBoxMesh(4.8, 7.2, 12, light_brown);
    
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

    collisionObjects['trailer'] = trailer;
    scene.add(trailer);
}

function createBase(group) {
    const base = createBoxMesh(2.8, 1.0, 3.4, robotMainColor);
    
   group.add(base);  
   return base;
}

function createUpperArm(group, x, y, z) {
    const arm = createBoxMesh(1.0, 4.2, 1.0, green);
    
   arm.position.set(x, y, z);
   group.add(arm);  
   return arm;
}

function createForearm(group, x, y, z) {
    const forearm = createBoxMesh(1.0, 1.0, 3.2, green);
    
   forearm.position.set(x, y, z);
   group.add(forearm);  
   return forearm;
}

function createArms(group, dx, x, y, z) {
    const characterArmsGroup = new THREE.Group();
    const upperArm1 = createUpperArm(characterArmsGroup, -dx, 0, 0);
    const upperArm2 = createUpperArm(characterArmsGroup, dx, 0, 0);
    const forearm1 = createForearm(characterArmsGroup, -dx, - 1.6, 2.1);
    const forearm2 = createForearm(characterArmsGroup, dx, -1.6, 2.1);

    characterArmsGroup.position.set(x, y, z);
    
    characterArmsGroup.tick = (delta) => {
    };
    updatables.push(characterArmsGroup);

    group.add(characterArmsGroup);
}

function createChest(group, x, y, z) {
    const chest = createBoxMesh(4.8, 2.8, 2.4, robotMainColor);

    chest.position.set(x, y, z);
    group.add(chest);
    return chest;
}
function createBack(group, x, y, z) {
    const back = createBoxMesh(2.8, 2.8, 1.0, robotMainColor);

    back.position.set(x, y, z);
    group.add(back);
    return back;
}

function createEye(group, x, y, z) {
    const eye = createBoxMesh(0.5, 0.3, 0.2, purple);

    eye.position.set(x, y, z);
    group.add(eye);
    return eye;
}

function createAntler(group, x, y, z) {
    const antler = createBoxMesh(0.3, 1.6, 0.2, blue);

    antler.position.set(x, y, z);
    group.add(antler);
    return antler;
}

function createHead(group, x, y, z) {
    const characterHeadGroup = new THREE.Group();

    const geometry = new THREE.CylinderGeometry(1.0, 1.0, 1.4, 32);
    const material = new THREE.MeshBasicMaterial({ color: yellow, wireframe: true});
    const head = addMesh(new THREE.Mesh(geometry, material));
    characterHeadGroup.add(head);

    const rightAntler = createAntler(characterHeadGroup, 1.0, 0.1, 0);
    const leftAntler = createAntler(characterHeadGroup, -1.0, 0.1, 0);
    const rightEye = createEye(characterHeadGroup, 0.5, 0.3, 0.9);
    const leftEye = createEye(characterHeadGroup, -0.5, 0.3, 0.9);
    
    characterHeadGroup.tick = (delta) => {
    };
    updatables.push(characterHeadGroup);


    characterHeadGroup.position.set(x, y, z);
    group.add(characterHeadGroup);
    return characterHeadGroup;
}

function createUpperLeg(group, x, y, z, side) {
    sign = {'l': -1.0, 'r': 1.0};
    const upperLeg = createBoxMesh(0.8, 2.8, 0.8, yellow);
    const wheel = createWheel(upperLeg, sign[side] * 1.0, 0.2, 0);
    
    upperLeg.position.set(x, y, z);
    group.add(upperLeg);  
    return upperLeg;
}

function createLowerLeg(group, x, y, z, side) {
    sign = {'l': -1, 'r': 1};
    const lowerLeg = createBoxMesh(1.6, 3.6, 1.6, green);
    const wheel1 = createWheel(lowerLeg, sign[side] * 1.0, 0.4, 0);
    const wheel2 = createWheel(lowerLeg, sign[side] * 1.0, -1.6, 0);
    
    lowerLeg.position.set(x, y, z);
    group.add(lowerLeg);  
    return lowerLeg;
}

function createFoot(group, x ,y, z) {
    const foot = createBoxMesh(2.0, 1.6, 2.6, green);
    
    foot.position.set(x, y, z);
    group.add(foot);  
    return foot;
}

function createLegs(group, dx, x, y, z) {
    const characterLegsGroup = new THREE.Group();
    const l1 = new THREE.Group();
    const upperLeg1 = createUpperLeg(l1, -dx, 0, 0, 'l');
    const upperLeg2 = createUpperLeg(l1, dx, 0, 0, 'r');
    const l2 = new THREE.Group();
    const lowerLeg1 = createLowerLeg(l2, -dx, 0, 0, 'l');
    const lowerLeg2 = createLowerLeg(l2, dx, 0, 0, 'r');
    
    const feet = new THREE.Group();
    const foot1 = createFoot(feet, -dx, 0, 0);
    const foot2 = createFoot(feet, dx, 0, 0);
    feet.position.set(0, -2.6, 0.5);
    feet.tick = (delta) => {
    };
    updatables.push(feet);

    l2.add(feet);
    l2.position.set(0, -3.2, 0);
    l1.add(l2);
    l1.position.set(0, -1.4, 0);
    characterLegsGroup.add(l1);
    characterLegsGroup.position.set(x, y, z);

    characterLegsGroup.tick = (delta) => {
    };
    updatables.push(characterLegsGroup);

    group.add(characterLegsGroup);
}

function createRobot(x, y, z) {
    const robot = new THREE.Group();
    
    const base = createBase(robot);
    
    const g1 = new THREE.Group();
    const chest = createChest(g1, 0, 0, 0.4);
    const head = createHead(g1, 0, 2.1, -0.6);
    const g12 = new THREE.Group();
    const back = createBack(g12, 0, 0, 0);
    const arms = createArms(g12, 1.9, 0, -0.3, 0) 
    g12.position.set(0, 0, -1.3);
    g1.add(g12);
    g1.position.set(0, 1.9, 0.1);
    robot.add(g1);

    const legs = createLegs(robot, 1.1, 0, -0.5, 0);


    robot.position.set(x, y, z);

    collisionObjects['robot'] = robot;
    scene.add(robot);
}

function calculateAABB(object) {
    const tempVector = new THREE.Vector3();
    var minPoint = new THREE.Vector3( + Infinity, + Infinity, + Infinity );
    var maxPoint = new THREE.Vector3( - Infinity, - Infinity, - Infinity );

    object.updateMatrixWorld(true);

    object.traverse(function(node) {
        if(node instanceof THREE.Mesh) {
            const vertices = node.geometry.vertices;
            const vertexCount = vertices.length;

            for(let i = 0; i < vertexCount; i++) {
                tempVector.copy(vertices[i]);
                tempVector.applyMatrix4(node.matrixWorld);
                
                minPoint.min(tempVector);
                maxPoint.max(tempVector);
            }
        }
    });

    return {minPoint, maxPoint};
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    'use strict';
    const robotAABB = calculateAABB(collisionObjects['robot']);
    const trailerAABB = calculateAABB(collisionObjects['trailer']);
    const robotMax = robotAABB.maxPoint;
    const robotMin = robotAABB.minPoint;
    const trailerMax = trailerAABB.maxPoint;
    const trailerMin = trailerAABB.minPoint;
    
    if (!(robotMax.x > trailerMin.x)) {
        return false;
    }
    if (!(robotMin.x < trailerMax.x)) {
        return false;
    }
    if (!(robotMax.y > trailerMin.y)) {
        return false;
    }
    if (!(robotMin.y < trailerMax.y)) {
        return false;
    }
    if (!(robotMax.z > trailerMin.z)) {
        return false;
    }
    if (!(robotMin.z < trailerMax.z)) {
        return false;
    }
    
    // All conditions are satisfied so the AABB's do intersect.
    return true;
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
    collision = checkCollisions();
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
            if(key === 'perspectiveCamera') {
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
    var key = e.key;
    switch (key) {
        case 'a':
        case 'A': 
        case 'q':
        case 'Q':
            key = key.toLowerCase();
        case 'ArrowUp': 
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            arrowKeysState[key] = true;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
    var key = e.key;
    switch (key) {
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
        case 'a':
        case 'A': 
        case 'q':
        case 'Q':
            key = key.toLowerCase();
        case 'ArrowUp': 
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            arrowKeysState[key] = false;
            break;          
        default:
            // Do nothing for other keys
            return;
    }
}