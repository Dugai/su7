import * as THREE from "three";
import gsap from "gsap";
import { Car } from "./Car";
import { StartRoom } from "./StartRoom";
import { DynamicEnv } from "./DynamicEnv";
import { Speedup } from "./Speedup";
import { CameraShake } from "./CameraShake";
import { Furina } from "./Furina";
import { Params } from "../hooks/useParams";

export class World {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private assets: any;
  private params: Params;

  private car: Car | null = null;
  private startRoom: StartRoom | null = null;
  private dynamicEnv: DynamicEnv | null = null;
  private speedup: Speedup | null = null;
  private cameraShake: CameraShake | null = null;
  private furina: Furina | null = null;
  private environment: THREE.WebGLCubeRenderTarget | null = null;

  private timelines: gsap.core.Timeline[] = [];

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    assets: any,
    params: Params
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.assets = assets;
    this.params = params;

    this.init();
  }

  private init() {
    // Handle assets
    this.handleAssets();

    // Create environment maps
    const envmap1 = this.createEnvMapFromHDR(this.assets["ut_env_night"]);
    const envmap2 = this.createEnvMapFromHDR(this.assets["ut_env_light"]);

    // Initialize components
    this.dynamicEnv = new DynamicEnv(this.scene, { envmap1, envmap2 });
    this.scene.environment = this.dynamicEnv.getEnvMap();

    this.startRoom = new StartRoom(
      this.scene,
      this.assets,
      this.camera,
      this.renderer
    );
    this.car = new Car(this.scene, this.assets, this.params);
    this.speedup = new Speedup(this.scene, this.assets);
    this.cameraShake = new CameraShake(this.camera);

    if (this.params.isFurina) {
      this.furina = new Furina(this.scene, this.assets);
    }

    // Create environment for reflections
    this.environment = new THREE.WebGLCubeRenderTarget(512);
    this.environment.texture.type = THREE.UnsignedByteType;

    // Initialize timelines
    for (let i = 0; i < 9; i++) {
      this.timelines.push(gsap.timeline());
    }
  }

  private handleAssets() {
    // Configure textures
    const textures = [
      "t_car_body_AO",
      "t_startroom_ao",
      "t_startroom_light",
      "t_floor_normal",
      "t_floor_roughness",
      "decal",
    ];

    textures.forEach((textureName) => {
      const texture = this.assets[textureName];
      if (texture instanceof THREE.Texture) {
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
      }
    });

    // Configure HDR textures
    const hdrTextures = ["ut_env_night", "ut_env_light"];
    hdrTextures.forEach((textureName) => {
      const texture = this.assets[textureName];
      if (texture instanceof THREE.Texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
      }
    });
  }

  private createEnvMapFromHDR(hdrTexture: THREE.Texture): THREE.CubeTexture {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
    pmremGenerator.dispose();
    return envMap as THREE.CubeTexture;
  }

  public enter() {
    this.params.disableInteract = true;

    // Set initial states
    this.dynamicEnv?.setWeight(0);
    this.dynamicEnv?.setIntensity(0);
    this.startRoom?.setLightIntensity(0);
    this.startRoom?.setFloorColor(new THREE.Color("#000000"));
    this.startRoom?.setReflectIntensity(0);
    this.furina?.setColor(new THREE.Color("#000000"));

    // Hide loader
    const loaderScreen = document.querySelector(".loader-screen");
    if (loaderScreen) {
      loaderScreen.classList.add("hollow");
    }

    // Start entrance animation
    this.params.isCameraMoving = true;

    const t1 = this.timelines[0];
    t1.to(this.params.cameraPos, {
      x: 0,
      y: 0.8,
      z: -7,
      duration: 4,
      ease: "power2.inOut",
    })
      .to(
        this.params,
        {
          lightAlpha: 1,
          duration: 1,
          ease: "power2.inOut",
        },
        "-=2"
      )
      .to(
        this.params,
        {
          lightIntensity: 1,
          duration: 2,
          ease: "power2.inOut",
        },
        "-=1"
      )
      .to(
        this.params,
        {
          envIntensity: 1,
          envWeight: 1,
          duration: 2,
          ease: "power2.inOut",
        },
        "-=1"
      )
      .to(
        this.params,
        {
          reflectIntensity: 1,
          duration: 1,
          ease: "power2.inOut",
        },
        "-=0.5"
      )
      .to(
        this.params,
        {
          floorLerpColor: 1,
          duration: 1,
          ease: "power2.inOut",
        },
        "-=0.5"
      )
      .to(
        this.params,
        {
          carBodyEnvIntensity: 1,
          duration: 1,
          ease: "power2.inOut",
        },
        "-=0.5"
      )
      .call(() => {
        this.params.isCameraMoving = false;
        this.params.disableInteract = false;
      });
  }

  public async rush() {
    if (this.params.isRushing) {
      this.rushDone();
      return;
    }

    if (this.params.disableInteract) {
      return;
    }

    this.params.disableInteract = true;
    this.clearAllTweens();

    const floorColor = new THREE.Color("#ffffff");
    const blackColor = new THREE.Color("#000000");
    const furinaColor = new THREE.Color("#ffffff");
    const furinaFadeColor = new THREE.Color("#666666");

    // Start driving animation
    this.furina?.drive();

    // Speed animation
    const t4 = this.timelines[3];
    t4.to(this.params, {
      speed: 4,
      duration: 2,
      ease: "power2.out",
      onComplete: () => {
        this.params.isRushing = true;
        this.params.disableInteract = false;
      },
    }).to(this.params, {
      speed: 10,
      duration: 4,
      ease: "power2.out",
    });

    // Light opacity animation
    const t5 = this.timelines[4];
    t5.to(this.params, {
      lightOpacity: 0,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        this.startRoom?.setLightOpacity(this.params.lightOpacity);
      },
    });

    // Floor and Furina color animation
    const t6 = this.timelines[5];
    t6.fromTo(
      this.params,
      {
        floorLerpColor: 0,
        furinaLerpColor: 0,
      },
      {
        floorLerpColor: 1,
        furinaLerpColor: 1,
        duration: 4,
        ease: "none",
        onUpdate: () => {
          const currentFloorColor = floorColor
            .clone()
            .lerp(blackColor, this.params.floorLerpColor);
          this.startRoom?.setFloorColor(currentFloorColor);

          const currentFurinaColor = furinaColor
            .clone()
            .lerp(furinaFadeColor, this.params.furinaLerpColor);
          this.furina?.setColor(currentFurinaColor);
        },
      }
    );

    // Environment intensity animation
    const t7 = this.timelines[6];
    t7.to(this.params, {
      envIntensity: 0.01,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        this.dynamicEnv?.setIntensity(this.params.envIntensity);
      },
    });

    // Speedup and camera FOV animation
    const t8 = this.timelines[7];
    t8.to(this.params, {
      speedUpOpacity: 1,
      cameraFov: 36,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        this.speedup?.setOpacity(this.params.speedUpOpacity);

        const camera = this.camera as THREE.PerspectiveCamera;
        camera.fov = this.params.cameraFov;
        camera.updateProjectionMatrix();
      },
    });

    // Wait a bit then switch to night environment
    await this.sleep(1000);

    // Switch to night environment
    this.dynamicEnv?.setWeight(0); // Switch to night environment

    // Final effects animation
    const t9 = this.timelines[8];
    t9.to(this.params, {
      carBodyEnvIntensity: 10,
      cameraShakeIntensity: 1,
      bloomLuminanceSmoothing: 0.4,
      bloomIntensity: 2,
      duration: 4,
      ease: "power2.out",
      onUpdate: () => {
        this.car?.setBodyEnvIntensity(this.params.carBodyEnvIntensity);
        this.cameraShake?.setIntensity(this.params.cameraShakeIntensity);
        // Post-processing effects would be applied here
      },
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private clearAllTweens() {
    this.timelines.forEach((timeline) => {
      timeline.kill();
    });
    // Reinitialize timelines
    this.timelines = [];
    for (let i = 0; i < 9; i++) {
      this.timelines.push(gsap.timeline());
    }
  }

  private rushDone() {
    const t3 = this.timelines[2];
    t3.to(this.params, {
      speed: 0,
      duration: 2,
      ease: "power2.out",
    })
      .to(
        this.params,
        {
          cameraShakeIntensity: 0,
          duration: 1,
          ease: "power2.out",
        },
        0
      )
      .to(
        this.params,
        {
          speedUpOpacity: 0,
          duration: 1,
          ease: "power2.out",
        },
        0.5
      )
      .to(
        this.params,
        {
          bloomIntensity: 1,
          duration: 1,
          ease: "power2.out",
        },
        0.5
      )
      .call(() => {
        this.params.isRushing = false;
        this.params.disableInteract = false;
      });
  }

  public update() {
    // Update components
    this.car?.update();
    this.startRoom?.update();
    this.dynamicEnv?.update();
    this.speedup?.update();
    this.cameraShake?.update();
    this.furina?.update();

    // Update dynamic values
    if (this.dynamicEnv) {
      this.dynamicEnv.setWeight(this.params.envWeight);
      this.dynamicEnv.setIntensity(this.params.envIntensity);
    }

    if (this.startRoom) {
      this.startRoom.setLightIntensity(this.params.lightIntensity);
      this.startRoom.setReflectIntensity(this.params.reflectIntensity);
    }

    if (this.speedup) {
      this.speedup.setOpacity(this.params.speedUpOpacity);
      this.speedup.setSpeed(this.params.speed);
    }

    if (this.cameraShake) {
      this.cameraShake.setIntensity(this.params.cameraShakeIntensity);
    }

    if (this.car) {
      this.car.setSpeed(this.params.speed);
      this.car.setBodyEnvIntensity(this.params.carBodyEnvIntensity);
    }
  }

  public dispose() {
    // Clear all timelines
    this.timelines.forEach((timeline) => timeline.clear());

    // Dispose components
    this.car?.dispose();
    this.startRoom?.dispose();
    this.dynamicEnv?.dispose();
    this.speedup?.dispose();
    this.furina?.dispose();
    this.environment?.dispose();
  }
}
