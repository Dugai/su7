import * as THREE from "three";
import type Experience from "../Experience";
import { MeshReflectorMaterial } from "../Utils/MeshReflectorMaterial";
import reflecFloorVertexShader from "../Shaders/ReflecFloor/vert.glsl?raw";
import reflecFloorFragmentShader from "../Shaders/ReflecFloor/frag.glsl?raw";

export default class StartRoom {
  experience: Experience;
  model: any; // GLTF模型
  modelParts: THREE.Object3D[] = [];

  lightMat: THREE.MeshStandardMaterial | null = null;
  floorMesh: THREE.Mesh | null = null;
  customFloorMat: THREE.ShaderMaterial | null = null;
  reflectorMaterial: MeshReflectorMaterial | null = null;

  constructor(experience: Experience, model: any) {
    this.experience = experience;
    this.model = model;

    this.init();
  }

  private init() {
    // 添加模型到场景
    this.experience.scene.add(this.model.scene);

    // 扁平化模型层级
    this.flattenModel(this.model.scene);

    // 处理模型材质
    this.handleModel();
  }

  private flattenModel(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        this.modelParts.push(child);
      }
    });
  }

  private handleModel() {
    // 处理光源材质
    if (this.modelParts.length > 1) {
      const light001 = this.modelParts[1] as THREE.Mesh;
      if (light001 && light001.material) {
        this.lightMat = light001.material as THREE.MeshStandardMaterial;

        this.lightMat.emissive = new THREE.Color("white");
        this.lightMat.emissiveIntensity = 0;
        this.lightMat.envMapIntensity = 0;
        this.lightMat.toneMapped = false;
        this.lightMat.transparent = true;
        this.lightMat.alphaTest = 0.1;
      }
    }

    // 处理反射地面（通常是索引2的部件）
    if (this.modelParts.length > 2) {
      this.floorMesh = this.modelParts[2] as THREE.Mesh;
      if (this.floorMesh && this.floorMesh.material) {
        const floorMat = this.floorMesh.material as THREE.MeshPhysicalMaterial;

        // 应用纹理
        const aoTexture = this.experience.am?.getTexture("ut_startroom_ao");
        const lightTexture =
          this.experience.am?.getTexture("ut_startroom_light");
        const normalTexture = this.experience.am?.getTexture("ut_floor_normal");
        const roughnessTexture =
          this.experience.am?.getTexture("ut_floor_roughness");

        if (aoTexture) floorMat.aoMap = aoTexture;
        if (lightTexture) floorMat.lightMap = lightTexture;
        if (normalTexture) floorMat.normalMap = normalTexture;
        if (roughnessTexture) floorMat.roughnessMap = roughnessTexture;

        floorMat.envMapIntensity = 0;

        // 创建反射器并注入shader uniforms（对齐example逻辑）
        const lightMesh = this.modelParts[1] as THREE.Mesh;
        this.reflectorMaterial = new MeshReflectorMaterial(
          this.experience,
          this.floorMesh,
          {
            resolution: 1024,
            ignoreObjects: [lightMesh, this.floorMesh],
            clipBias: 0.002,
          }
        );
        this.createCustomFloorMaterial(floorMat);
      }
    }
  }

  private createCustomFloorMaterial(baseMaterial: THREE.MeshPhysicalMaterial) {
    if (this.floorMesh) {
      const customMaterial = new THREE.ShaderMaterial({
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          iMouse: { value: new THREE.Vector2(0, 0) },
          map: { value: baseMaterial.map },
          normalMap: { value: baseMaterial.normalMap },
          roughnessMap: { value: baseMaterial.roughnessMap },
          aoMap: { value: baseMaterial.aoMap },
          lightMap: { value: baseMaterial.lightMap },
          uColor: { value: new THREE.Color("#ffffff") },
          uSpeed: { value: this.experience.params.speed },
          uReflectMatrix: {
            value:
              this.reflectorMaterial?.reflectMatrix ?? new THREE.Matrix4(),
          },
          uReflectTexture: {
            value: this.reflectorMaterial?.mipmapRenderTarget.texture ?? null,
          },
          uReflectIntensity: { value: 3 },
          uMipmapTextureSize: {
            value:
              this.reflectorMaterial?.renderTargetSize ??
              new THREE.Vector2(1024, 1024),
          },
        },
        vertexShader: reflecFloorVertexShader,
        fragmentShader: reflecFloorFragmentShader,
        transparent: baseMaterial.transparent,
        side: baseMaterial.side,
        depthWrite: baseMaterial.depthWrite,
        depthTest: baseMaterial.depthTest,
      });

      this.customFloorMat = customMaterial;
      this.floorMesh.material = customMaterial;

      window.addEventListener("resize", this.onResize);
    }
  }

  update(_deltaTime: number, elapsedTime: number) {
    if (this.reflectorMaterial) {
      this.reflectorMaterial.update();
    }

    if (this.customFloorMat) {
      this.customFloorMat.uniforms.iTime.value = elapsedTime;
      this.customFloorMat.uniforms.uSpeed.value = this.experience.params.speed;
    }
  }

  // 设置光源强度
  setLightIntensity(intensity: number) {
    if (this.lightMat) {
      this.lightMat.emissiveIntensity = intensity;
    }
  }

  // 设置光源透明度
  setLightOpacity(opacity: number) {
    if (this.lightMat) {
      this.lightMat.opacity = opacity;
    }
  }

  // 设置地面颜色
  setFloorColor(color: THREE.Color) {
    if (this.customFloorMat) {
      this.customFloorMat.uniforms.uColor.value.copy(color);
    }
  }

  // 设置反射强度
  setReflectIntensity(intensity: number) {
    if (this.customFloorMat) {
      this.customFloorMat.uniforms.uReflectIntensity.value = intensity * 3;
    }
  }

  private onResize = () => {
    if (this.customFloorMat) {
      this.customFloorMat.uniforms.iResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
      const rtSize = this.reflectorMaterial?.renderTargetSize;
      if (rtSize) {
        this.customFloorMat.uniforms.uMipmapTextureSize.value.copy(rtSize);
      }
    }
  };

  dispose() {
    // 从场景中移除
    if (this.model?.scene) {
      this.experience.scene.remove(this.model.scene);
    }

    // 清理反射器材质
    if (this.reflectorMaterial) {
      this.reflectorMaterial.dispose();
    }

    // 清理自定义材质
    if (this.customFloorMat) {
      this.customFloorMat.dispose();
    }
    window.removeEventListener("resize", this.onResize);

    // 清理其他材质
    this.modelParts.forEach((part) => {
      if (part.type === "Mesh") {
        const mesh = part as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
      }
    });
  }
}


