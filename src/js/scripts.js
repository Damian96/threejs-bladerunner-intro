import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

class BladeRunnerIntro {
  constructor() {
    this.camera = null;
    this.controls = null;
    this.scene = null;
    this.renderer = null;
    this.labelRenderer = null;
    this.stats = null;
    this.mesh = null;
    this.geometry = null;
    this.material = null;
    this.clock = null;
    this.ambientLight = new THREE.AmbientLight(0xffffff, 4);
    this.lightFront = new THREE.SpotLight(0xffffff, 20, 10);
    this.lightBack = new THREE.PointLight(0xffffff, 0.5);
    this.spotLightHelper = new THREE.SpotLightHelper(this.lightFront);

    this.introTexts = [
      `<p><span style="color:red;">Replicants</span> are bioengineered humans, Designed by tyrell corporation for use off-world. their enhanced strength made them ideal slave labor </p>`,
      `<p>after a series of violent rebellions, their manufacture became prohibited and <span style="color: blue;">tyrell corp went bankrupt</span></p>`,
      `<p><span style="color: blue;">the collapse of ecosystems in the mid 2020s</span> led to the rise of industrialist niander wallace. whose mastery of synthtetic farming averted famine</p>`,
      `<p>wallace acquired the remains of tyrell corp and created a new line of replicants who obey</p>`,
      `<p>many older model replicants - nexus 8s with open-ended lifespans - survived. they are hunted down and 'retired'</p>`,
      `<p>those that hunt them still go by the name...<br/></p>`,
      `<p><span class="br">blade runner</span></p>`,
    ];

    this.sentencesObjs = [];

    this.cameraSpeed = 0.035;
    this.worldWidth = 128;
    this.worldDepth = 128;

    this.init();
    this.animate();
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    this.camera.position.y = 5;
    this.camera.position.z = this.worldDepth / 4;

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.add(this.ambientLight);
    this.scene.background = new THREE.Color(0xffe9b3);
    // this.scene.fog = new THREE.FogExp2(0xffe9b3, 0.117);
    // this.scene.fog = new THREE.Fog(0xffe9b3, 10, 16);

    this.lightBack.position.set(0, 6, 0);
    this.scene.add(this.lightBack);

    this.lightFront.rotation.x = (45 * Math.PI) / 180;
    this.lightFront.rotation.z = (-45 * Math.PI) / 180;
    this.lightFront.position.set(5, 5, 5);
    this.lightFront.castShadow = true;
    this.lightFront.shadow.mapSize.width = 6000;
    this.lightFront.shadow.mapSize.height =
      this.lightFront.shadow.mapSize.width;
    this.lightFront.shadow.camera.near = 1;
    this.lightFront.shadow.camera.far = 16;
    this.scene.add(this.lightFront);
    // this.scene.add(this.spotLightHelper);

    //---------------------------------------------
    //--------------------ADD SMOKES

    const smokeTexture = new THREE.TextureLoader().load("img/smoke2.png");
    const smokeGeometry = new THREE.PlaneGeometry(10, 10);
    const smokeMaterial = new THREE.MeshLambertMaterial({
      map: smokeTexture,
      opacity: 0.6,
      emissive: 0xd6ccb2,
      transparent: true,
    });

    this.smokeParticles = [];
    for (let i = 0; i < 75; i++) {
      let smokeElement = new THREE.Mesh(smokeGeometry, smokeMaterial);
      smokeElement.scale.set(2, 2, 2);

      // position smoke texures at random x,y,z positions
      smokeElement.position.set(1, 5, Math.random() * 100 - 50);
      smokeElement.rotation.z = Math.random() * 10;

      // this.scene.add(smokeElement);
      this.smokeParticles.push(smokeElement);
    }

    //---------------------------------------------
    //--------------------ADD INTRO

    for (let i = 0; i < this.introTexts.length; i++) {
      let element = document.createElement("div");
      element.style.color = "#000000";
      // element.width = window.innerWidth / 3 + "px";
      // element.height = "100px";
      element.style.fontSize = '5rem';
      element.innerHTML = this.introTexts[i];
      let sentence = new CSS2DObject(element);
      sentence.scale.set(1, 1, 1);
      sentence.visible = false;
      sentence.position.set(0, 5, -5);
      this.sentencesObjs.push(sentence);
      this.scene.add(sentence);
    }

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    document.body.appendChild(this.labelRenderer.domElement);

    this.geometry = new THREE.PlaneGeometry(
      100,
      100,
      this.worldWidth - 1,
      this.worldDepth - 1
    );
    this.geometry.rotateX(-Math.PI / 2);

    //---------------------------------------------
    //--------------------CREATE ROAD

    const texture = new THREE.TextureLoader().load("img/sand-texture.jpg");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    texture.encoding = THREE.sRGBEncoding;

    this.material = new THREE.MeshBasicMaterial({
      // color: 0x0044ff,
      map: texture,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new FirstPersonControls(
      this.camera,
      this.labelRenderer.domElement
    );

    this.controls.movementSpeed = 100;
    this.controls.lookSpeed = 0.1;

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls.handleResize();
  }

  moveCamera() {
    // const delta = this.clock.getDelta();
    // const time = this.clock.getElapsedTime() * 10;

    // Move the camera along a straight line
    if (this.camera.position.z < this.worldDepth) {
      this.camera.position.z -= this.cameraSpeed;
      if (parseInt(this.camera.position.z) % this.sentencesObjs.length == 0) {
        const sentence = this.sentencesObjs.shift();
        sentence.position.copy(this.camera.position);
        sentence.position.z -= 10;
        sentence.visible = true;
        console.log(this.sentencesObjs);
      }
    }
  }

  moveSpotlight() {
    // Update the position of the spotlight to follow the camera
    this.spotlight.position.copy(this.camera.position);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.moveCamera();
    this.render();
    this.stats.update();
  }

  render() {
    const delta = this.clock.getDelta();
    // const time = this.clock.getElapsedTime() * 10;

    // go through all smoke textures and rotate them
    for (let i = 0; i < this.smokeParticles.length; i++) {
      this.smokeParticles[i].rotation.z +=
        (Math.random() * Math.sinh(Math.random())) / 100 + delta * 0.12;
    }

    // this.controls.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}

// Instantiate the WaterSimulation class to create the 3D scene
const waterSim = new BladeRunnerIntro();
