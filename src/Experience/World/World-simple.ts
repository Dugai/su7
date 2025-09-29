import * as kokomi from "kokomi.js";
import * as THREE from "three";
import * as STDLIB from "three-stdlib";
import gsap from "gsap";

import type Experience from "../Experience";

export default class World extends kokomi.Component {
  declare base: Experience;
  environment!: kokomi.Environment;
  testCube!: THREE.Mesh;
  carModel!: STDLIB.GLTF;
  carMesh!: THREE.Group;
  floor!: THREE.Mesh;
  dynamicEnv!: any;

  constructor(base: Experience) {
    super(base);
  }

  addExisting() {
    this.addEnvironment();
    this.addDynamicEnvironment();
    this.addFloor();
    this.addCar();
    console.log('🎮 完整世界场景已创建');
  }

  // 添加环境
  addEnvironment() {
    this.environment = new kokomi.Environment(this.base);
    this.environment.preset = "sunset";
  }

  // 添加动态环境
  addDynamicEnvironment() {
    const envLight = this.base.am.items["ut_env_light"];
    const envNight = this.base.am.items["ut_env_night"];
    
    if (envLight || envNight) {
      // 如果有HDR纹理，创建简单的动态环境
      this.dynamicEnv = {
        envLight,
        envNight,
        setWeight: (weight: number) => {
          console.log(`设置环境权重: ${weight}`);
        },
        setIntensity: (intensity: number) => {
          console.log(`设置环境强度: ${intensity}`);
        }
      };
      console.log('🌅 动态环境已创建');
    }
  }

  // 添加反射地面
  addFloor() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });

    // 添加法线贴图和粗糙度贴图（如果可用）
    const floorNormal = this.base.am.items["ut_floor_normal"];
    const floorRoughness = this.base.am.items["ut_floor_roughness"];
    
    if (floorNormal) {
      floorMaterial.normalMap = floorNormal;
    }
    if (floorRoughness) {
      floorMaterial.roughnessMap = floorRoughness;
    }

    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.1;
    this.floor.receiveShadow = true;
    
    this.base.scene.add(this.floor);
    console.log('🏢 反射地面已添加');
  }

  // 添加汽车模型
  addCar() {
    const carModel = this.base.am.items["sm_car"] as STDLIB.GLTF;
    
    if (carModel && carModel.scene) {
      this.carModel = carModel;
      this.carMesh = carModel.scene;
      
      // 处理真实汽车模型材质
      this.setupRealCarMaterials();
      
      this.base.scene.add(this.carMesh);
      console.log('🚗 小米SU7汽车模型已加载成功！');
    } else {
      // 如果汽车模型加载失败，回退到程序化汽车
      console.warn('⚠️ 小米汽车模型加载失败，使用程序化汽车');
      this.addTestCube();
    }
  }

  // 设置真实汽车模型材质
  setupRealCarMaterials() {
    if (!this.carMesh) return;

    const carBodyAO = this.base.am.items["ut_car_body_ao"];
    const decalTexture = this.base.am.items["decal"];

    console.log('🎨 开始设置小米SU7汽车材质...');

    // 获取模型的所有部件
    const modelParts = kokomi.flatModel(this.carMesh);
    console.log(`📦 找到 ${modelParts.length} 个汽车部件`);

    // 处理车身（通常是第3个部件）
    if (modelParts.length > 2) {
      const body = modelParts[2] as THREE.Mesh;
      if (body && body.material) {
        const bodyMat = body.material as THREE.MeshStandardMaterial;
        
        // 小米SU7的经典蓝色
        bodyMat.color = new THREE.Color("#26d6e9");
        bodyMat.emissive = new THREE.Color("#004466");
        bodyMat.emissiveIntensity = 0.4;
        bodyMat.metalness = 0.9;
        bodyMat.roughness = 0.1;
        bodyMat.envMapIntensity = 3.5;

        // 设置AO贴图
        if (carBodyAO) {
          bodyMat.aoMap = carBodyAO;
        }

        // 设置贴花纹理
        if (decalTexture) {
          bodyMat.alphaMap = decalTexture;
        }

        body.castShadow = true;
        console.log('🚗 车身材质已设置');
      }
    }

    // 处理所有其他部件
    modelParts.forEach((item: THREE.Mesh, index) => {
      if (item.isMesh && item.material) {
        const mat = item.material as THREE.MeshStandardMaterial;
        
        // 增强所有部件的可见度
        if (!mat.emissive || mat.emissive.getHex() === 0) {
          mat.emissive = new THREE.Color("#002244");
          mat.emissiveIntensity = 0.25;
        } else {
          mat.emissiveIntensity = Math.max(mat.emissiveIntensity || 0, 0.25);
        }
        
        mat.metalness = Math.max(mat.metalness || 0, 0.8);
        mat.roughness = Math.min(mat.roughness || 1, 0.2);
        mat.envMapIntensity = Math.max(mat.envMapIntensity || 1, 2.5);
        
        item.castShadow = true;
        item.receiveShadow = true;
      }
    });

    console.log('✨ 小米SU7汽车材质设置完成');
  }

  // 设置程序化汽车材质（备用方案）
  setupCarMaterials() {
    // 这个方法现在用于程序化汽车，已在addTestCube中处理
  }

  // 创建程序化汽车模型
  addTestCube() {
    const carGroup = new THREE.Group();
    
    // 车身
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x26d6e9,
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color(0x004466),
      emissiveIntensity: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.3, 0);
    body.castShadow = true;
    carGroup.add(body);
    
    // 车顶
    const roofGeometry = new THREE.BoxGeometry(1.4, 0.5, 2);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a4d5c,
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color(0x002233),
      emissiveIntensity: 0.3
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 0.85, 0.3);
    roof.castShadow = true;
    carGroup.add(roof);
    
    // 车轮
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3,
      emissive: new THREE.Color(0x111111),
      emissiveIntensity: 0.2
    });
    
    const wheelPositions = [
      [-0.8, 0, 1.2],   // 前左
      [0.8, 0, 1.2],    // 前右
      [-0.8, 0, -1.2],  // 后左
      [0.8, 0, -1.2]    // 后右
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      carGroup.add(wheel);
    });
    
    // 车头灯
    const headlightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8
    });
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.6, 0.4, 2.1);
    carGroup.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.6, 0.4, 2.1);
    carGroup.add(rightHeadlight);
    
    // 尾灯
    const taillightMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.6
    });
    
    const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
    leftTaillight.position.set(-0.6, 0.4, -2.1);
    carGroup.add(leftTaillight);
    
    const rightTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
    rightTaillight.position.set(0.6, 0.4, -2.1);
    carGroup.add(rightTaillight);
    
    this.testCube = carGroup as any; // 重用testCube变量
    this.testCube.position.set(0, 0.3, 0);
    this.base.scene.add(this.testCube);
    
    console.log('🚗 程序化汽车模型已创建');
  }

  // 直接进入明亮场景
  enterDirectly() {
    console.log('⚡ 直接进入明亮场景');
    
    // 设置最终的明亮状态
    this.base.params.lightAlpha = 1.0;
    this.base.params.lightIntensity = 1.5;
    this.base.params.envIntensity = 1.5;
    this.base.params.envWeight = 0.8;
    this.base.params.bloomIntensity = 1.5;

    // 增强地面材质
    if (this.floor) {
      const floorMat = this.floor.material as THREE.MeshStandardMaterial;
      gsap.to(floorMat, {
        duration: 1,
        opacity: 1,
        metalness: 0.9
      });
      gsap.to(floorMat.color, {
        duration: 1,
        r: 0.3,
        g: 0.3,
        b: 0.3
      });
    }

    // 设置动态环境
    if (this.dynamicEnv) {
      this.dynamicEnv.setWeight(0.8);
      this.dynamicEnv.setIntensity(1.5);
    }

    // 添加旋转动画
    if (this.carMesh) {
      gsap.to(this.carMesh.rotation, {
        duration: 4,
        y: Math.PI * 2,
        repeat: -1,
        ease: "none"
      });
    } else if (this.testCube) {
      gsap.to(this.testCube.rotation, {
        duration: 2,
        y: Math.PI * 2,
        repeat: -1,
        ease: "none"
      });
    }

    console.log('✨ 完整场景已设置为最亮状态！');
  }

  update() {
    // 悬浮动画
    if (this.carMesh) {
      this.carMesh.position.y = Math.sin(this.base.clock.elapsedTime) * 0.1;
    } else if (this.testCube) {
      this.testCube.position.y = 0.5 + Math.sin(this.base.clock.elapsedTime) * 0.1;
    }
  }
}
