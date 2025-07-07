import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export class Furina {
  private scene: THREE.Scene;
  private assets: any;
  private model: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private animations: THREE.AnimationClip[] = [];
  private materials: THREE.Material[] = [];

  constructor(scene: THREE.Scene, assets: any) {
    this.scene = scene;
    this.assets = assets;
    this.init();
  }

  private init() {
    // Load Furina model
    const furinaModel = this.assets["driving"] as THREE.Group;
    if (furinaModel) {
      this.model = furinaModel;
      this.model.scale.set(0.01, 0.01, 0.01); // FBX models often need scaling
      this.model.position.set(0, 0, 0);
      this.scene.add(this.model);

      // Collect materials for color changes
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            this.materials.push(...child.material);
          } else {
            this.materials.push(child.material);
          }
        }
      });

      // Setup animations if available
      if (this.model.animations && this.model.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        this.animations = this.model.animations;
        this.animations.forEach((clip) => {
          if (this.mixer) {
            const action = this.mixer.clipAction(clip);
            action.play();
          }
        });
      }
    }
  }

  public setColor(color: THREE.Color) {
    if (this.model) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.color.copy(color);
          }
        }
      });
    }
  }

  public drive() {
    // Start driving animation - placeholder for character driving state
    console.log("Furina starts driving");
  }

  public pause() {
    // Pause driving animation - placeholder for character pause state
    console.log("Furina pauses driving");
  }

  public update() {
    // Update animations
    if (this.mixer) {
      this.mixer.update(0.016); // Assuming 60fps
    }
  }

  public dispose() {
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
  }
}
