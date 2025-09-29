import * as THREE from "three";
import type Experience from "../Experience";

export default class Furina {
  experience: Experience;
  model: THREE.Group;
  realModel: THREE.Group;
  modelParts: THREE.Object3D[] = [];
  
  mixer: THREE.AnimationMixer | null = null;
  actions: Record<string, THREE.AnimationAction> = {};
  currentAction: THREE.AnimationAction | null = null;
  isPaused: boolean = true;
  
  constructor(experience: Experience, model: THREE.Group) {
    this.experience = experience;
    this.realModel = model;
    
    console.log('👤 初始化Furina角色组件...');
    
    this.init();
  }
  
  private init() {
    // 创建包装组
    this.model = new THREE.Group();
    this.model.add(this.realModel);
    
    // 添加到场景
    this.experience.scene.add(this.model);
    
    // 扁平化模型层级
    this.flattenModel(this.realModel);
    
    // 处理模型
    this.handleModel();
    
    // 设置动画
    this.setupAnimation();
    
    console.log(`✅ Furina角色初始化完成，共 ${this.modelParts.length} 个部件`);
  }
  
  private flattenModel(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child.isMesh || child.isGroup) {
        this.modelParts.push(child);
      }
    });
  }
  
  private handleModel() {
    console.log('🎨 处理Furina模型...');
    
    // 设置模型缩放、旋转和位置
    this.model.scale.setScalar(0.074);
    this.model.rotation.y = Math.PI * 0.5;
    this.model.position.set(0.225, 0.15, -0.4);
    
    // 处理材质
    this.modelParts.forEach((item) => {
      if (item.type === 'Mesh') {
        const mesh = item as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.MeshPhongMaterial;
          
          // 如果是Phong材质，转换为Basic材质
          if (material.type === 'MeshPhongMaterial') {
            const newMat = new THREE.MeshBasicMaterial({
              transparent: true,
              map: material.map || null,
              color: new THREE.Color("#ffffff"),
            });
            mesh.material = newMat;
          }
        }
      }
    });
    
    console.log('✅ Furina模型处理完成');
  }
  
  private setupAnimation() {
    console.log('🎬 设置Furina动画...');
    
    // 创建动画混合器
    this.mixer = new THREE.AnimationMixer(this.model);
    
    // 查找动画
    if (this.realModel.animations && this.realModel.animations.length > 0) {
      const animation = this.realModel.animations[0];
      const action = this.mixer.clipAction(animation);
      this.actions["driving"] = action;
      
      // 播放动画但暂停
      this.playAction("driving");
      this.mixer.update(1);
      this.isPaused = true;
      
      console.log('✅ Furina驾驶动画已设置');
    } else {
      console.warn('⚠️ 未找到Furina动画');
    }
  }
  
  update(deltaTime: number, elapsedTime: number) {
    if (this.mixer && !this.isPaused) {
      this.mixer.update(deltaTime);
    }
  }
  
  // 添加动画动作
  addAction(animation: THREE.AnimationClip, name: string) {
    if (this.mixer) {
      const action = this.mixer.clipAction(animation);
      this.actions[name] = action;
    }
  }
  
  // 播放动画
  playAction(name: string): THREE.AnimationAction | null {
    if (!this.actions[name]) {
      console.warn(`⚠️ 动画 ${name} 未找到`);
      return null;
    }
    
    // 淡出当前动画
    if (this.currentAction) {
      this.currentAction.fadeOut(0.5);
    }
    
    // 淡入新动画
    const action = this.actions[name];
    action.weight = 1;
    action.reset().fadeIn(0.5).play();
    this.currentAction = action;
    
    return action;
  }
  
  // 设置角色颜色
  setColor(color: THREE.Color) {
    this.modelParts.forEach((item) => {
      if (item.type === 'Mesh') {
        const mesh = item as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.MeshBasicMaterial;
          if (material.color) {
            material.color.copy(color);
          }
        }
      }
    });
  }
  
  // 暂停动画
  pause() {
    this.isPaused = true;
    console.log('⏸️ Furina动画已暂停');
  }
  
  // 开始驾驶（恢复动画）
  drive() {
    this.isPaused = false;
    console.log('🚗 Furina开始驾驶');
  }
  
  // 停止动画
  stop() {
    if (this.currentAction) {
      this.currentAction.stop();
      this.currentAction = null;
    }
    this.isPaused = true;
    console.log('⏹️ Furina动画已停止');
  }
  
  dispose() {
    // 停止所有动画
    this.stop();
    
    // 清理动画混合器
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    
    // 从场景中移除
    if (this.model) {
      this.experience.scene.remove(this.model);
    }
    
    // 清理材质和几何体
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
    
    console.log('🗑️ Furina角色组件已清理');
  }
}