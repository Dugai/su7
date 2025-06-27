import * as THREE from "three";
import type Experience from "./Experience";

export default class Renderer {
  private experience: Experience;
  public instance: THREE.WebGLRenderer;

  constructor(experience: Experience) {
    this.experience = experience;

    this.instance = new THREE.WebGLRenderer({
      canvas: this.experience.container.querySelector(
        "canvas"
      ) as HTMLCanvasElement,
      antialias: true,
      powerPreference: "high-performance",
    });

    this.setInstance();
  }

  private setInstance(): void {
    // 设置渲染器属性
    this.instance.physicallyCorrectLights = true;
    this.instance.outputEncoding = THREE.sRGBEncoding;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.0;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setClearColor("#000000");
    this.instance.setSize(
      this.experience.sizes.width,
      this.experience.sizes.height
    );
    this.instance.setPixelRatio(Math.min(this.experience.sizes.pixelRatio, 2));
  }

  public resize(): void {
    // 更新渲染器尺寸
    this.instance.setSize(
      this.experience.sizes.width,
      this.experience.sizes.height
    );
    this.instance.setPixelRatio(Math.min(this.experience.sizes.pixelRatio, 2));
  }

  public update(): void {
    // 渲染场景
    this.instance.render(
      this.experience.scene,
      this.experience.camera.instance
    );
  }
}
