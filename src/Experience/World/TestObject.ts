import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type Experience from "../Experience";

import testObjectVertexShader from "../Shaders/TestObject/vert.glsl";
import testObjectFragmentShader from "../Shaders/TestObject/frag.glsl";

export default class TestObject extends kokomi.Component {
  declare base: Experience;
  testObject!: kokomi.CustomMesh;
  
  constructor(base: Experience) {
    super(base);

    this.create();
  }

  create() {
    const testObjectGeometry = new THREE.SphereGeometry(1, 32, 32);
    const testObjectMaterial = new THREE.ShaderMaterial({
      vertexShader: testObjectVertexShader,
      fragmentShader: testObjectFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      }
    });

    this.testObject = new kokomi.CustomMesh(this.base, testObjectGeometry, testObjectMaterial);
    this.testObject.addExisting();
  }

  update() {
    if (this.testObject) {
      this.testObject.material.uniforms.uTime.value = this.base.clock.elapsedTime;
    }
  }
}



