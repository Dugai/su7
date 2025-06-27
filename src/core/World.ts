import * as THREE from "three";
import type Experience from "./Experience";

export default class World {
  private experience: Experience;
  private scene: THREE.Scene;
  private resources: any;
  private car: any;
  private environment: any;

  constructor(experience: Experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // 等待资源加载
    this.resources.on("ready", () => {
      this.setup();
    });
  }

  private setup(): void {
    // 设置环境
    this.environment = {};
    this.setEnvironment();

    // 设置汽车模型
    this.car = {};
    this.setCar();
  }

  private setEnvironment(): void {
    // 设置环境贴图
    const environmentMap = this.resources.items.environmentMap;
    this.scene.environment = environmentMap;

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // 添加平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // 设置地面
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        color: 0x808080,
        metalness: 0,
        roughness: 0.5,
      })
    );
    ground.rotation.x = -Math.PI * 0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private setCar(): void {
    const model = this.resources.items.carModel;
    this.car = model.scene;
    this.car.scale.set(1, 1, 1);
    this.car.position.set(0, 0, 0);
    this.car.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    this.scene.add(this.car);
  }

  public resize(): void {
    // 处理尺寸变化
  }

  public update(): void {
    // 更新动画和其他效果
    if (this.car) {
      // 添加汽车动画
      this.car.rotation.y += 0.001;
    }
  }
}
