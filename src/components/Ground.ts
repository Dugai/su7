import * as THREE from "three";

class Ground {
  private ground: THREE.Mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: 0x808080,
      side: THREE.DoubleSide,
    })
  );

  constructor(scene: THREE.Scene) {
    this.setupGround(scene);
  }

  private setupGround(scene: THREE.Scene) {
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    scene.add(this.ground);
  }

  public dispose() {
    this.ground.geometry.dispose();
    (this.ground.material as THREE.Material).dispose();
  }
}

export default Ground;
