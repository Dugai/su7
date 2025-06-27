import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

class HDRLoader {
  private static instance: HDRLoader;
  private loader: RGBELoader;

  private constructor() {
    this.loader = new RGBELoader();
  }

  public static getInstance(): HDRLoader {
    if (!HDRLoader.instance) {
      HDRLoader.instance = new HDRLoader();
    }
    return HDRLoader.instance;
  }

  public async loadHDR(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error("HDR加载错误:", error);
          reject(error);
        }
      );
    });
  }
}

export default HDRLoader;
