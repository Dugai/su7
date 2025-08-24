import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type ExperienceVanilla from "../ExperienceVanilla";

import testObjectVertexShader from "../Shaders/TestObject/vert.glsl";
import testObjectFragmentShader from "../Shaders/TestObject/frag.glsl";

export default class TestObject extends kokomi.Component {
  declare base: ExperienceVanilla;
  uj: kokomi.UniformInjector;
  geometry: THREE.PlaneGeometry;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;

  constructor(base: ExperienceVanilla) {
    super(base);

    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;

    const geometry = new THREE.PlaneGeometry();
    this.geometry = geometry;

    const material = new THREE.ShaderMaterial({
      vertexShader: testObjectVertexShader,
      fragmentShader: testObjectFragmentShader,
      uniforms: {
        ...uj.shadertoyUniforms,
      },
    });
    this.material = material;

    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;
  }

  addExisting() {
    this.container.add(this.mesh);
  }

  update(): void {
    this.uj.injectShadertoyUniforms(this.material.uniforms);
  }
}
