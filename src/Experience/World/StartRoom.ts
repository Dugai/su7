import * as THREE from "three";
import type Experience from "../Experience";
import { MeshReflectorMaterial } from "../Utils/MeshReflectorMaterial";

export default class StartRoom {
  experience: Experience;
  model: any; // GLTF模型
  modelParts: THREE.Object3D[] = [];

  lightMat: THREE.MeshStandardMaterial | null = null;
  floorMesh: THREE.Mesh | null = null;
  customFloorMat: THREE.ShaderMaterial | THREE.MeshStandardMaterial | null =
    null;
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
      if (child.isMesh || child.isGroup) {
        this.modelParts.push(child);
      }
    });
  }

  private handleModel() {
    // 处理光源材质
    if (this.modelParts.length > 1) {
      const light001 = this.modelParts[1] as THREE.Mesh;
      if (light001 && light001.material) {
        console.log(light001.material, "展厅材质部件");
        this.lightMat = light001.material as THREE.MeshStandardMaterial;

        this.lightMat.emissive = new THREE.Color("white");  // 白色自发光
        this.lightMat.emissiveIntensity = 100;  // 增加发光强度，更亮
        this.lightMat.envMapIntensity = 0.2;  // 极少的环境光反射
        this.lightMat.toneMapped = false;  // 不受色调映射影响
        this.lightMat.transparent = true;
        this.lightMat.metalness = 1;
        this.lightMat.alphaTest = 0.1;
      }
    }

    // 处理反射地面（通常是索引2的部件）
    if (this.modelParts.length > 2) {
      console.log(this.modelParts, "展厅材质部件 地板");
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

        floorMat.envMapIntensity = 1;

        // 创建自定义反射地面材质
        this.createCustomFloorMaterial(floorMat);
      }
    }
  }

  private createCustomFloorMaterial(baseMaterial: THREE.MeshPhysicalMaterial) {
    // 暂时使用简化版本，避免复杂的反射器导致的问题
    if (this.floorMesh) {
      // 创建简化的PBR材质，具有高反射性
      const simplifiedMaterial = new THREE.MeshStandardMaterial({
        map: baseMaterial.map,
        normalMap: baseMaterial.normalMap,
        roughnessMap: baseMaterial.roughnessMap,
        aoMap: baseMaterial.aoMap,
        lightMap: baseMaterial.lightMap,

        // 高反射设置
        metalness: 0.2,
        roughness: 0.1,
        envMapIntensity: 1,

        // 动态颜色（将在update中修改）
        color: new THREE.Color("#ffffff"),
      });

      this.customFloorMat = simplifiedMaterial as any; // 类型兼容
      this.floorMesh.material = simplifiedMaterial;
    }
  }

  update(deltaTime: number, elapsedTime: number) {
    // 更新反射器（如果存在）
    if (this.reflectorMaterial) {
      this.reflectorMaterial.update();
    }

    // 简化版本不需要特殊的uniform更新
    // 动态参数通过其他方法设置
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
    if (this.customFloorMat && (this.customFloorMat as any).color) {
      (this.customFloorMat as any).color.copy(color);
    }
  }

  // 设置反射强度
  setReflectIntensity(intensity: number) {
    if (
      this.customFloorMat &&
      (this.customFloorMat as any).envMapIntensity !== undefined
    ) {
      (this.customFloorMat as any).envMapIntensity = intensity * 0.1; // 缩放到合理范围
    }
  }

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
