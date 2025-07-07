import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export class Speedup {
  private scene: THREE.Scene;
  private assets: any;
  private model: THREE.Group | null = null;
  public material: THREE.ShaderMaterial | null = null;
  private clock: THREE.Clock;

  constructor(scene: THREE.Scene, assets: any) {
    this.scene = scene;
    this.assets = assets;
    this.clock = new THREE.Clock();
    this.init();
  }

  private init() {
    // Load speedup effect model
    const speedupModel = this.assets["sm_speedup"] as GLTF;
    if (speedupModel?.scene) {
      this.model = speedupModel.scene;
      if (this.model) {
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);

        // Create custom shader material
        this.material = new THREE.ShaderMaterial({
          uniforms: {
            iTime: { value: 0 },
            iResolution: {
              value: new THREE.Vector3(
                window.innerWidth,
                window.innerHeight,
                1
              ),
            },
            uSpeed: { value: 0 },
            uOpacity: { value: 0 },
          },
          vertexShader: `
            varying vec2 vUv;
            
            void main() {
              vec3 p = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
              vUv = uv;
            }
          `,
          fragmentShader: `
            uniform float iTime;
            uniform vec3 iResolution;
            uniform float uSpeed;
            uniform float uOpacity;
            
            varying vec2 vUv;
            
            // Simple noise function
            float random(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
              vec2 i = floor(st);
              vec2 f = fract(st);
              
              float a = random(i);
              float b = random(i + vec2(1.0, 0.0));
              float c = random(i + vec2(0.0, 1.0));
              float d = random(i + vec2(1.0, 1.0));
              
              vec2 u = f * f * (3.0 - 2.0 * f);
              
              return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            vec3 colorNoise(vec2 uv) {
              float r = random(uv + vec2(12.0, 2.0));
              float g = random(uv + vec2(7.0, 5.0));
              float b = random(uv);
              return vec3(r, g, b);
            }
            
            void main() {
              vec2 uv = vUv;
              
              vec3 col = vec3(1.0);
              
              float mask = 1.0;
              
              vec2 noiseUv = uv;
              noiseUv.x += -iTime * 0.5;
              float noiseValue = noise(noiseUv * vec2(3.0, 100.0));
              mask = noiseValue;
              mask = (mask + 1.0) * 0.5; // map from [-1,1] to [0,1]
              mask = pow(clamp(mask - 0.1, 0.0, 1.0), 11.0);
              mask = smoothstep(0.0, 0.04, mask);
              
              col = colorNoise(noiseUv * vec2(10.0, 100.0));
              col *= vec3(1.5, 1.0, 4.0);
              
              mask *= smoothstep(0.02, 0.5, uv.x) * smoothstep(0.02, 0.5, 1.0 - uv.x);
              mask *= smoothstep(0.01, 0.1, uv.y) * smoothstep(0.01, 0.1, 1.0 - uv.y);
              mask *= smoothstep(1.0, 10.0, uSpeed);
              
              gl_FragColor = vec4(col, mask * uOpacity);
            }
          `,
          transparent: true,
          depthWrite: false,
        });

        // Apply material to speedup mesh
        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = this.material;
          }
        });
      }
    }
  }

  public setOpacity(value: number) {
    if (this.material) {
      this.material.uniforms.uOpacity.value = value;
    }
  }

  public setSpeed(value: number) {
    if (this.material) {
      this.material.uniforms.uSpeed.value = value;
    }
  }

  public update() {
    if (this.material) {
      this.material.uniforms.iTime.value = this.clock.getElapsedTime();
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
    this.material?.dispose();
  }
}
