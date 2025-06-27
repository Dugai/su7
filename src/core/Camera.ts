import * as THREE from "three";
import type Experience from "./Experience";

export default class Camera {
  private experience: Experience;
  public instance: THREE.PerspectiveCamera;

  constructor(experience: Experience) {
    this.experience = experience;
    this.instance = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.setInstance();
  }

  private setInstance(): void {
    // 设置相机位置和朝向
    this.instance.position.set(10, 8, 10);
    this.instance.lookAt(0, 0, 0);
  }

  public resize(): void {
    // 更新相机宽高比
    this.instance.aspect =
      this.experience.sizes.width / this.experience.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  public update(): void {
    // 在这里可以添加相机动画或更新逻辑
  }
}
