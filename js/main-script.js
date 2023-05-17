//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
// cameras
var activeCamera 
const cameras = {};
// 3D objects
const objs = {};
// other 
var scene, renderer;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xadd8e6); // light-blue
    createTrailer(0,0,0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createOrthographicCamera(x, y, z) {
    'use strict';
    var camera = new THREE.OrthographicCamera( window.innerWidth / - 32,
                                            window.innerWidth / 32, 
                                            window.innerHeight / 32, 
                                            window.innerHeight / - 32, 
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
   cameras['frontalCamera'] = createOrthographicCamera(0, 0, 6); 
   cameras['lateralCamera'] = createOrthographicCamera(-6, 0, 0); 
   cameras['topCamera'] = createOrthographicCamera(0, 6, 0); 
   cameras['isometricCamera'] = createOrthographicCamera(6, 6, 6); 
   cameras['perspectiveCamera'] = createPerspectiveCamera(6, 6, 6); 
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
    const geometry = new THREE.BoxGeometry(4.8, 7.2, 9.6);
    const materials =  new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const container = new THREE.Mesh(geometry, materials);
    container.name = 'container';
    
    /*
    const circleGeometry = new THREE.CircleGeometry(1, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
    circleMesh.position.z = 4.8;
    trailer.add(circleMesh);
    */

    trailer.add(container);  
}

function createWheel(trailer, x, y, z) {
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    const wheel = new THREE.Mesh(geometry, material);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, y, z);
    trailer.add(wheel);
}

function createConnector(trailer, x, y, z) {
    const geometry = new THREE.BoxGeometry(2, 0.2, 0.2);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: true });
    const connector = new THREE.Mesh(geometry, material);
    connector.position.set(x, y, z);
    trailer.add(connector);
}

function createTrailer(x, y, z) {
    'use strict';
    const trailer = new THREE.Group();

    createContainer(trailer);

    createWheel(trailer, -2.4, -0.4, 0.6) 
    createWheel(trailer, -2.4, -0.4, -0.6);
    createWheel(trailer, 2.4, -0.4, 0.6);
    createWheel(trailer, 2.4, -0.4, -0.6);
    createConnector(trailer, 0, 0.5, 0);
    trailer.position.set(x, y, z);

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
        for (const key in cameras) {
            const camera = cameras[key];
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

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
        default:
            // Do nothing for other keys
            return;
    }
}