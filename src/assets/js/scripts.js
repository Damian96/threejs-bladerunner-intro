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
    this.clock = new THREE.Clock();

    this.introTexts = [
      `<p><span style="color:red;">Replicants</span> are bioengineered humans, designed by Tyrell Corporatio for use off-world.<br/> their enhanced strength made them ideal slave labor </p>`,
      `<p>after a series of violent rebellions, <br/>their manufacturing became prohibited and <span style="color: blue;">Tyrell Corp. went bankrupt</span></p>`,
      `<p><span style="color: blue;">the collapse of ecosystems in the mid 2020s</span> led to the rise of industrialist Niander Wallace.<br/> whose mastery of synthtetic farming averted famine</p>`,
      `<p>wallace acquired the remains of Tyrell Corp and created a new line of replicants who obey</p>`,
      `<p>many older model replicants - nexus 8s with open-ended lifespans - survived.<br/> they are hunted down and 'retired'</p>`,
      `<p>those that hunt them still go by the name...<br/></p>`,
      `<p style="margin:auto; text-align:center;"><strong>blade runners</strong></p>`,
    ];

    this.sentenceArr = [];

    this.cameraSpeed = 0.015;
    this.worldWidth = 200;
    this.worldDepth = 100;
    this.lastCameraX = null;
    this.sound = null;
    this.smokeParticles = [];
    this.sentenceInterval = null;

    this.init();
    this.animate();
  }

  init() {
    //---------------------------------------------
    //--------------------CREATE SCENE AND CAMERA

    const endOfWorld = new THREE.Vector3(this.worldWidth, 5, 0);
    const startOfWorld = new THREE.Vector3(-this.worldDepth, 5, 0);

    this.scene = new THREE.Scene();
    const setColor = 0xbaa266; // 0xffe9b3
    this.scene.background = new THREE.Color(setColor);
    this.scene.fog = new THREE.FogExp2(setColor, 0.15);
    this.geometry = new THREE.PlaneGeometry(
      this.worldWidth,
      this.worldDepth,
      this.worldWidth - 1,
      this.worldDepth - 1
    );
    this.geometry.rotateX(-Math.PI / 2);

    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    this.camera.position.x = startOfWorld.x;
    this.camera.position.y = 5;
    this.lastCameraX = this.camera.position.x;
    this.camera.lookAt(endOfWorld);

    // Debugging
    // const forward = this.camera.getWorldDirection(new THREE.Vector3(0, 0, 0));
    // const arrowHelper = new THREE.ArrowHelper(
    //   forward,
    //   this.camera.position,
    //   10,
    //   0xff0000
    // );
    // this.scene.add(arrowHelper);

    //---------------------------------------------
    //--------------------ADD SMOKES

    const smoke = new THREE.TextureLoader().load(
      document.getElementById("smoke-texture").getAttribute("src")
    );
    const smokeGeometry = new THREE.PlaneGeometry(10, 10);
    const smokeMaterial = new THREE.MeshLambertMaterial({
      map: smoke,
      opacity: 0.4,
      emissive: 0xd6ccb2,
      transparent: true,
      side: THREE.BackSide,
    });

    for (
      let i = startOfWorld.x;
      i < endOfWorld.x;
      i += this.cameraSpeed * 150
    ) {
      let smokeElement = new THREE.Mesh(smokeGeometry, smokeMaterial);
      smokeElement.scale.set(2, 2, 2);
      smokeElement.lookAt(endOfWorld);

      smokeElement.position.set(i, 5, 0);
      // smokeElement.rotation.z = Math.random() * 10;

      this.scene.add(smokeElement);
      this.smokeParticles.push(smokeElement);
    }

    console.log(this.smokeParticles);

    //---------------------------------------------
    //--------------------ADD INTRO

    for (let i = 0; i < this.introTexts.length; i++) {
      let element = document.createElement("div");
      element.style.color = "#000000";
      element.classList.add("fadeOut");
      element.innerHTML = this.introTexts[i];

      let sentence = new CSS2DObject(element);
      sentence.visible = false;
      sentence.scale.set(1, 1, 1);
      this.sentenceArr.push(sentence);
      this.scene.add(sentence);
    }

    // console.log(this.sentenceArr);
    let sentence = this.sentenceArr.shift();
    sentence.lookAt(this.camera.position);
    sentence.visible = true;
    this.sentenceInterval = setInterval(() => {
      if (this.sentenceArr.length > 0) {
        const sentence = this.sentenceArr.shift();
        sentence.lookAt(this.camera.position);
        sentence.visible = true;
        // console.log(this.sentenceArr);
      }
    }, ((this.worldWidth - Math.abs(this.camera.position.x)) / this.introTexts.length) * 1000);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.left = "0px";
    this.labelRenderer.domElement.classList.add("canvas");
    document.body.appendChild(this.labelRenderer.domElement);

    //---------------------------------------------
    //--------------------ADD INTRO MUSIC
    const listener = new THREE.AudioListener();
    this.camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
      document.getElementById("intro-audio").getAttribute("src"),
      function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
      }
    );

    document
      .getElementById("toggle-sound")
      .addEventListener("click", function () {
        if (sound.isPlaying) {
          this.classList.add("paused");
          sound.pause();
        } else {
          this.classList.remove("paused");
          sound.play();
        }
      });

    //---------------------------------------------
    //--------------------CREATE SAND ROAD

    const texture = new THREE.TextureLoader().load(
      document.getElementById("sand-texture").getAttribute("src")
    );
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

    //---------------------------------------------
    //--------------------DEBUGGING

    this.controls = new FirstPersonControls(
      this.camera,
      this.labelRenderer.domElement
    );

    this.controls.movementSpeed = 100;
    this.controls.lookSpeed = 0.1;

    // this.stats = new Stats();
    // document.body.appendChild(this.stats.dom);

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls.handleResize();
  }

  moveCamera() {
    if (Math.abs(this.camera.position.x) < this.worldWidth) {
      this.camera.position.x += this.cameraSpeed;
      // console.log("moving camera")
    } else {
      clearInterval(this.sentenceInterval);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.moveCamera();
    this.render();
    // this.stats.update();
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

console.log(new BladeRunnerIntro());
