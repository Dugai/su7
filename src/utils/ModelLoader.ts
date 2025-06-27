import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export class ModelLoader {
  private scene: THREE.Scene;
  private meshes: { [key: string]: THREE.Mesh } = {};
  private loadingManager: THREE.LoadingManager;
  private loader!: GLTFLoader;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.loadingManager = new THREE.LoadingManager();
    this.setupLoadingManager();
    this.setupLoader();
  }

  private setupLoadingManager() {
    this.loadingManager.onProgress = (
      url: string,
      loaded: number,
      total: number
    ) => {
      //   console.log(`加载进度: ${(loaded / total) * 100}%`);
    };
  }

  private setupLoader() {
    this.loader = new GLTFLoader(this.loadingManager);
    this.loader.setMeshoptDecoder(MeshoptDecoder);
  }

  public async loadModel(modelPath: string): Promise<{
    model: THREE.Group;
    meshes: { [key: string]: THREE.Mesh };
  }> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf: GLTF) => {
          const model = gltf.scene;
          this.meshes = {};

          model.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
              //   console.log("发现网格:", child.name, child);
              this.meshes[child.name] = child as THREE.Mesh;
            }
          });

          model.scale.set(1, 1, 1);
          model.position.set(0, 0, 0);
          this.scene.add(model);

          resolve({
            model: model,
            meshes: this.meshes,
          });
        },
        (progress: { loaded: number; total: number }) => {
          //   console.log(
          //     "加载进度:",
          //     ((progress.loaded / progress.total) * 100).toFixed(2) + "%"
          //   );
        },
        (err: unknown) => {
          console.error("模型加载错误:", err);
          reject(err);
        }
      );
    });
  }

  public getMesh(name: string): THREE.Mesh | undefined {
    const mesh = this.meshes[name];
    return mesh;
  }

  public getAllMeshNames(): string[] {
    return Object.keys(this.meshes);
  }
}
