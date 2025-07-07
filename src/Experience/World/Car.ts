import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Params } from "../hooks/useParams";

export class Car {
  private scene: THREE.Scene;
  private assets: any;
  private params: Params;
  private model: THREE.Group | null = null;
  private modelParts: THREE.Object3D[] = [];
  private bodyMaterial: THREE.MeshStandardMaterial | null = null;
  private wheelModel: THREE.Group | null = null;
  private speed: number = 0;

  constructor(scene: THREE.Scene, assets: any, params: Params) {
    this.scene = scene;
    this.assets = assets;
    this.params = params;
    this.init();
  }

  private init() {
    // Load car model
    const carModel = this.assets["sm_car"] as GLTF;
    if (carModel?.scene) {
      this.model = carModel.scene;
      if (this.model) {
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, 0, 0);
        this.model.name = "car";
        this.scene.add(this.model);

        // Flatten model hierarchy
        this.modelParts = this.flatModel(this.model);
        this.printModel(this.modelParts);
        this.handleModel();
      }
    }
  }

  private flatModel(model: THREE.Object3D): THREE.Object3D[] {
    const parts: THREE.Object3D[] = [];

    model.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        parts.push(child);
      }
    });

    return parts;
  }

  private printModel(parts: THREE.Object3D[]) {
    console.log("Car model parts:");
    parts.forEach((part, index) => {
      console.log(`[${index}] ${part.name} - ${part.type}`);
    });
  }

  private handleModel() {
    if (this.modelParts.length === 0) return;

    // Based on the original code, body is at index 2
    const body = this.modelParts[2] as THREE.Mesh;
    if (body && body.material) {
      const bodyMat = body.material as THREE.MeshStandardMaterial;
      this.bodyMaterial = bodyMat;
      bodyMat.color = new THREE.Color("#26d6e9");

      if (this.params.isFurina) {
        bodyMat.color = new THREE.Color("white");
        const decalTexture = this.assets["decal"] as THREE.Texture;
        if (decalTexture) {
          bodyMat.map = decalTexture;
        }
      }
    }

    // Apply AO texture to all mesh parts
    const carBodyAO = this.assets["t_car_body_AO"] as THREE.Texture;
    if (carBodyAO) {
      this.modelParts.forEach((item) => {
        if (item instanceof THREE.Mesh) {
          const mat = item.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.aoMap = carBodyAO;
            mat.needsUpdate = true;
          }
        }
      });
    }

    // Based on the original code, wheel is at index 35
    const wheel = this.modelParts[35] as THREE.Group;
    if (wheel) {
      this.wheelModel = wheel;
    } else {
      // Fallback: find wheel by name
      this.modelParts.forEach((part) => {
        if (part.name.toLowerCase().includes("wheel")) {
          this.wheelModel = part as THREE.Group;
        }
      });
    }
  }

  public setSpeed(value: number) {
    this.speed = value;
  }

  public setBodyEnvIntensity(value: number) {
    if (this.bodyMaterial) {
      this.bodyMaterial.envMapIntensity = value;
    }
  }

  public update() {
    // Rotate wheels based on speed
    if (this.wheelModel) {
      this.wheelModel.children.forEach((item) => {
        item.rotateZ(-this.speed * 0.03);
      });
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
