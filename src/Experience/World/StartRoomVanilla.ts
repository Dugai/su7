import * as kokomi from "kokomi.js";
import * as THREE from "three";
import * as STDLIB from "three-stdlib";

import type ExperienceVanilla from "../ExperienceVanilla";

import reflecFloorVertexShader from "../Shaders/ReflecFloor/vert.glsl";
import reflecFloorFragmentShader from "../Shaders/ReflecFloor/frag.glsl";

import { MeshReflectorMaterial } from "../Utils/meshReflectorMaterial";

export default class StartRoomVanilla extends kokomi.Component {
  declare base: ExperienceVanilla;
  model: STDLIB.GLTF;
  uj: kokomi.UniformInjector;
  lightMat: THREE.MeshStandardMaterial;
  customFloorMat: kokomi.CustomShaderMaterial;

  constructor(base: ExperienceVanilla) {
    super(base);

    const model = this.base.am.items["sm_startroom"] as STDLIB.GLTF;
    this.model = model;

    const modelParts = kokomi.flatModel(model.scene);
    // kokomi.printModel(modelParts);

    // 安全地处理光照材质
    let light001: THREE.Mesh | null = null;
    let ReflecFloor: THREE.Mesh | null = null;
    
    if (modelParts.length > 1) {
      light001 = modelParts[1] as THREE.Mesh;
      if (light001 && light001.material) {
        const lightMat = light001.material as THREE.MeshStandardMaterial;
        this.lightMat = lightMat;
        lightMat.emissive = new THREE.Color("white");
        lightMat.emissiveIntensity = 1;
        lightMat.toneMapped = false;
        lightMat.transparent = true;
        this.lightMat.alphaTest = 0.1;
      } else {
        // 创建默认光照材质
        this.lightMat = new THREE.MeshStandardMaterial({
          emissive: new THREE.Color("white"),
          emissiveIntensity: 1,
          toneMapped: false,
          transparent: true,
          alphaTest: 0.1
        });
      }
    }

    // 安全地处理地面材质
    if (modelParts.length > 2) {
      ReflecFloor = modelParts[2] as THREE.Mesh;
      if (ReflecFloor && ReflecFloor.material) {
        const floorMat = ReflecFloor.material as THREE.MeshPhysicalMaterial;
        
        // 安全地设置贴图
        const startRoomAO = this.base.am.items["ut_startroom_ao"];
        const startRoomLight = this.base.am.items["ut_startroom_light"];
        const floorNormal = this.base.am.items["ut_floor_normal"];
        const floorRoughness = this.base.am.items["ut_floor_roughness"];
        
        if (startRoomAO) floorMat.aoMap = startRoomAO;
        if (startRoomLight) floorMat.lightMap = startRoomLight;
        if (floorNormal) floorMat.normalMap = floorNormal;
        if (floorRoughness) floorMat.roughnessMap = floorRoughness;
        
        floorMat.envMapIntensity = 0;
      }
    }

    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;

    // 确保有地面材质可用
    let baseMaterial: THREE.MeshPhysicalMaterial;
    if (ReflecFloor && ReflecFloor.material) {
      baseMaterial = ReflecFloor.material as THREE.MeshPhysicalMaterial;
    } else {
      // 创建默认地面材质
      baseMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888888,
        roughness: 0.5,
        metalness: 0.1
      });
    }

    const customFloorMat = new kokomi.CustomShaderMaterial({
      baseMaterial: baseMaterial,
      vertexShader: reflecFloorVertexShader,
      fragmentShader: reflecFloorFragmentShader,
      uniforms: {
        ...uj.shadertoyUniforms,
        uColor: {
          value: new THREE.Color("#ffffff"),
        },
        uSpeed: {
          value: this.base.params.speed,
        },
        uReflectMatrix: {
          value: new THREE.Matrix4(),
        },
        uReflectTexture: {
          value: null,
        },
        uReflectIntensity: {
          value: 25,
        },
        uMipmapTextureSize: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
    });
    this.customFloorMat = customFloorMat;
    
    // 安全地应用自定义材质
    if (ReflecFloor) {
      ReflecFloor.material = customFloorMat;
    }

    this.base.resizer.on("resize", () => {
      this.customFloorMat.uniforms.uMipmapTextureSize.value = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      );
    });

    // 安全地创建反射材质
    if (ReflecFloor) {
      const ignoreList = [ReflecFloor];
      if (light001) ignoreList.push(light001);
      
      const reflectMat = new MeshReflectorMaterial(this.base, ReflecFloor, {
        resolution: 1024,
        ignoreObjects: ignoreList,
      });
      customFloorMat.uniforms.uReflectMatrix.value = reflectMat._reflectMatrix;
      customFloorMat.uniforms.uReflectTexture.value =
        reflectMat.mipmapFBO.rt.texture;
    }
  }

  addExisting() {
    this.container.add(this.model.scene);
  }

  update(): void {
    this.uj.injectShadertoyUniforms(this.customFloorMat.uniforms);

    this.customFloorMat.uniforms.uSpeed.value = this.base.params.speed;
  }
}
