import * as THREE from "three";
import type Experience from "../Experience";

export interface MeshReflectorMaterialConfig {
  resolution: number;
  ignoreObjects: THREE.Object3D[];
}

class MeshReflectorMaterial {
  experience: Experience;
  parent: THREE.Mesh;
  config: MeshReflectorMaterialConfig;
  
  private _camera!: THREE.PerspectiveCamera;
  private _reflectPlane!: THREE.Plane;
  private _reflectMatrix!: THREE.Matrix4;
  private _renderTarget!: THREE.WebGLRenderTarget;
  
  constructor(
    experience: Experience,
    parent: THREE.Mesh,
    config: Partial<MeshReflectorMaterialConfig> = {}
  ) {
    this.experience = experience;
    this.parent = parent;
    this.config = {
      resolution: 256,
      ignoreObjects: [],
      ...config
    };
    
    console.log('🪞 创建网格反射器材质...');
    
    this.init();
  }
  
  private init() {
    // 创建反射相机
    this._camera = new THREE.PerspectiveCamera();
    
    // 创建反射平面
    this._reflectPlane = new THREE.Plane();
    
    // 创建反射矩阵
    this._reflectMatrix = new THREE.Matrix4();
    
    // 创建渲染目标
    this._renderTarget = new THREE.WebGLRenderTarget(
      this.config.resolution,
      this.config.resolution,
      {
        type: THREE.UnsignedByteType,
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
      }
    );
    
    console.log(`✅ 反射器材质初始化完成 (分辨率: ${this.config.resolution})`);
  }
  
  update() {
    this.beforeRender();
  }
  
  private beforeRender() {
    // 设置反射平面
    this._reflectPlane.set(new THREE.Vector3(0, 1, 0), 0);
    this._reflectPlane.applyMatrix4(this.parent.matrixWorld);
    
    // 复制主相机设置
    this._camera.copy(this.experience.camera as THREE.PerspectiveCamera);
    
    // 计算反射相机位置
    const r = new THREE.Vector3(0, 0, 1).clone().negate();
    const o = this.experience.camera.getWorldPosition(new THREE.Vector3());
    r.reflect(this._reflectPlane.normal);
    
    const p = new THREE.Vector3();
    this._reflectPlane.projectPoint(o, p);
    const y = p.clone();
    y.sub(o);
    y.add(p);
    this._camera.position.copy(y);
    
    // 计算反射相机朝向
    const d = new THREE.Vector3(0, 0, -1);
    d.applyQuaternion(this.experience.camera.getWorldQuaternion(new THREE.Quaternion()));
    d.add(o);
    
    const E = new THREE.Vector3();
    this.parent.getWorldPosition(E);
    E.sub(d);
    E.reflect(this._reflectPlane.normal).negate();
    E.add(this.parent.getWorldPosition(new THREE.Vector3()));
    
    // 设置相机up向量
    this._camera.up.set(0, 1, 0);
    this._camera.applyQuaternion(this.experience.camera.getWorldQuaternion(new THREE.Quaternion()));
    this._camera.up.reflect(this._reflectPlane.normal);
    this._camera.lookAt(E);
    this._camera.updateMatrixWorld();
    
    // 计算反射矩阵
    const L = new THREE.Matrix4();
    L.set(
      0.5, 0, 0, 0.5,
      0, 0.5, 0, 0.5,
      0, 0, 0.5, 0.5,
      0, 0, 0, 1
    );
    L.multiply(this._camera.projectionMatrix);
    L.multiply(this._camera.matrixWorldInverse);
    this._reflectMatrix.copy(L);
    
    // 设置斜截面
    this._reflectPlane.applyMatrix4(this._camera.matrixWorldInverse);
    const k = new THREE.Vector4(
      this._reflectPlane.normal.x,
      this._reflectPlane.normal.y,
      this._reflectPlane.normal.z,
      this._reflectPlane.constant
    );
    
    const X = this._camera.projectionMatrix;
    const $ = new THREE.Vector4();
    $.x = (Math.sign(k.x) + X.elements[8]) / X.elements[0];
    $.y = (Math.sign(k.y) + X.elements[9]) / X.elements[5];
    $.z = -1;
    $.w = (1 + X.elements[10]) / X.elements[14];
    k.multiplyScalar(2 / k.dot($));
    X.elements[2] = k.x;
    X.elements[6] = k.y;
    X.elements[10] = k.z + 1;
    X.elements[14] = k.w;
    
    // 渲染反射
    const currentRenderTarget = this.experience.renderer.getRenderTarget();
    this.experience.renderer.setRenderTarget(this._renderTarget);
    this.experience.renderer.state.buffers.depth.setMask(true);
    
    if (!this.experience.renderer.autoClear) {
      this.experience.renderer.clear();
    }
    
    // 隐藏忽略的对象
    this.config.ignoreObjects.forEach((obj) => {
      obj.visible = false;
    });
    
    // 渲染场景
    this.experience.renderer.render(this.experience.scene, this._camera);
    
    // 恢复忽略的对象
    this.config.ignoreObjects.forEach((obj) => {
      obj.visible = true;
    });
    
    // 恢复原渲染目标
    this.experience.renderer.setRenderTarget(currentRenderTarget);
  }
  
  get renderTarget(): THREE.WebGLRenderTarget {
    return this._renderTarget;
  }
  
  get reflectMatrix(): THREE.Matrix4 {
    return this._reflectMatrix;
  }
  
  dispose() {
    this._renderTarget.dispose();
    console.log('🗑️ 反射器材质已清理');
  }
}

export { MeshReflectorMaterial };