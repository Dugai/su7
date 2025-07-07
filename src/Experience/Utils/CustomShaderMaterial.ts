import * as THREE from "three";

export interface CustomShaderMaterialOptions {
  baseMaterial: THREE.Material;
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [key: string]: THREE.IUniform };
}

export class CustomShaderMaterial extends THREE.ShaderMaterial {
  private baseMaterial: THREE.Material;

  constructor(options: CustomShaderMaterialOptions) {
    // Extract base material properties
    const baseUniforms = CustomShaderMaterial.extractUniforms(
      options.baseMaterial
    );

    // Merge uniforms
    const mergedUniforms = {
      ...baseUniforms,
      ...options.uniforms,
    };

    super({
      uniforms: mergedUniforms,
      vertexShader: options.vertexShader,
      fragmentShader: options.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.baseMaterial = options.baseMaterial;

    // Copy properties from base material
    this.copyPropertiesFromBase();
  }

  private copyPropertiesFromBase() {
    if (this.baseMaterial instanceof THREE.MeshStandardMaterial) {
      // Copy common properties
      this.transparent = this.baseMaterial.transparent;
      this.opacity = this.baseMaterial.opacity;
      this.alphaTest = this.baseMaterial.alphaTest;
      this.side = this.baseMaterial.side;
      this.depthTest = this.baseMaterial.depthTest;
      this.depthWrite = this.baseMaterial.depthWrite;
    }
  }

  private static extractUniforms(material: THREE.Material): {
    [key: string]: THREE.IUniform;
  } {
    const uniforms: { [key: string]: THREE.IUniform } = {};

    if (material instanceof THREE.MeshStandardMaterial) {
      // Add common uniforms
      if (material.map) {
        uniforms.map = { value: material.map };
      }
      if (material.normalMap) {
        uniforms.normalMap = { value: material.normalMap };
      }
      if (material.roughnessMap) {
        uniforms.roughnessMap = { value: material.roughnessMap };
      }
      if (material.aoMap) {
        uniforms.aoMap = { value: material.aoMap };
      }
      if (material.lightMap) {
        uniforms.lightMap = { value: material.lightMap };
      }
      if (material.emissiveMap) {
        uniforms.emissiveMap = { value: material.emissiveMap };
      }

      uniforms.roughness = { value: material.roughness };
      uniforms.metalness = { value: material.metalness };
      uniforms.opacity = { value: material.opacity };
      uniforms.envMapIntensity = { value: material.envMapIntensity };
    }

    return uniforms;
  }

  public updateUniforms(newUniforms: { [key: string]: any }) {
    Object.keys(newUniforms).forEach((key) => {
      if (this.uniforms[key]) {
        this.uniforms[key].value = newUniforms[key];
      }
    });
  }
}
