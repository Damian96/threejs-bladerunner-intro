import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import "../sounds/intro-audio.mp3";
import "../img/sand-texture.jpg";
import "../img/smoke2.png";

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
      `<p><span style="color:red;">Replicants</span> are bioengineered humans, Designed by tyrell corporation for use off-world.<br/> their enhanced strength made them ideal slave labor </p>`,
      `<p>after a series of violent rebellions, <br/>their manufacturer became prohibited and <span style="color: blue;">tyrell corp went bankrupt</span></p>`,
      `<p><span style="color: blue;">the collapse of ecosystems in the mid 2020s</span> led to the rise of industrialist niander wallace.<br/> whose mastery of synthtetic farming averted famine</p>`,
      `<p>wallace acquired the remains of tyrell corp and created a new line of replicants who obey</p>`,
      `<p>many older model replicants - nexus 8s with open-ended lifespans - survived.<br/> they are hunted down and 'retired'</p>`,
      `<p>those that hunt them still go by the name...<br/></p>`,
      `<p><span class="br">blade runner</span></p>`,
    ];

    this.sentenceArr = [];

    this.cameraSpeed = 0.015;
    this.worldWidth = 128;
    this.worldDepth = 128;
    this.lastCameraPosZ = null;
    this.sound = null;

    this.init();
    this.animate();
  }

  init() {
    //---------------------------------------------
    //--------------------CREATE SCENE AND CAMERA

    this.camera = new THREE.PerspectiveCamera(
      100,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    this.camera.position.y = 5;
    this.camera.position.z = this.cameraSpeed + 5;
    this.lastCameraPosZ = this.camera.position.z;

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.add(this.ambientLight);
    const setColor = 0xbaa266; // 0xffe9b3
    this.scene.background = new THREE.Color(setColor);
    this.scene.fog = new THREE.FogExp2(setColor, 0.117);

    this.geometry = new THREE.PlaneGeometry(
      this.worldWidth * 2,
      this.worldDepth * 2,
      this.worldWidth - 1,
      this.worldDepth - 1
    );
    this.geometry.rotateX(-Math.PI / 2);

    //---------------------------------------------
    //--------------------ADD LIGHTS

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

      this.scene.add(smokeElement);
      this.smokeParticles.push(smokeElement);
    }

    //---------------------------------------------
    //--------------------ADD INTRO

    for (let i = 0; i < this.introTexts.length; i++) {
      let element = document.createElement("div");
      element.style.color = "#000000";
      element.classList.add("fadeOut");
      element.style.zIndex = i + 1; // stack Sentences on top of each other
      element.innerHTML = this.introTexts[i];

      let sentence = new CSS2DObject(element);
      sentence.visible = false;
      sentence.scale.set(1, 1, 1);
      sentence.position.set(0, 5, -5);
      this.sentenceArr.push({
        object: sentence,
        showAt: Number.parseFloat(
          ((this.worldDepth - this.camera.position.z) /
            (this.introTexts.length + 1)) *
            i
        ),
        shown: false,
      });

      this.scene.add(sentence);
    }

    // console.log(this.sentenceArr);
    this.sentenceArr = this.sentenceArr.reverse();

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
    audioLoader.load("sounds/intro-audio.mp3", function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.5);
      // sound.play();
    });

    document
      .getElementById("toggle-sound")
      .addEventListener("click", function () {
        if (sound.isPlaying) {
          sound.pause();
        } else {
          sound.play();
        }
      });

    //---------------------------------------------
    //--------------------CREATE SMOKE ROAD

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

    //---------------------------------------------
    //--------------------DEBUGGING

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

  /**
   *
   * @return Object|false
   */
  getSentenceAtPosZ(currentPosZ) {
    const pos = Number.parseFloat(Math.abs(currentPosZ));
    const prevPos = Number.parseFloat(this.lastCameraPosZ);
    // console.log(pos, prevPos);
    for (let i = 0; i < this.sentenceArr.length; i++) {
      if (
        this.sentenceArr[i].showAt >= prevPos &&
        this.sentenceArr[i].showAt <= pos &&
        !this.sentenceArr[i].shown
      ) {
        this.sentenceArr[i].shown = true;
        return this.sentenceArr[i].object;
      }
    }
    return false;
  }

  moveCamera() {
    // const delta = this.clock.getDelta();
    // const time = this.clock.getElapsedTime() * 10;

    // Move the camera along a straight line
    if (Math.abs(this.camera.position.z) < this.worldDepth) {
      // console.log("moving camera");
      this.camera.position.z -= this.cameraSpeed;
      const showSentence = this.getSentenceAtPosZ(this.camera.position.z);
      // console.log(Math.abs(this.camera.position.z));
      if (showSentence) {
        showSentence.position.copy(this.camera.position);
        showSentence.position.z -= 10;
        showSentence.visible = true;
        // console.log(this.sentenceArr);
      }
      this.lastCameraPosZ = this.camera.position.z;
    } else {
      window.location.replace(
        "https://github.com/Damian96/threejs-bladerunner-intro"
      );
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

new BladeRunnerIntro();
