import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World";
import Resources from "./Resources";
import Debug from "./Debug";
import Time from "./Time";
import Sizes from "./Sizes";

export default class Experience {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: Camera;
  public renderer: Renderer;
  public world: World;
  public resources: Resources;
  public debug: Debug;
  public time: Time;
  public sizes: Sizes;
  public controls: OrbitControls;
  public stats: Stats;

  constructor(containerSelector: string) {
    // Setup
    this.container = document.querySelector(containerSelector) as HTMLElement;
    if (!this.container) {
      throw new Error("Container not found");
    }

    // Global access
    (window as any).experience = this;

    // Setup base components
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.resources = new Resources();
    this.world = new World(this);

    // Setup controls
    this.controls = new OrbitControls(
      this.camera.instance,
      this.renderer.instance.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Setup stats
    if (this.debug.active) {
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    }

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  private resize(): void {
    this.camera.resize();
    this.renderer.resize();
    this.world.resize();
  }

  private update(): void {
    if (this.stats) {
      this.stats.begin();
    }

    this.camera.update();
    this.world.update();
    this.renderer.update();
    this.controls.update();

    if (this.stats) {
      this.stats.end();
    }
  }

  public destroy(): void {
    // Remove event listeners
    this.sizes.off("resize");
    this.time.off("tick");

    // Traverse the whole scene
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    // Controls
    this.controls.dispose();

    // Renderer
    this.renderer.instance.dispose();

    // Debug
    if (this.debug.active) {
      this.debug.ui?.destroy();
    }

    // Remove stats
    if (this.stats) {
      document.body.removeChild(this.stats.dom);
    }
  }
}
