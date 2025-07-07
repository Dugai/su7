import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { CustomShaderMaterial } from "../Utils/CustomShaderMaterial";
import { MeshReflectorMaterial } from "../Utils/MeshReflectorMaterial";

export class StartRoom {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private assets: any;
  private model: THREE.Group | null = null;
  private modelParts: THREE.Object3D[] = [];
  public lightMat: THREE.MeshStandardMaterial | null = null;
  public customFloorMat: CustomShaderMaterial | null = null;
  private reflectorMaterial: MeshReflectorMaterial | null = null;
  private clock: THREE.Clock;

  constructor(
    scene: THREE.Scene,
    assets: any,
    camera?: THREE.Camera,
    renderer?: THREE.WebGLRenderer
  ) {
    this.scene = scene;
    this.assets = assets;
    this.camera = camera || new THREE.PerspectiveCamera();
    this.renderer = renderer || new THREE.WebGLRenderer();
    this.clock = new THREE.Clock();
    this.init();
  }

  private init() {
    // Load start room model
    const startRoomModel = this.assets["sm_startroom"] as GLTF;
    if (startRoomModel?.scene) {
      this.model = startRoomModel.scene;
      if (this.model) {
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);

        // Flatten model hierarchy
        this.modelParts = this.flatModel(this.model);
        this.printModel(this.modelParts);
        this.setupMaterials();
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
    console.log("StartRoom model parts:");
    parts.forEach((part, index) => {
      console.log(`[${index}] ${part.name} - ${part.type}`);
    });
  }

  private setupMaterials() {
    if (this.modelParts.length === 0) return;

    // Based on original code: light001 is at index 1, ReflecFloor is at index 2
    const light001 = this.modelParts[1] as THREE.Mesh;
    const ReflecFloor = this.modelParts[2] as THREE.Mesh;

    // Setup light material
    if (light001 && light001.material) {
      const lightMat = light001.material as THREE.MeshStandardMaterial;
      this.lightMat = lightMat;
      lightMat.emissive = new THREE.Color("white");
      lightMat.emissiveIntensity = 1;
      lightMat.toneMapped = false;
      lightMat.transparent = true;
      lightMat.alphaTest = 0.1;
    }

    // Setup floor material
    if (ReflecFloor && ReflecFloor.material) {
      const floorMat = ReflecFloor.material as THREE.MeshPhysicalMaterial;

      // Apply textures
      floorMat.aoMap = this.assets["t_startroom_ao"];
      floorMat.lightMap = this.assets["t_startroom_light"];
      floorMat.normalMap = this.assets["t_floor_normal"];
      floorMat.roughnessMap = this.assets["t_floor_roughness"];
      floorMat.envMapIntensity = 0;

      // Create reflection material
      this.reflectorMaterial = new MeshReflectorMaterial(
        { scene: this.scene, camera: this.camera, renderer: this.renderer },
        ReflecFloor,
        {
          resolution: 1024,
          ignoreObjects: [light001, ReflecFloor],
        }
      );

      // Create custom shader material
      this.customFloorMat = new CustomShaderMaterial({
        baseMaterial: floorMat,
        vertexShader: `
          uniform float iTime;
          uniform vec2 iResolution;
          uniform vec2 iMouse;
          
          varying vec2 vUv_;
          varying vec4 vWorldPosition;
          
          void main() {
            vec3 p = position;
            
            // Custom vertex transformation
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            
            vUv_ = uv;
            vWorldPosition = modelMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          uniform float iTime;
          uniform vec2 iResolution;
          uniform vec2 iMouse;
          
          varying vec2 vUv_;
          varying vec4 vWorldPosition;
          
          uniform vec3 uColor;
          uniform float uSpeed;
          uniform mat4 uReflectMatrix;
          uniform sampler2D uReflectTexture;
          uniform float uReflectIntensity;
          uniform vec2 uMipmapTextureSize;
          
          // Textures from base material
          uniform sampler2D normalMap;
          uniform sampler2D roughnessMap;
          uniform sampler2D aoMap;
          uniform sampler2D lightMap;
          
          // Simple fresnel function
          vec3 fresnel(vec3 F0, vec3 normal, vec3 viewDir) {
            float cosTheta = max(dot(normal, viewDir), 0.0);
            return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
          }
          
          void main() {
            vec2 p = vUv_;
            
            // Sample surface normal with animation
            vec2 surfaceNormalUv = vWorldPosition.xz;
            surfaceNormalUv.x += iTime * uSpeed;
            vec3 surfaceNormal = texture2D(normalMap, surfaceNormalUv).rgb * 2.0 - 1.0;
            surfaceNormal = normalize(surfaceNormal);
            
            // Sample roughness
            vec2 roughnessUv = vWorldPosition.xz;
            roughnessUv.x += iTime * uSpeed;
            float roughnessValue = texture2D(roughnessMap, roughnessUv).r;
            roughnessValue = roughnessValue * (1.7 - 0.7 * roughnessValue);
            roughnessValue *= 4.0;
            
            // Calculate reflection
            vec4 reflectPoint = uReflectMatrix * vWorldPosition;
            reflectPoint = reflectPoint / reflectPoint.w;
            
            vec3 viewDir = normalize(cameraPosition - vWorldPosition.xyz);
            float d = length(cameraPosition - vWorldPosition.xyz);
            vec2 distortion = surfaceNormal.xz * (0.001 + 1.0 / d);
            
            vec2 finalUv = reflectPoint.xy + distortion;
            vec3 reflectionSample = texture2D(uReflectTexture, finalUv).rgb;
            reflectionSample *= uReflectIntensity;
            
            // Base color
            vec3 col = uColor;
            col *= 3.0;
            
            // Apply fresnel
            vec3 fres = fresnel(vec3(0.04), surfaceNormal, viewDir);
            col = mix(col, reflectionSample, fres.r);
            
            // Apply lighting
            vec3 lightColor = texture2D(lightMap, vUv_).rgb;
            col += lightColor * 0.5;
            
            // Apply AO
            float ao = texture2D(aoMap, vUv_).r;
            col *= ao;
            
            gl_FragColor = vec4(col, 1.0);
          }
        `,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          iMouse: { value: new THREE.Vector2() },
          uColor: { value: new THREE.Color("#ffffff") },
          uSpeed: { value: 0 },
          uReflectMatrix: { value: this.reflectorMaterial._reflectMatrix },
          uReflectTexture: {
            value: this.reflectorMaterial.mipmapFBO.rt.texture,
          },
          uReflectIntensity: { value: 25 },
          uMipmapTextureSize: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
        },
      });

      // Apply custom material to floor
      ReflecFloor.material = this.customFloorMat;

      // Handle window resize
      window.addEventListener("resize", () => {
        if (this.customFloorMat) {
          this.customFloorMat.uniforms.uMipmapTextureSize.value =
            new THREE.Vector2(window.innerWidth, window.innerHeight);
        }
      });
    }
  }

  public setLightIntensity(value: number) {
    if (this.lightMat) {
      this.lightMat.emissiveIntensity = value;
    }
  }

  public setReflectIntensity(value: number) {
    if (this.customFloorMat) {
      this.customFloorMat.uniforms.uReflectIntensity.value = value;
    }
  }

  public setFloorColor(color: THREE.Color) {
    if (this.customFloorMat) {
      this.customFloorMat.uniforms.uColor.value.copy(color);
    }
  }

  public setLightColor(color: THREE.Color) {
    if (this.lightMat) {
      this.lightMat.emissive.copy(color);
    }
  }

  public setLightOpacity(value: number) {
    if (this.lightMat) {
      this.lightMat.opacity = value;
    }
  }

  public update() {
    if (this.customFloorMat) {
      this.customFloorMat.uniforms.iTime.value = this.clock.getElapsedTime();
      this.customFloorMat.uniforms.uSpeed.value = 0; // Will be updated by World
    }

    // Update reflection
    if (this.reflectorMaterial) {
      this.reflectorMaterial.renderReflection();
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
    this.lightMat?.dispose();
    this.customFloorMat?.dispose();
    this.reflectorMaterial?.dispose();
  }
}
