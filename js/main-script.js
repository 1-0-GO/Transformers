//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
// cameras
var activeCamera 
const cameras = {};
// 3D objects
const axis = new THREE.AxisHelper(20);
const updatables = [];
const meshObjects = [];
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
    axis.visible = false;
    scene.add(axis);    
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createOrthographicCamera(x, y, z) {
    'use strict';
    const frustumSize = 40;
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
   cameras['perspectiveCamera'] = createPerspectiveCamera(25, 25, 25); 
   activeCamera = cameras['frontalCamera'];
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////


/* CREATE TRAILER */

function createContainer(trailer) {
    const geometry = new THREE.BoxGeometry(4.8, 7.2, 12);
    const materials =  new THREE.MeshBasicMaterial({ color: 0xff3232, wireframe: true});
    const container = addMesh(new THREE.Mesh(geometry, materials));
    
   trailer.add(container);  
   return container;
}

function createWheel(trailer, x, y, z) {
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true});
    const wheel = addMesh(new THREE.Mesh(geometry, material));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    trailer.add(wheel);
    return wheel;
}

function createConnector(trailer, x, y, z) {
    const geometry = new THREE.BoxGeometry(2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true});
    const connector = addMesh(new THREE.Mesh(geometry, material));
    connector.position.set(x, y, z);
    trailer.add(connector);
}

function createTrailer(x, y, z) {
    'use strict';
    const trailer = new THREE.Group();

    const container = createContainer(trailer);
    const params = container.geometry.parameters;
    //adjust the position so the first wheel can be on 0, 0, 0
    container.position.set(-0.6 + 0.5*params.width, 0.8 + 0.5*params.height, -1.2 + 0.5*params.depth)
    const dx = -1.2 + params.width;
    const dz = 2.4; 

    const wheel0 = createWheel(trailer, 0, 0, 0); 
    const wheel1 = createWheel(trailer, dx, 0, 0);
    const wheel2 = createWheel(trailer, dx, 0, dz);
    const wheel3 = createWheel(trailer, 0, 0, dz);
    createConnector(trailer, 0, 0.5, 0);
    trailer.position.set(x, y, z);

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

    scene.add(trailer);
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