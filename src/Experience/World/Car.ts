import * as THREE from "three";
import type Experience from "../Experience";

export default class Car {
  experience: Experience;
  model: any; // GLTF模型
  modelParts: THREE.Object3D[] = [];
  bodyMat: THREE.MeshStandardMaterial | null = null;
  wheelModelParts: THREE.Object3D[] = [];

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

    // 处理模型材质和部件
    this.handleModel();
  }

  private flattenModel(object: THREE.Object3D) {
    // 递归遍历模型，收集所有网格
    object.traverse((child) => {
      if ((child as any).type === "Mesh" || (child as any).type === "Group") {
        this.modelParts.push(child);
      }
    });
  }

  private handleModel() {
    
    // 寻找车身
    if (this.modelParts.length > 1) {
      const body = this.modelParts[1] as THREE.Mesh;
      if (body && body.material) {
        this.bodyMat = body.material as THREE.MeshStandardMaterial;
        this.bodyMat.metalness = 1;
        this.bodyMat.roughness = 0.2;
      }
    }

    // 仅对车身主体应用 AO，避免其它部件出现奇怪图案
    const aoTexture = this.experience.am?.getTexture("ut_car_body_ao");
    this.modelParts.forEach((part) => {
      if (part.type === "Mesh") {
        const mesh = part as THREE.Mesh;
        if (!mesh.material) return;
        const material = mesh.material as THREE.MeshStandardMaterial;

        // 只对 body（modelParts[1]）应用 AO；其他零件移除 AO
        const isBodyMesh = this.modelParts[1] === mesh;
        if (isBodyMesh && aoTexture) {
         material.aoMap = aoTexture;
        } else {
          // 移除非主体部件上的 AO，避免奇怪花纹
          if (material.aoMap) {
            material.aoMap = null as any;
            material.needsUpdate = true;
          }
        }
      }
    });

    // 寻找车轮模型（通常是索引35的部件，参考原始代码）
    if (this.modelParts.length) {
      this.wheelModelParts.push(this.modelParts[34]);
      this.wheelModelParts.push(this.modelParts[35]);
    }
  }

  update(_deltaTime: number, _elapsedTime: number) {
    // 根据速度旋转车轮
    if (this.wheelModelParts && this.experience.params.speed > 0) {
      this.wheelModelParts.forEach((wheel) => {
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
