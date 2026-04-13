import * as THREE from "three";
import gsap from "gsap";

import type Experience from "../Experience";
import Car from "./Car";
import StartRoom from "./StartRoom";
import DynamicEnv from "./DynamicEnv";
import Speedup from "./Speedup";
import CameraShake from "./CameraShake";

export default class World {
  experience: Experience;

  // 组件
  car: Car | null = null;
  startRoom: StartRoom | null = null;
  dynamicEnv: DynamicEnv | null = null;
  speedup: Speedup | null = null;
  cameraShake: CameraShake | null = null;

  // 环境反射
  environment: THREE.WebGLCubeRenderTarget | null = null;

  // GSAP时间线
  t1: gsap.core.Timeline;
  t2: gsap.core.Timeline;
  t3: gsap.core.Timeline;
  t4: gsap.core.Timeline;
  t5: gsap.core.Timeline;
  t6: gsap.core.Timeline;
  t7: gsap.core.Timeline;
  t8: gsap.core.Timeline;
  t9: gsap.core.Timeline;

  constructor(experience: Experience) {
    this.experience = experience;

    // 创建GSAP时间线
    this.t1 = gsap.timeline();
    this.t2 = gsap.timeline();
    this.t3 = gsap.timeline();
    this.t4 = gsap.timeline();
    this.t5 = gsap.timeline();
    this.t6 = gsap.timeline();
    this.t7 = gsap.timeline();
    this.t8 = gsap.timeline();
    this.t9 = gsap.timeline();

    this.init();
  }

  private async init() {
    try {
      // 设置场景背景
      this.experience.scene.background = new THREE.Color("black");

      // 创建动态环境
      await this.createDynamicEnvironment();

      // 创建展厅
      this.createStartRoom();

      // 创建汽车
      this.createCar();

      // 创建速度线特效
      this.createSpeedup();

      // 创建环境反射
      this.createEnvironmentReflection();

      // 创建相机震动
      this.createCameraShake();

      // 设置交互
      this.setupInteractions();

      // 开始入场动画
      this.enter();
    } catch (error) {
      console.error("❌ World初始化失败:", error);
    }
  }

  private async createDynamicEnvironment() {
    const envmap1 = this.experience.am?.createEnvMapFromHDR("ut_env_night");
    const envmap2 = this.experience.am?.createEnvMapFromHDR("ut_env_light");

    if (envmap1 && envmap2) {
      this.dynamicEnv = new DynamicEnv(this.experience, {
        envmap1,
        envmap2,
      });

      // 设置场景环境
      this.experience.scene.environment = this.dynamicEnv.envmap;
      this.dynamicEnv.setWeight(1);
      this.dynamicEnv.setIntensity(0.1);
    } else {
      console.warn("⚠️ HDR环境贴图未找到，跳过动态环境创建");
    }
  }

  private createStartRoom() {
    const startRoomModel = this.experience.am?.getGLTF("sm_startroom");
    if (startRoomModel) {
      this.startRoom = new StartRoom(this.experience, startRoomModel);
    } else {
      console.warn("⚠️ 展厅模型未找到，跳过展厅创建");
    }
  }

  private createCar() {
    const carModel = this.experience.am?.getGLTF("sm_car");
    if (carModel) {
      this.car = new Car(this.experience, carModel);
    } else {
      console.warn("⚠️ 汽车模型未找到，跳过汽车创建");
    }
  }

  private createSpeedup() {
    const speedupModel = this.experience.am?.getGLTF("sm_speedup");
    if (speedupModel) {
      this.speedup = new Speedup(this.experience, speedupModel);
    } else {
      console.warn("⚠️ 速度线模型未找到，跳过速度线创建");
    }
  }

  private createEnvironmentReflection() {
    // 创建立方体渲染目标用于环境反射
    this.environment = new THREE.WebGLCubeRenderTarget(512, {
      type: THREE.UnsignedByteType,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
  }

  private createCameraShake() {
    this.cameraShake = new CameraShake(this.experience);
    this.cameraShake.setIntensity(0);
  }

  private setupInteractions() {
    if (this.car) {
      // 添加点击事件监听
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseClick = (event: MouseEvent) => {
        if (this.experience.params.disableInteract) return;

        // 计算鼠标位置
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 射线检测
        raycaster.setFromCamera(mouse, this.experience.camera);
        const intersects = raycaster.intersectObject(
          this.car!.model.scene,
          true
        );

        if (intersects.length > 0) {
          this.rush();
        }
      };

      this.experience.renderer.domElement.addEventListener(
        "click",
        onMouseClick
      );
    }
  }

  update(deltaTime: number, elapsedTime: number) {
    // 更新所有组件
    this.car?.update(deltaTime, elapsedTime);
    this.startRoom?.update(deltaTime, elapsedTime);
    this.dynamicEnv?.update(deltaTime, elapsedTime);
    this.speedup?.update(deltaTime, elapsedTime);
    this.cameraShake?.update(deltaTime, elapsedTime);
  }

  // 清除所有动画
  clearAllTweens() {
    this.t1.clear();
    this.t2.clear();
    this.t3.clear();
    this.t4.clear();
    this.t5.clear();
    this.t6.clear();
    this.t7.clear();
    this.t8.clear();
    this.t9.clear();
  }

  // 入场动画
  enter() {
    this.experience.params.disableInteract = true;

    // 初始化状态
    if (this.dynamicEnv) {
      this.dynamicEnv.setWeight(0);
      this.dynamicEnv.setIntensity(0);
    }

    if (this.startRoom) {
      this.startRoom.setLightIntensity(0);
      this.startRoom.setFloorColor(new THREE.Color("#000000"));
      this.startRoom.setReflectIntensity(0);
    }

    // 显示挖空的加载屏幕
    document.querySelector(".loader-screen")?.classList.add("hollow");

    // 相机动画
    this.experience.params.isCameraMoving = true;
    this.t1.to(this.experience.params.cameraPos, {
      x: 0,
      y: 0.8,
      z: -7,
      duration: 4,
      ease: "power2.inOut",
      onComplete: () => {
        this.experience.params.isCameraMoving = false;
        this.experience.params.disableInteract = false;
      },
    });

    // 光照动画
    const lightColor = new THREE.Color();
    const blackColor = new THREE.Color("#000000");
    const whiteColor = new THREE.Color("#ffffff");

    this.t2.to(this.experience.params, {
      lightAlpha: 0.5,
      lightIntensity: 0.3,
      reflectIntensity: 1,
      duration: 3,
      delay: 1,
      ease: "power2.inOut",
      onUpdate: () => {
        lightColor
          .copy(blackColor)
          .lerp(whiteColor, this.experience.params.lightAlpha);

        if (this.startRoom) {
          this.startRoom.setLightIntensity(
            this.experience.params.lightIntensity
          );
          this.startRoom.setFloorColor(lightColor);
          this.startRoom.setReflectIntensity(
            this.experience.params.reflectIntensity
          );
        }
      },
    });

    // 环境动画
    this.t3
      .to(this.experience.params, {
        envIntensity: 0.1,
        duration: 3,
        delay: 0.5,
        ease: "power2.inOut",
        onUpdate: () => {
          if (this.dynamicEnv) {
            this.dynamicEnv.setIntensity(this.experience.params.envIntensity);
          }
        },
      })
      .to(
        this.experience.params,
        {
          envWeight: 0.8,
          duration: 3,
          ease: "power2.inOut",
          onUpdate: () => {
            if (this.dynamicEnv) {
              this.dynamicEnv.setWeight(this.experience.params.envWeight);
            }
          },
        },
        "-=2.5"
      );

  }

  // 直接进入（跳过动画）
  enterDirectly() {
    document.querySelector(".loader-screen")?.classList.add("hollow");
    this.experience.params.isCameraMoving = false;
    this.experience.controls.object.position.set(0, 0.8, -7);
    this.experience.params.envIntensity = 1;
    this.experience.params.disableInteract = false;

    if (this.dynamicEnv) {
      this.dynamicEnv.setIntensity(1);
      this.dynamicEnv.setWeight(1);
    }
  }

  // 冲刺模式
  async rush() {
    if (this.experience.params.isRushing) {
      this.rushDone();
      return;
    }

    if (this.experience.params.disableInteract) {
      return;
    }

    this.experience.params.disableInteract = true;
    this.clearAllTweens();

    const floorColor = new THREE.Color();
    const blackColor = new THREE.Color("#000000");
    const camera = this.experience.camera;

    // 速度动画
    this.t4
      .to(this.experience.params, {
        speed: 4,
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
          this.experience.params.isRushing = true;
          this.experience.params.disableInteract = false;
        },
      })
      .to(this.experience.params, {
        speed: 10,
        duration: 4,
        ease: "power2.out",
      });

    // 光照透明度动画
    this.t5.to(this.experience.params, {
      lightOpacity: 0,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (this.startRoom) {
          this.startRoom.setLightOpacity(this.experience.params.lightOpacity);
        }
      },
    });

    // 地面颜色动画
    this.t6.fromTo(
      this.experience.params,
      {
        floorLerpColor: 0,
      },
      {
        floorLerpColor: 1,
        duration: 4,
        ease: "none",
        onUpdate: () => {
          floorColor.lerp(blackColor, this.experience.params.floorLerpColor);
          if (this.startRoom) {
            this.startRoom.setFloorColor(floorColor);
          }
        },
      }
    );

    // 环境强度动画
    this.t7.to(this.experience.params, {
      envIntensity: 0.01,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (this.dynamicEnv) {
          this.dynamicEnv.setIntensity(this.experience.params.envIntensity);
        }
      },
    });

    // 速度线和相机FOV动画
    this.t8.to(this.experience.params, {
      speedUpOpacity: 1,
      cameraFov: 36,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        if (this.speedup) {
          this.speedup.setOpacity(this.experience.params.speedUpOpacity);
        }

        camera.fov = this.experience.params.cameraFov;
        camera.updateProjectionMatrix();
      },
    });

    // 等待1秒后切换环境反射
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (this.environment) {
      this.experience.scene.environment = this.environment.texture;
    }

    // 汽车和后处理效果动画
    this.t9.to(this.experience.params, {
      carBodyEnvIntensity: 10,
      cameraShakeIntensity: 1,
      bloomLuminanceSmoothing: 0.4,
      bloomIntensity: 2,
      duration: 4,
      ease: "power2.out",
      onUpdate: () => {
        if (this.car) {
          this.car.setBodyEnvmapIntensity(
            this.experience.params.carBodyEnvIntensity
          );
        }

        if (this.cameraShake) {
          this.cameraShake.setIntensity(
            this.experience.params.cameraShakeIntensity
          );
        }

        if (this.experience.post) {
          this.experience.post.setLuminanceSmoothing(
            this.experience.params.bloomLuminanceSmoothing
          );
          this.experience.post.setIntensity(
            this.experience.params.bloomIntensity
          );
        }
      },
    });
  }

  // 结束冲刺模式
  rushDone() {
    if (this.experience.params.disableInteract) {
      return;
    }

    this.experience.params.disableInteract = true;
    this.clearAllTweens();

    // 恢复所有参数到初始状态的动画...
    // （这里可以添加完整的恢复动画逻辑）

    this.experience.params.isRushing = false;
    this.experience.params.disableInteract = false;

    // 恢复动态环境
    if (this.dynamicEnv) {
      this.experience.scene.environment = this.dynamicEnv.envmap;
    }
  }

  dispose() {
    // 清理所有组件
    this.car?.dispose();
    this.startRoom?.dispose();
    this.dynamicEnv?.dispose();
    this.speedup?.dispose();
    this.cameraShake?.dispose();

    // 清理环境反射
    this.environment?.dispose();

    // 清理时间线
    this.clearAllTweens();
  }
}
