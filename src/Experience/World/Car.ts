import * as THREE from "three";
import type Experience from "../Experience";

export default class Car {
  experience: Experience;
  model: any; // GLTF模型
  modelParts: THREE.Object3D[] = [];
  bodyMat: THREE.MeshStandardMaterial | null = null;
  wheelModel: THREE.Group | null = null;
  
  constructor(experience: Experience, model: any) {
    this.experience = experience;
    this.model = model;
    
    console.log('🚗 初始化汽车组件...');
    
    this.init();
  }
  
  private init() {
    // 添加模型到场景
    this.experience.scene.add(this.model.scene);
    
    // 扁平化模型层级
    this.flattenModel(this.model.scene);
    
    // 处理模型材质和部件
    this.handleModel();
    
    console.log(`✅ 汽车初始化完成，共 ${this.modelParts.length} 个部件`);
  }
  
  private flattenModel(object: THREE.Object3D) {
    // 递归遍历模型，收集所有网格
    object.traverse((child) => {
      if (child.isMesh || child.isGroup) {
        this.modelParts.push(child);
      }
    });
  }
  
  private handleModel() {
    console.log('🎨 处理汽车材质...');
    
    // 寻找车身（通常是索引2的部件，参考原始代码）
    if (this.modelParts.length > 2) {
      const body = this.modelParts[2] as THREE.Mesh;
      if (body && body.material) {
        this.bodyMat = body.material as THREE.MeshStandardMaterial;
        
        // 设置小米经典蓝色
        this.bodyMat.color = new THREE.Color("#26d6e9");
        
        // 如果是Furina模式，使用白色和贴花
        if (this.experience.params.isFurina) {
          this.bodyMat.color = new THREE.Color("white");
          const decalTexture = this.experience.am?.getTexture("decal");
          if (decalTexture) {
            this.bodyMat.map = decalTexture;
          }
        }
        
        console.log('🎨 车身材质已设置');
      }
    }
    
    // 为所有网格添加AO贴图
    const aoTexture = this.experience.am?.getTexture("ut_car_body_ao");
    if (aoTexture) {
      this.modelParts.forEach((part) => {
        if (part.type === 'Mesh') {
          const mesh = part as THREE.Mesh;
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.aoMap = aoTexture;
            material.needsUpdate = true;
          }
        }
      });
      console.log('🎨 AO贴图已应用');
    }
    
    // 寻找车轮模型（通常是索引35的部件，参考原始代码）
    if (this.modelParts.length > 35) {
      const wheelCandidate = this.modelParts[35];
      if (wheelCandidate.type === 'Group') {
        this.wheelModel = wheelCandidate as THREE.Group;
        console.log('🛞 车轮模型已识别');
      }
    }
    
    // 如果没有找到特定索引的车轮，尝试通过名称查找
    if (!this.wheelModel) {
      this.modelParts.forEach((part) => {
        if (part.name.toLowerCase().includes('wheel') || 
            part.name.toLowerCase().includes('tire')) {
          if (part.type === 'Group') {
            this.wheelModel = part as THREE.Group;
            console.log(`🛞 通过名称找到车轮: ${part.name}`);
          }
        }
      });
    }
  }
  
  update(deltaTime: number, elapsedTime: number) {
    // 根据速度旋转车轮
    if (this.wheelModel && this.experience.params.speed > 0) {
      this.wheelModel.children.forEach((wheel) => {
        wheel.rotateZ(-this.experience.params.speed * 0.03);
      });
    }
  }
  
  // 设置车身环境贴图强度
  setBodyEnvmapIntensity(value: number) {
    if (this.bodyMat) {
      this.bodyMat.envMapIntensity = value;
    }
  }
  
  // 获取汽车的边界盒
  getBoundingBox(): THREE.Box3 {
    const box = new THREE.Box3();
    box.setFromObject(this.model.scene);
    return box;
  }
  
  // 设置汽车位置
  setPosition(x: number, y: number, z: number) {
    this.model.scene.position.set(x, y, z);
  }
  
  // 设置汽车旋转
  setRotation(x: number, y: number, z: number) {
    this.model.scene.rotation.set(x, y, z);
  }
  
  // 设置汽车缩放
  setScale(scale: number) {
    this.model.scene.scale.setScalar(scale);
  }
  
  dispose() {
    // 从场景中移除
    if (this.model?.scene) {
      this.experience.scene.remove(this.model.scene);
    }
    
    // 清理材质
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
    
    console.log('🗑️ 汽车组件已清理');
  }
}