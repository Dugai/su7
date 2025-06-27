declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera, EventDispatcher } from "three";
  export class OrbitControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);
    enabled: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    update(): void;
  }
}

declare module "three/examples/jsm/loaders/GLTFLoader" {
  import { Object3D, Scene } from "three";
  export interface GLTF {
    scene: Scene;
    scenes: Scene[];
    animations: any[];
    cameras: any[];
    asset: any;
  }
  export class GLTFLoader {
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}

declare module "three/examples/jsm/loaders/RGBELoader" {
  import { DataTexture, LoadingManager } from "three";
  export class RGBELoader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (texture: DataTexture) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}
