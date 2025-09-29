import * as THREE from "three";
import type Experience from "../Experience";
import { MeshReflectorMaterial } from "../Utils/MeshReflectorMaterial";

export default class StartRoom {
  experience: Experience;
  model: any; // GLTF模型
  modelParts: THREE.Object3D[] = [];
  
  lightMat: THREE.MeshStandardMaterial | null = null;
  floorMesh: THREE.Mesh | null = null;
  customFloorMat: THREE.ShaderMaterial | THREE.MeshStandardMaterial | null = null;
  reflectorMaterial: MeshReflectorMaterial | null = null;
  
  constructor(experience: Experience, model: any) {
    this.experience = experience;
    this.model = model;
    
    console.log('🏢 初始化展厅组件...');
    
    this.init();
  }

  private init() {
    // 添加模型到场景
    this.experience.scene.add(this.model.scene);
    
    // 扁平化模型层级
    this.flattenModel(this.model.scene);
    
    // 处理模型材质
    this.handleModel();
    
    console.log(`✅ 展厅初始化完成，共 ${this.modelParts.length} 个部件`);
  }
  
  private flattenModel(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child.isMesh || child.isGroup) {
        this.modelParts.push(child);
      }
    });
  }
  
  private handleModel() {
    console.log('🎨 处理展厅材质...');
    
    // 处理光源材质（通常是索引1的部件）
    if (this.modelParts.length > 1) {
      const light001 = this.modelParts[1] as THREE.Mesh;
      if (light001 && light001.material) {
        this.lightMat = light001.material as THREE.MeshStandardMaterial;
        
        // 设置发光材质
        this.lightMat.emissive = new THREE.Color("white");
        this.lightMat.emissiveIntensity = 1;
        this.lightMat.toneMapped = false;
        this.lightMat.transparent = true;
        this.lightMat.alphaTest = 0.1;
        
        console.log('💡 光源材质已设置');
      }
    }
    
    // 处理反射地面（通常是索引2的部件）
    if (this.modelParts.length > 2) {
      this.floorMesh = this.modelParts[2] as THREE.Mesh;
      if (this.floorMesh && this.floorMesh.material) {
        const floorMat = this.floorMesh.material as THREE.MeshPhysicalMaterial;
        
        // 应用纹理
        const aoTexture = this.experience.am?.getTexture("ut_startroom_ao");
        const lightTexture = this.experience.am?.getTexture("ut_startroom_light");
        const normalTexture = this.experience.am?.getTexture("ut_floor_normal");
        const roughnessTexture = this.experience.am?.getTexture("ut_floor_roughness");
        
        if (aoTexture) floorMat.aoMap = aoTexture;
        if (lightTexture) floorMat.lightMap = lightTexture;
        if (normalTexture) floorMat.normalMap = normalTexture;
        if (roughnessTexture) floorMat.roughnessMap = roughnessTexture;
        
      floorMat.envMapIntensity = 0;

        // 创建自定义反射地面材质
        this.createCustomFloorMaterial(floorMat);
        
        console.log('🏢 地面材质已设置');
      }
    }
  }
  
  private createCustomFloorMaterial(baseMaterial: THREE.MeshPhysicalMaterial) {
    console.log('🪞 创建简化反射地面材质...');
    
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
        metalness: 0.1,
        roughness: 0.1,
        envMapIntensity: 2.0,
        
        // 动态颜色（将在update中修改）
        color: new THREE.Color("#ffffff"),
      });
      
      this.customFloorMat = simplifiedMaterial as any; // 类型兼容
      this.floorMesh.material = simplifiedMaterial;
      
      console.log('✅ 简化反射地面材质创建完成');
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
    if (this.customFloorMat && (this.customFloorMat as any).envMapIntensity !== undefined) {
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
      if (part.type === 'Mesh') {
        const mesh = part as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        if (mesh.geometry) {
          mesh.geometry.dispose();
          }
        }
      });
    
    console.log('🗑️ 展厅组件已清理');
  }
}