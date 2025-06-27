import * as THREE from "three";
import { ModelLoader } from "../utils/ModelLoader";

// 模型文件路径
const MODEL_PATH = "/src/assets/su7Model/sm_car.gltf";

/**
 * 车辆部件接口定义
 * 包含所有可能的车辆部件及其类型
 */
interface CarParts {
  body: THREE.Mesh | undefined; // 车身主体
  object37009: THREE.Mesh | undefined; // 车身部件1
  object37009_1: THREE.Mesh | undefined; // 车身部件2
  bodySmooth: THREE.Mesh | undefined; // 车身光滑黑色部分
  licensePlate: THREE.Mesh | undefined; // 车牌
  roofRadar: THREE.Mesh | undefined; // 车顶雷达
  chassis: THREE.Mesh | undefined; // 底盘
  chassis001: THREE.Mesh | undefined; // 底盘附加部分
  glass: THREE.Mesh | undefined; // 玻璃
  object31006: THREE.Mesh | undefined; // 内饰部件1
  object31006_1: THREE.Mesh | undefined; // 内饰部件2
  interior: THREE.Mesh | undefined; // 内饰主体
  interior001: THREE.Mesh | undefined; // 内饰部分1
  interior002: THREE.Mesh | undefined; // 内饰部分2
  interior003: THREE.Mesh | undefined; // 内饰部分3
  interior004: THREE.Mesh | undefined; // 内饰部分4
  interior006: THREE.Mesh | undefined; // 内饰部分6
  interior009: THREE.Mesh | undefined; // 内饰部分9
  interior011: THREE.Mesh | undefined; // 内饰部分11
  object14003: THREE.Mesh | undefined; // 灯光部件1
  object14003_1: THREE.Mesh | undefined; // 灯光部件2
  light002: THREE.Mesh | undefined; // 车灯2
  light003: THREE.Mesh | undefined; // 车灯3
  lightGlass: THREE.Mesh | undefined; // 灯罩玻璃
  object13006: THREE.Mesh | undefined; // 外观部件1
  object13006_1: THREE.Mesh | undefined; // 外观部件2
  logo: THREE.Mesh | undefined; // 车标
  logo001: THREE.Mesh | undefined; // 车标附加部分
  brake: THREE.Mesh | undefined; // 刹车系统
  wheel001: THREE.Mesh | undefined; // 车轮1
  wheel002: THREE.Mesh | undefined; // 车轮2
  windshieldWiper: THREE.Mesh | undefined; // 雨刷
}

/**
 * 车辆类
 * 负责管理和控制整个车辆模型
 */
class Car {
  private modelLoader: ModelLoader; // 模型加载器实例

  /**
   * 所有车辆部件的集合
   * 使用对象形式统一管理所有部件
   * 初始化时所有部件均为 undefined，在模型加载完成后赋值
   */
  private parts: CarParts = {
    body: undefined,
    object37009: undefined,
    object37009_1: undefined,
    bodySmooth: undefined,
    licensePlate: undefined,
    roofRadar: undefined,
    chassis: undefined,
    chassis001: undefined,
    glass: undefined,
    object31006: undefined,
    object31006_1: undefined,
    interior: undefined,
    interior001: undefined,
    interior002: undefined,
    interior003: undefined,
    interior004: undefined,
    interior006: undefined,
    interior009: undefined,
    interior011: undefined,
    object14003: undefined,
    object14003_1: undefined,
    light002: undefined,
    light003: undefined,
    lightGlass: undefined,
    object13006: undefined,
    object13006_1: undefined,
    logo: undefined,
    logo001: undefined,
    brake: undefined,
    wheel001: undefined,
    wheel002: undefined,
    windshieldWiper: undefined,
  };

  private onLoadComplete?: () => void;

  private scene: THREE.Scene;

  /**
   * 构造函数
   * @param scene - Three.js 场景实例
   */
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.modelLoader = new ModelLoader(scene);
    this.loadModel();
  }

  /**
   * 加载车辆模型
   * 异步加载 GLTF 模型文件，并初始化所有部件
   */
  private async loadModel() {
    try {
      await this.modelLoader.loadModel(MODEL_PATH);

      // 加载所有部件
      // 车身相关部件
      this.parts.body = this.modelLoader.getMesh("body");
      this.parts.object37009 = this.modelLoader.getMesh("Object_37009");
      this.parts.object37009_1 = this.modelLoader.getMesh("Object_37009_1");
      this.parts.bodySmooth = this.modelLoader.getMesh("body_smoothblack");

      // 外部组件
      this.parts.licensePlate = this.modelLoader.getMesh("ChePai");
      this.parts.roofRadar = this.modelLoader.getMesh("dingbuleida");
      this.parts.chassis = this.modelLoader.getMesh("DiPan");
      this.parts.chassis001 = this.modelLoader.getMesh("DiPan001");
      this.parts.glass = this.modelLoader.getMesh("Glass");

      // 内饰相关部件
      this.parts.object31006 = this.modelLoader.getMesh("Object_31006");
      this.parts.object31006_1 = this.modelLoader.getMesh("Object_31006_1");
      this.parts.interior = this.modelLoader.getMesh("interior");
      this.parts.interior001 = this.modelLoader.getMesh("interior001");
      this.parts.interior002 = this.modelLoader.getMesh("interior002");
      this.parts.interior003 = this.modelLoader.getMesh("interior003");
      this.parts.interior004 = this.modelLoader.getMesh("interior004");
      this.parts.interior006 = this.modelLoader.getMesh("interior006");
      this.parts.interior009 = this.modelLoader.getMesh("interior009");
      this.parts.interior011 = this.modelLoader.getMesh("interior011");

      // 灯光系统
      this.parts.object14003 = this.modelLoader.getMesh("Object_14003");
      this.parts.object14003_1 = this.modelLoader.getMesh("Object_14003_1");
      this.parts.light002 = this.modelLoader.getMesh("Light002");
      this.parts.light003 = this.modelLoader.getMesh("Light003");
      this.parts.lightGlass = this.modelLoader.getMesh("LightGlass");

      // 外观细节
      this.parts.object13006 = this.modelLoader.getMesh("Object_13006");
      this.parts.object13006_1 = this.modelLoader.getMesh("Object_13006_1");
      this.parts.logo = this.modelLoader.getMesh("Logo");
      this.parts.logo001 = this.modelLoader.getMesh("Logo001");

      // 功能部件
      this.parts.brake = this.modelLoader.getMesh("ShaChe");
      this.parts.wheel001 = this.modelLoader.getMesh("Wheel001");
      this.parts.wheel002 = this.modelLoader.getMesh("Wheel002");
      this.parts.windshieldWiper = this.modelLoader.getMesh("YuGua");

      // 加载完成后调用回调
      if (this.onLoadComplete) {
        this.onLoadComplete();
      }
    } catch (error) {
      console.error("加载模型失败:", error);
    }
  }

  /**
   * 更新方法
   * 在每一帧中被调用，用于更新车辆动画
   * 目前实现了车轮旋转动画
   */
  public update() {
    // 更新轮子动画
    if (this.parts.wheel001) {
      this.parts.wheel001.rotation.z -= 0.05;
    }
    if (this.parts.wheel002) {
      this.parts.wheel002.rotation.z -= 0.05;
    }

    if (this.parts.light002) {
      console.log(this.parts.light002, "light002");
      // this.parts.light002.rotation.z -= 0.05;
    }
  }

  /**
   * 释放资源
   * 目前模型的清理工作在 Scene 组件中统一处理
   */
  public dispose() {
    // 模型的清理工作会在 Scene 组件中统一处理
  }

  /**
   * 获取特定部件
   * @param partName - 部件名称
   * @returns 对应的 Three.js Mesh 对象，如果不存在则返回 undefined
   */
  public getPart(partName: keyof CarParts): THREE.Mesh | undefined {
    return this.parts[partName];
  }

  /**
   * 获取所有部件
   * @returns 包含所有部件的对象
   */
  public getAllParts(): CarParts {
    return this.parts;
  }

  // 添加一个等待加载完成的方法
  public async waitForLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (this.parts.wheel001) {
        resolve();
      } else {
        this.onLoadComplete = () => resolve();
      }
    });
  }
}

export default Car;
