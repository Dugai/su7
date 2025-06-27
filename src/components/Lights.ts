import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

class Lights {
  private ambientLight: THREE.AmbientLight = new THREE.AmbientLight(
    0xffffff,
    1
  );
  private directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(
    0xffffff,
    1
  );
  private gui: GUI;

  constructor(scene: THREE.Scene) {
    this.gui = new GUI();
    this.setupLights(scene);
  }

  private setupLights(scene: THREE.Scene) {
    // 环境光
    scene.add(this.ambientLight);

    // 平行光
    this.directionalLight.position.set(5, 5, 5);
    this.directionalLight.castShadow = true;
    scene.add(this.directionalLight);

    // GUI 控制
    this.setupGUI();
  }

  private setupGUI() {
    this.gui.add(this.ambientLight, "intensity", 0, 1, 0.01).name("环境光强度");
    this.gui
      .add(this.directionalLight, "intensity", 0, 1, 0.01)
      .name("平行光强度");
  }

  public dispose() {
    this.gui.destroy();
  }
}

export default Lights;
