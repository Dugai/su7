import * as THREE from "three";

export class CameraShake {
  private camera: THREE.PerspectiveCamera;
  private intensity: number = 0;
  private decay: number = 0.95;
  private originalPosition: THREE.Vector3;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.originalPosition = camera.position.clone();
  }

  public setIntensity(value: number) {
    this.intensity = value;
  }

  public update() {
    if (this.intensity > 0.001) {
      // Add random offset to camera position
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * this.intensity,
        (Math.random() - 0.5) * this.intensity,
        (Math.random() - 0.5) * this.intensity
      );

      this.camera.position.copy(this.originalPosition).add(offset);

      // Decay the intensity
      this.intensity *= this.decay;
    } else {
      this.intensity = 0;
      this.camera.position.copy(this.originalPosition);
    }
  }

  public updateOriginalPosition() {
    this.originalPosition.copy(this.camera.position);
  }
}
