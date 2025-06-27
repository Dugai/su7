import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import EventEmitter from "./EventEmitter";

export interface Source {
  name: string;
  type: "gltfModel" | "texture" | "hdrTexture";
  path: string;
}

export default class Resources extends EventEmitter {
  public items: { [key: string]: any };
  public toLoad: number;
  public loaded: number;
  private sources: Source[];
  private loaders!: {
    gltfLoader: GLTFLoader;
    textureLoader: THREE.TextureLoader;
    rgbeLoader: RGBELoader;
  };

  constructor() {
    super();

    // Options
    this.sources = [
      {
        name: "carModel",
        type: "gltfModel",
        path: "/models/su7.glb",
      },
      {
        name: "environmentMap",
        type: "hdrTexture",
        path: "/textures/environmentMap.hdr",
      },
    ];

    // Setup
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  private setLoaders(): void {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textureLoader: new THREE.TextureLoader(),
      rgbeLoader: new RGBELoader(),
    };

    this.loaders.gltfLoader.setDRACOLoader(dracoLoader);
  }

  private startLoading(): void {
    // Load each source
    for (const source of this.sources) {
      switch (source.type) {
        case "gltfModel":
          this.loaders.gltfLoader.load(
            source.path,
            (file) => {
              this.sourceLoaded(source, file);
            },
            undefined,
            (error) => {
              console.error(`Error loading model ${source.name}:`, error);
            }
          );
          break;

        case "texture":
          this.loaders.textureLoader.load(
            source.path,
            (file) => {
              this.sourceLoaded(source, file);
            },
            undefined,
            (error) => {
              console.error(`Error loading texture ${source.name}:`, error);
            }
          );
          break;

        case "hdrTexture":
          this.loaders.rgbeLoader.load(
            source.path,
            (file) => {
              file.mapping = THREE.EquirectangularReflectionMapping;
              this.sourceLoaded(source, file);
            },
            undefined,
            (error) => {
              console.error(`Error loading HDR ${source.name}:`, error);
            }
          );
          break;

        default:
          console.warn(`Unknown source type: ${source.type}`);
          break;
      }
    }
  }

  private sourceLoaded(source: Source, file: any): void {
    this.items[source.name] = file;
    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.emit("ready");
    }
  }
}
