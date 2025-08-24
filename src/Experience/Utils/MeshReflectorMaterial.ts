import * as THREE from "three";

export interface MeshReflectorMaterialConfig {
  resolution: number;
  ignoreObjects: THREE.Object3D[];
}

class MeshReflectorMaterial {
  base: any;
  parent: THREE.Mesh;
  ignoreObjects: THREE.Object3D[];
  _camera: THREE.PerspectiveCamera;
  reflectPlane: THREE.Plane;
  _reflectMatrix: THREE.Matrix4;
  _renderTexture: any;
  mipmapper: any;
  mirrorFBO: THREE.WebGLRenderTarget;
  mipmapFBO: any;

  constructor(
    base: any,
    parent: THREE.Mesh,
    config: Partial<MeshReflectorMaterialConfig> = {}
  ) {
    this.base = base;
    this.parent = parent;

    let { resolution = 256, ignoreObjects = [] } = config;

    this.ignoreObjects = ignoreObjects;

    this._camera = new THREE.PerspectiveCamera();
    this.reflectPlane = new THREE.Plane();
    this._reflectMatrix = new THREE.Matrix4();
    this._renderTexture = {
      rt: new THREE.WebGLRenderTarget(resolution, resolution, {
        type: THREE.UnsignedByteType,
      })
    };

    this.mipmapper = { update: () => {} }; // 模拟mipmapper
    const mirrorFBO = this._renderTexture.rt;
    this.mirrorFBO = mirrorFBO;
    this.mipmapFBO = {
      rt: {
        texture: this._renderTexture.rt.texture
      }
    };
  }

  update(): void {
    this.beforeRender();

    // 模拟mipmap更新
    this.mipmapper.update();
  }

  beforeRender() {
    this.reflectPlane.set(new THREE.Vector3(0, 1, 0), 0);
    this.reflectPlane.applyMatrix4(this.parent.matrixWorld);
    // @ts-ignore
    this._camera.copy(this.base.camera);
    const r = new THREE.Vector3(0, 0, 1).clone().negate();
    const o = this.base.camera.getWorldPosition(new THREE.Vector3());
    r.reflect(this.reflectPlane.normal);
    const p = new THREE.Vector3();
    this.reflectPlane.projectPoint(o, p);
    const y = p.clone();
    y.sub(o), y.add(p), this._camera.position.copy(y);
    const d = new THREE.Vector3(0, 0, -1);
    d.applyQuaternion(
      this.base.camera.getWorldQuaternion(new THREE.Quaternion())
    );
    d.add(o);
    const E = new THREE.Vector3();
    this.parent.getWorldPosition(E);
    E.sub(d);
    E.reflect(this.reflectPlane.normal).negate();
    E.add(this.parent.getWorldPosition(new THREE.Vector3()));
    this._camera.up.set(0, 1, 0);
    this._camera.applyQuaternion(
      this.base.camera.getWorldQuaternion(new THREE.Quaternion())
    );
    this._camera.up.reflect(this.reflectPlane.normal);
    this._camera.lookAt(E);
    this._camera.updateMatrixWorld();
    const L = new THREE.Matrix4();
    L.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    L.multiply(this._camera.projectionMatrix);
    L.multiply(this._camera.matrixWorldInverse);
    this._reflectMatrix.copy(L);
    this.reflectPlane.applyMatrix4(this._camera.matrixWorldInverse);
    const k = new THREE.Vector4(
      this.reflectPlane.normal.x,
      this.reflectPlane.normal.y,
      this.reflectPlane.normal.z,
      this.reflectPlane.constant
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
    const Z = this.base.renderer.getRenderTarget();
    this.base.renderer.setRenderTarget(this._renderTexture.rt);
    this.base.renderer.state.buffers.depth.setMask(true);
    this.base.renderer.autoClear === false && this.base.renderer.clear();
    this.ignoreObjects.forEach((be) => (be.visible = false));
    this.base.renderer.render(this.base.scene, this._camera);
    this.ignoreObjects.forEach((be) => (be.visible = true));
    this.base.renderer.setRenderTarget(Z);
  }

  dispose(): void {
    // 清理渲染目标
    if (this._renderTexture && this._renderTexture.rt) {
      this._renderTexture.rt.dispose();
    }
    if (this.mirrorFBO) {
      this.mirrorFBO.dispose();
    }
  }
}

export { MeshReflectorMaterial };