import * as THREE from "three";

interface DynamicEnvOptions {
  envmap1: THREE.CubeTexture;
  envmap2: THREE.CubeTexture;
}

export class DynamicEnv {
  private scene: THREE.Scene;
  private envmap1: THREE.CubeTexture;
  private envmap2: THREE.CubeTexture;
  private envmap: THREE.CubeTexture;
  private weight: number = 0;
  private intensity: number = 1;

  constructor(scene: THREE.Scene, options: DynamicEnvOptions) {
    this.scene = scene;
    this.envmap1 = options.envmap1;
    this.envmap2 = options.envmap2;
    this.envmap = this.envmap1; // Start with first environment map
    this.init();
  }

  private init() {
    // Set initial environment map
    this.scene.environment = this.envmap;
  }

  public getEnvMap(): THREE.CubeTexture {
    return this.envmap;
  }

  public setWeight(value: number) {
    this.weight = value;
    // For now, just switch between the two environment maps
    // In a full implementation, you would blend between them
    if (value < 0.5) {
      this.envmap = this.envmap1;
    } else {
      this.envmap = this.envmap2;
    }
    this.scene.environment = this.envmap;
  }

  public setIntensity(value: number) {
    this.intensity = value;
    // Apply intensity by modulating the environment rotation or other properties
    // Since Three.js doesn't have environmentIntensity, we'll store it for later use
  }

  public lerpWeight(targetWeight: number, duration: number) {
    // This would typically use GSAP to animate the weight
    // For now, just set it directly
    this.setWeight(targetWeight);
  }

  public update() {
    // Add any update logic here
  }

  public dispose() {
    this.envmap1?.dispose();
    this.envmap2?.dispose();
  }
}
