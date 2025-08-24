import * as kokomi from "kokomi.js";
import * as THREE from "three";
import * as STDLIB from "three-stdlib";

import type ExperienceVanilla from "../ExperienceVanilla";

export default class CarVanilla extends kokomi.Component {
  declare base: ExperienceVanilla;
  model: STDLIB.GLTF;
  modelParts: THREE.Object3D[];
  bodyMat!: THREE.MeshStandardMaterial;
  wheelModel!: THREE.Group;

  constructor(base: ExperienceVanilla) {
    super(base);

    const model = this.base.am.items["sm_car"] as STDLIB.GLTF;
    this.model = model;

    const modelParts = kokomi.flatModel(model.scene);
    kokomi.printModel(modelParts);
    this.modelParts = modelParts;

    this.handleModel();
  }

  addExisting() {
    this.container.add(this.model.scene);
  }

  update(): void {
    this.wheelModel?.children.forEach((item) => {
      item.rotateZ(-this.base.params.speed * 0.03);
    });
  }

  handleModel() {
    // 安全地处理车身材质
    if (this.modelParts.length > 2) {
      const body = this.modelParts[2] as THREE.Mesh;
      if (body && body.material) {
        const bodyMat = body.material as THREE.MeshStandardMaterial;
        this.bodyMat = bodyMat;
        bodyMat.color = new THREE.Color("#26d6e9");
        
        // 增强车身可见度
        bodyMat.emissive = new THREE.Color("#001133");  // 微弱蓝色自发光
        bodyMat.emissiveIntensity = 0.2;
        bodyMat.metalness = 0.9;
        bodyMat.roughness = 0.1;
        bodyMat.envMapIntensity = 2.5;  // 增加环境反射强度
        
        if (this.base.params.isFurina) {
          bodyMat.color = new THREE.Color("white");
          bodyMat.emissive = new THREE.Color("#111111");  // Furina模式下的自发光
          const decalTexture = this.base.am.items["decal"];
          if (decalTexture) {
            bodyMat.map = decalTexture;
          }
        }
      }
    }

    // 安全地设置AO贴图并增强可见度
    const carBodyAO = this.base.am.items["ut_car_body_ao"];
    if (carBodyAO) {
      // @ts-ignore
      this.modelParts.forEach((item: THREE.Mesh) => {
        if (item.isMesh && item.material) {
          const mat = item.material as THREE.MeshStandardMaterial;
          mat.aoMap = carBodyAO;
          
          // 为所有车身部件增加基础自发光和金属质感
          if (!mat.emissive || mat.emissive.getHex() === 0) {
            mat.emissive = new THREE.Color("#001122");
            mat.emissiveIntensity = 0.1;
          }
          
          // 增强金属质感
          if (mat.metalness !== undefined) {
            mat.metalness = Math.max(mat.metalness || 0, 0.7);
            mat.roughness = Math.min(mat.roughness || 1, 0.3);
            mat.envMapIntensity = Math.max(mat.envMapIntensity || 1, 1.5);
          }
        }
      });
    }

    // 安全地获取车轮
    if (this.modelParts.length > 35) {
      const Wheel = this.modelParts[35] as THREE.Group;
      this.wheelModel = Wheel;
    } else {
      // 如果没有找到指定索引的车轮，尝试通过名称查找
      this.modelParts.forEach((part) => {
        if (part.name && part.name.toLowerCase().includes("wheel")) {
          this.wheelModel = part as THREE.Group;
        }
      });
    }

    console.log(`Car model parts: ${this.modelParts.length}, wheel found: ${!!this.wheelModel}`);
  }

  setBodyEnvmapIntensity(value: number) {
    if (this.bodyMat) {
      this.bodyMat.envMapIntensity = value;
    }
  }
}
