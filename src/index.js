import * as THREE from 'three';
const SimplexNoise = require('simplex-noise');

// basic controls
let renderer; let scene; let camera; let sphere; let raycaster;
const simplex = new SimplexNoise(Math.random);
const container = document.getElementById('container');
const mouse = new THREE.Vector2();
const intersect = new THREE.Vector3();


const slowdownFactor = 8;
const numIncrements = 100 * slowdownFactor;

let speed = 10;
let targetSpeed = speed;
const minSpeed = 10;
const speedScale = 50.0 / numIncrements;
let spikeSize = 20;
const minSpikeSize = 0.05;
const spikeSizeScale = 2.0 / numIncrements;
let targetSpikeSize = spikeSize;
let complexity = 70;
const minComplexity = 0.6;
const complexityScale = 1.8 / numIncrements;
let targetComplexity = complexity;


window.onload = () => {
    initScene();
    render();
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xebebf0, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(0, 0, 5);
    camera.updateMatrix();

    raycaster = new THREE.Raycaster();

    window.addEventListener('resize', onWindowResize, false);

    container.onmousemove = (event) => {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        sphere.geometry.computeBoundingSphere();
        if (raycaster.ray.intersectSphere(sphere.geometry.boundingSphere, intersect)) {
            targetSpeed = 20 * slowdownFactor;
            targetSpikeSize = 35 * slowdownFactor;
            targetComplexity = 70 * slowdownFactor;
        } else {
            targetSpeed = 10 * slowdownFactor;
            targetSpikeSize = 20 * slowdownFactor;
            targetComplexity = 50 * slowdownFactor;
        }
    };

    createBlob();
}


function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    updateSphereNoise();
    updateTargetValues();
}

function updateTargetValues() {
    if (speed != targetSpeed) {
        if (speed > targetSpeed) {
            speed > targetSpeed ? speed -= 1 : speed += 1;
        }
    }
    if (spikeSize != targetSpikeSize) {
        spikeSize > targetSpikeSize ? spikeSize -= 1 : spikeSize += 1;
    }
    if (complexity != targetComplexity) {
        complexity > targetComplexity ? complexity -= 1 : complexity += 1;
    }
}


function createBlob() {
    const geometry = new THREE.SphereGeometry(.8, 128, 128);
    const material = new THREE.MeshPhongMaterial({
        color: 0xE4ECFA,
        shininess: 100,
    });

    const lightTop = new THREE.DirectionalLight(0xFFFFFF, .7);
    lightTop.position.set(0, 500, 200);
    lightTop.castShadow = true;
    scene.add(lightTop);

    const lightBottom = new THREE.DirectionalLight(0xFFFFFF, .25);
    lightBottom.position.set(0, -500, 400);
    lightBottom.castShadow = true;
    scene.add(lightBottom);

    const ambientLight = new THREE.AmbientLight(0x798296);
    scene.add(ambientLight);

    sphere = new THREE.Mesh(geometry, material);

    scene.add(sphere);
}

function updateSphereNoise() {
    const speedScaled = speed * speedScale + minSpeed;
    const spikeSizeScaled = spikeSize * spikeSizeScale + minSpikeSize;
    const complexityScaled = complexity * complexityScale + minComplexity;
    const time = performance.now() * 0.00001 * speedScaled * Math.pow(complexityScaled, 3);
    const spikes = spikeSizeScaled * complexityScaled;

    for (let i = 0; i < sphere.geometry.vertices.length; i++) {
        const p = sphere.geometry.vertices[i];
        p.normalize().multiplyScalar(1 + 0.3 * simplex.noise3D(p.x * spikes, p.y * spikes, p.z * spikes + time));
    }

    sphere.geometry.computeVertexNormals();
    sphere.geometry.normalsNeedUpdate = true;
    sphere.geometry.verticesNeedUpdate = true;
};
