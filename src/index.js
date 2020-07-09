import * as THREE from 'three';
import './index.css';
const SimplexNoise = require('simplex-noise');

// basic controls
let renderer; let scene; let camera; let sphere; let raycaster;
const simplex = new SimplexNoise(Math.random);
const container = document.getElementById('container');
const mouse = new THREE.Vector2();
const intersect = new THREE.Vector3();
const cameraAngleRange = 0.5;
const cameraRadius = 5;


const slowdownFactor = 2;
const numIncrements = 100 * slowdownFactor;

const speed = 12;
const complexity = 1.5;

let spikeSize = 20;
const minSpikeSize = 0.05;
const spikeSizeScale = 2.0 / numIncrements;
let targetSpikeSize = spikeSize;

let magnitude = 30;
const magnitudeScale = 1.0 / numIncrements;
let targetMagnitude = magnitude;


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
    camera.position.set(0, 0, cameraRadius);
    camera.updateMatrix();

    raycaster = new THREE.Raycaster();

    window.addEventListener('resize', onWindowResize, false);

    window.onpointermove = (event) => {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        const angle = mouse.x * cameraAngleRange;
        camera.position.z = cameraRadius * Math.cos(angle);
        camera.position.x = cameraRadius * Math.sin(angle);
        camera.rotation.y = angle;
        raycaster.setFromCamera(mouse, camera);
        sphere.geometry.computeBoundingSphere();
        if (raycaster.ray.intersectSphere(sphere.geometry.boundingSphere, intersect)) {
            targetSpikeSize = 30 * slowdownFactor;
            targetMagnitude = 38 * slowdownFactor;
        } else {
            targetSpikeSize = 20 * slowdownFactor;
            targetMagnitude = 30 * slowdownFactor;
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
    if (spikeSize != targetSpikeSize) {
        spikeSize > targetSpikeSize ? spikeSize -= 1 : spikeSize += 1;
    }
    if (magnitude != targetMagnitude) {
        magnitude > targetMagnitude ? magnitude -= 1 : magnitude += 1;
    }
}

function createBlob() {
    const geometry = new THREE.SphereGeometry(.8, 128, 128);
    const material = new THREE.MeshPhongMaterial({
        color: 0xE4ECFA,
        specular: 0xffffff,
        shininess: 2000,
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
    sphere.position.x = 0;
    sphere.position.y = 0;
    sphere.position.z = 0;

    scene.add(sphere);
}

function updateSphereNoise() {
    const spikeSizeScaled = spikeSize * spikeSizeScale + minSpikeSize;
    const magnitudeScaled = magnitude * magnitudeScale;
    const time = performance.now() * 0.00001 * speed * Math.pow(complexity, 3);
    const spikes = spikeSizeScaled * complexity;

    for (let i = 0; i < sphere.geometry.vertices.length; i++) {
        const p = sphere.geometry.vertices[i];
        p.normalize().multiplyScalar(1 + magnitudeScaled * simplex.noise3D(p.x * spikes, p.y * spikes, p.z * spikes + time));
    }

    sphere.geometry.computeVertexNormals();
    sphere.geometry.normalsNeedUpdate = true;
    sphere.geometry.verticesNeedUpdate = true;
};
