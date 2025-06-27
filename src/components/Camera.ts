import * as THREE from "three";

class Camera {
  private camera: THREE.PerspectiveCamera;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.setupCamera();
  }

  private setupCamera() {
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }

  public getInstance(): THREE.PerspectiveCamera {
    return this.camera;
  }
}

export default Camera;
