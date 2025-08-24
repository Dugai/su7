import * as kokomi from "kokomi.js";
import * as THREE from "three";

import WorldVanilla from "./World/WorldVanilla";
import Debug from "./Debug";
import PostprocessingVanilla from "./PostprocessingVanilla";
import { resources } from "./resources";

export default class ExperienceVanilla extends kokomi.Base {
  params: any;
  controls: kokomi.CameraControls;
  world: WorldVanilla;
  debug: Debug;
  am: kokomi.AssetManager;
  post: PostprocessingVanilla;

  constructor(sel = "#sketch") {
    super(sel, {
      autoAdaptMobile: true,
    });

    (window as any).experience = this;

    this.params = {
      speed: 0,
      cameraPos: {
        x: 0,
        y: 0.8,
        z: -11,
      },
      isCameraMoving: false,
      lightAlpha: 0.3,        // 初始光照不为0
      lightIntensity: 0.5,    // 初始光照强度
      envIntensity: 0.5,      // 初始环境光强度
      envWeight: 0.3,         // 初始环境权重
      reflectIntensity: 5,    // 初始反射强度
      lightOpacity: 1,
      floorLerpColor: 0,
      carBodyEnvIntensity: 1,
      cameraShakeIntensity: 0,
      bloomLuminanceSmoothing: 1.6,
      bloomIntensity: 1,
      speedUpOpacity: 0,
      cameraFov: 33.4,
      furinaLerpColor: 0,
      isRushing: false,
      disableInteract: false,
      isFurina: window.location.hash === "#furina",
    };

    this.debug = new Debug();

    this.renderer.toneMapping = THREE.CineonToneMapping;

    let resourcesToLoad = resources;
    if (!this.params.isFurina) {
      resourcesToLoad = resourcesToLoad.filter(
        (item) => !["driving", "decal"].includes(item.name)
      );
    }
    console.log(resourcesToLoad);

    this.am = new kokomi.AssetManager(this, resourcesToLoad, {
      useMeshoptDecoder: true,
    });

    const camera = this.camera as THREE.PerspectiveCamera;
    camera.fov = this.params.cameraFov;
    camera.updateProjectionMatrix();
    const cameraPos = new THREE.Vector3(
      this.params.cameraPos.x,
      this.params.cameraPos.y,
      this.params.cameraPos.z
    );
    camera.position.copy(cameraPos);
    const lookAt = new THREE.Vector3(0, 0.8, 0);
    camera.lookAt(lookAt);

    const controls = new kokomi.CameraControls(this);
    controls.controls.setTarget(lookAt.x, lookAt.y, lookAt.z);
    this.controls = controls;

    this.world = new WorldVanilla(this);

    // 添加额外的光源照亮汽车
    this.addCarLighting();

    this.post = new PostprocessingVanilla(this);

    this.update(() => {
      if (this.params.isCameraMoving) {
        this.controls.controls.enabled = false;
        this.controls.controls.setPosition(
          this.params.cameraPos.x,
          this.params.cameraPos.y,
          this.params.cameraPos.z
        );
      } else {
        this.controls.controls.enabled = true;
      }
    });
  }

  // 添加专门照亮汽车的光源
  addCarLighting() {
    // 主光源 - 从前上方照射
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(0, 8, 5);
    mainLight.target.position.set(0, 0, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);
    this.scene.add(mainLight.target);

    // 补光 - 从侧面照射
    const fillLight1 = new THREE.DirectionalLight(0x8888ff, 0.8);
    fillLight1.position.set(-5, 3, 2);
    this.scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xff8888, 0.8);
    fillLight2.position.set(5, 3, 2);
    this.scene.add(fillLight2);

    // 环境光增强
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // 车头灯效果
    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 2, -8);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    spotLight.decay = 2;
    spotLight.distance = 50;
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);

    console.log('🔆 已添加汽车专用光源系统');
  }
}
