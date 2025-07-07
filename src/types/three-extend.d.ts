import { Object3D, AnimationClip, Group } from "three";

declare module "three/examples/jsm/loaders/GLTFLoader" {
  export interface GLTF {
    scene: Group;
    animations: AnimationClip[];
  }

  export class GLTFLoader {
    load(url: string, onLoad: (gltf: GLTF) => void): void;
    loadAsync(url: string): Promise<GLTF>;
  }
}

declare module "three/examples/jsm/loaders/FBXLoader" {
  import { Object3D } from "three";

  export class FBXLoader {
    load(url: string, onLoad: (object: Object3D) => void): void;
    loadAsync(url: string): Promise<Object3D>;
  }
}

declare module "three/examples/jsm/loaders/RGBELoader" {
  import { Texture } from "three";

  export class RGBELoader {
    load(url: string, onLoad: (texture: Texture) => void): void;
    loadAsync(url: string): Promise<Texture>;
  }
}

declare module "three/examples/jsm/postprocessing/EffectComposer" {
  import { WebGLRenderer, Scene, Camera } from "three";
  import { Pass } from "three/examples/jsm/postprocessing/Pass";

  export class EffectComposer {
    constructor(renderer: WebGLRenderer);
    addPass(pass: Pass): void;
    render(): void;
    setSize(width: number, height: number): void;
  }
}

declare module "three/examples/jsm/postprocessing/RenderPass" {
  import { Scene, Camera } from "three";
  import { Pass } from "three/examples/jsm/postprocessing/Pass";

  export class RenderPass extends Pass {
    constructor(scene: Scene, camera: Camera);
  }
}

declare module "three/examples/jsm/postprocessing/UnrealBloomPass" {
  import { Vector2 } from "three";
  import { Pass } from "three/examples/jsm/postprocessing/Pass";

  export class UnrealBloomPass extends Pass {
    constructor(
      resolution: Vector2,
      strength: number,
      radius: number,
      threshold: number
    );
    strength: number;
    radius: number;
    threshold: number;
    resolution: Vector2;
  }
}

declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera, Vector3 } from "three";

  export class OrbitControls {
    constructor(camera: Camera, domElement: HTMLElement);
    enabled: boolean;
    target: Vector3;
    enableDamping: boolean;
    update(): void;
  }
}
