import * as THREE from "three";

export interface MeshReflectorMaterialOptions {
  resolution?: number;
  ignoreObjects?: THREE.Object3D[];
}

export class MeshReflectorMaterial {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private reflectorMesh: THREE.Mesh;
  private options: MeshReflectorMaterialOptions;

  public _reflectMatrix: THREE.Matrix4;
  public mipmapFBO: { rt: { texture: THREE.Texture } };

  private renderTarget: THREE.WebGLRenderTarget;
  private reflectorPlane: THREE.Plane;
  private normal: THREE.Vector3;
  private reflectorWorldPosition: THREE.Vector3;
  private cameraWorldPosition: THREE.Vector3;
  private rotationMatrix: THREE.Matrix4;
  private lookAtPosition: THREE.Vector3;
  private clipPlane: THREE.Vector4;
  private view: THREE.Vector3;
  private target: THREE.Vector3;
  private q: THREE.Vector4;
  private textureMatrix: THREE.Matrix4;
  private virtualCamera: THREE.PerspectiveCamera;

  constructor(
    base: any, // Experience base
    mesh: THREE.Mesh,
    options: MeshReflectorMaterialOptions = {}
  ) {
    this.scene = base.scene;
    this.camera = base.camera;
    this.renderer = base.renderer;
    this.reflectorMesh = mesh;
    this.options = {
      resolution: 1024,
      ...options,
    };

    // Initialize matrices and vectors
    this._reflectMatrix = new THREE.Matrix4();
    this.renderTarget = new THREE.WebGLRenderTarget(
      this.options.resolution!,
      this.options.resolution!,
      {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
      }
    );

    // Create mipmap FBO structure for compatibility
    this.mipmapFBO = {
      rt: {
        texture: this.renderTarget.texture,
      },
    };

    this.reflectorPlane = new THREE.Plane();
    this.normal = new THREE.Vector3();
    this.reflectorWorldPosition = new THREE.Vector3();
    this.cameraWorldPosition = new THREE.Vector3();
    this.rotationMatrix = new THREE.Matrix4();
    this.lookAtPosition = new THREE.Vector3(0, 0, -1);
    this.clipPlane = new THREE.Vector4();
    this.view = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.q = new THREE.Vector4();
    this.textureMatrix = new THREE.Matrix4();
    this.virtualCamera = new THREE.PerspectiveCamera();

    this.updateReflectionMatrix();
  }

  private updateReflectionMatrix() {
    this.reflectorWorldPosition.setFromMatrixPosition(
      this.reflectorMesh.matrixWorld
    );
    this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

    this.rotationMatrix.extractRotation(this.reflectorMesh.matrixWorld);

    this.normal.set(0, 0, 1);
    this.normal.applyMatrix4(this.rotationMatrix);

    this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition);

    // Avoid rendering when reflector is facing away
    if (this.view.dot(this.normal) > 0) return;

    this.view.reflect(this.normal).negate();
    this.view.add(this.reflectorWorldPosition);

    this.rotationMatrix.extractRotation(this.camera.matrixWorld);

    this.lookAtPosition.set(0, 0, -1);
    this.lookAtPosition.applyMatrix4(this.rotationMatrix);
    this.lookAtPosition.add(this.cameraWorldPosition);

    this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition);
    this.target.reflect(this.normal).negate();
    this.target.add(this.reflectorWorldPosition);

    this.virtualCamera.position.copy(this.view);
    this.virtualCamera.up.set(0, 1, 0);
    this.virtualCamera.up.applyMatrix4(this.rotationMatrix);
    this.virtualCamera.up.reflect(this.normal);
    this.virtualCamera.lookAt(this.target);

    this.virtualCamera.far = (this.camera as THREE.PerspectiveCamera).far;
    this.virtualCamera.updateMatrixWorld();
    this.virtualCamera.projectionMatrix.copy(
      (this.camera as THREE.PerspectiveCamera).projectionMatrix
    );

    // Update the texture matrix
    this.textureMatrix.set(
      0.5,
      0.0,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.5,
      0.5,
      0.0,
      0.0,
      0.0,
      1.0
    );
    this.textureMatrix.multiply(this.virtualCamera.projectionMatrix);
    this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse);

    // Update reflect matrix
    this._reflectMatrix.copy(this.textureMatrix);

    // Update the reflection plane
    this.reflectorPlane.setFromNormalAndCoplanarPoint(
      this.normal,
      this.reflectorWorldPosition
    );
    this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse);

    this.clipPlane.set(
      this.reflectorPlane.normal.x,
      this.reflectorPlane.normal.y,
      this.reflectorPlane.normal.z,
      this.reflectorPlane.constant
    );

    const projectionMatrix = this.virtualCamera.projectionMatrix;

    this.q.x =
      (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) /
      projectionMatrix.elements[0];
    this.q.y =
      (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) /
      projectionMatrix.elements[5];
    this.q.z = -1.0;
    this.q.w =
      (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

    // Calculate the scaled plane vector
    this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));

    // Replacing the third row of the projection matrix
    projectionMatrix.elements[2] = this.clipPlane.x;
    projectionMatrix.elements[6] = this.clipPlane.y;
    projectionMatrix.elements[10] = this.clipPlane.z + 1.0;
    projectionMatrix.elements[14] = this.clipPlane.w;
  }

  public renderReflection() {
    const currentRenderTarget = this.renderer.getRenderTarget();

    // Hide ignored objects
    const originalVisibility: boolean[] = [];
    if (this.options.ignoreObjects) {
      this.options.ignoreObjects.forEach((obj, index) => {
        originalVisibility[index] = obj.visible;
        obj.visible = false;
      });
    }

    // Render the reflection
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.virtualCamera);
    this.renderer.setRenderTarget(currentRenderTarget);

    // Restore visibility
    if (this.options.ignoreObjects) {
      this.options.ignoreObjects.forEach((obj, index) => {
        obj.visible = originalVisibility[index];
      });
    }
  }

  public dispose() {
    this.renderTarget.dispose();
  }
}
