import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export interface ResourceItem {
  name: string;
  type: "gltfModel" | "fbxModel" | "texture" | "hdrTexture" | "audio";
  path: string;
}

export default class AssetManager {
  items: Record<string, any> = {};
  loadingManager: THREE.LoadingManager;
  
  private gltfLoader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private textureLoader: THREE.TextureLoader;
  private hdrLoader: RGBELoader;
  
  constructor() {
    console.log('📦 创建资源管理器...');
    
    // 创建加载管理器
    this.loadingManager = new THREE.LoadingManager();
    
    // 创建各种加载器
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.hdrLoader = new RGBELoader(this.loadingManager);
    
    // 设置GLTF解码器
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    
    // 设置加载管理器回调
    this.setupLoadingCallbacks();
  }
  
  private setupLoadingCallbacks() {
    let loadedCount = 0;
    let totalCount = 0;
    
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      totalCount = itemsTotal;
      console.log(`📥 开始加载资源: ${itemsLoaded}/${itemsTotal}`);
    };
    
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = Math.round((itemsLoaded / itemsTotal) * 100);
      console.log(`📊 加载进度: ${progress}% (${itemsLoaded}/${itemsTotal})`);
      console.log(`📄 当前文件: ${url}`);
    };
    
    this.loadingManager.onLoad = () => {
      console.log('✅ 所有资源加载完成！');
    };
    
    this.loadingManager.onError = (url) => {
      console.error(`❌ 资源加载失败: ${url}`);
    };
  }
  
  async loadResources(resources: ResourceItem[]): Promise<void> {
    console.log(`📋 准备加载 ${resources.length} 个资源...`);
    
    const promises = resources.map(resource => this.loadResource(resource));
    
    try {
      await Promise.all(promises);
      this.handleLoadedAssets();
      console.log('🎉 资源管理器加载完成！');
    } catch (error) {
      console.error('❌ 资源加载过程中出现错误:', error);
      throw error;
    }
  }
  
  private async loadResource(resource: ResourceItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const { name, type, path } = resource;
      
      console.log(`🔄 加载 ${type}: ${name} (${path})`);
      
      switch (type) {
        case "gltfModel":
          this.gltfLoader.load(
            path,
            (gltf) => {
              this.items[name] = gltf;
              console.log(`✅ GLTF模型加载成功: ${name}`);
              resolve();
            },
            (progress) => {
              // 进度回调已在LoadingManager中处理
            },
            (error) => {
              console.error(`❌ GLTF模型加载失败: ${name}`, error);
              reject(error);
            }
          );
          break;
          
        case "fbxModel":
          this.fbxLoader.load(
            path,
            (fbx) => {
              this.items[name] = fbx;
              console.log(`✅ FBX模型加载成功: ${name}`);
              resolve();
            },
            (progress) => {
              // 进度回调已在LoadingManager中处理
            },
            (error) => {
              console.error(`❌ FBX模型加载失败: ${name}`, error);
              reject(error);
            }
          );
          break;
          
        case "texture":
          this.textureLoader.load(
            path,
            (texture) => {
              this.items[name] = texture;
              console.log(`✅ 纹理加载成功: ${name}`);
              resolve();
            },
            (progress) => {
              // 进度回调已在LoadingManager中处理
            },
            (error) => {
              console.error(`❌ 纹理加载失败: ${name}`, error);
              reject(error);
            }
          );
          break;
          
        case "hdrTexture":
          this.hdrLoader.load(
            path,
            (hdrTexture) => {
              this.items[name] = hdrTexture;
              console.log(`✅ HDR纹理加载成功: ${name}`);
              resolve();
            },
            (progress) => {
              // 进度回调已在LoadingManager中处理
            },
            (error) => {
              console.error(`❌ HDR纹理加载失败: ${name}`, error);
              reject(error);
            }
          );
          break;
          
        case "audio":
          // 音频加载使用Howler.js，这里暂时跳过
          console.log(`⏭️ 跳过音频加载: ${name}`);
          resolve();
          break;
          
        default:
          reject(new Error(`未支持的资源类型: ${type}`));
      }
    });
  }
  
  private handleLoadedAssets() {
    console.log('🎨 处理加载的资源...');
    
    // 处理纹理设置（参考原始代码中的handleAssets）
    const textureSettings = [
      {
        name: "ut_car_body_ao",
        settings: {
          flipY: false,
          colorSpace: THREE.LinearSRGBColorSpace,
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
        }
      },
      {
        name: "ut_startroom_ao", 
        settings: {
          flipY: false,
          colorSpace: THREE.LinearSRGBColorSpace,
        }
      },
      {
        name: "ut_startroom_light",
        settings: {
          flipY: false,
          colorSpace: THREE.SRGBColorSpace,
        }
      },
      {
        name: "ut_floor_normal",
        settings: {
          flipY: false,
          colorSpace: THREE.LinearSRGBColorSpace,
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping,
        }
      },
      {
        name: "ut_floor_roughness",
        settings: {
          flipY: false,
          colorSpace: THREE.LinearSRGBColorSpace,
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping,
        }
      }
    ];
    
    // 应用纹理设置
    textureSettings.forEach(({ name, settings }) => {
      const texture = this.items[name] as THREE.Texture;
      if (texture && texture.isTexture) {
        Object.assign(texture, settings);
        console.log(`🎨 纹理设置已应用: ${name}`);
      }
    });
    
    // 处理Furina模式的贴花纹理
    if (this.items["decal"]) {
      const decalTexture = this.items["decal"] as THREE.Texture;
      decalTexture.flipY = false;
      decalTexture.colorSpace = THREE.LinearSRGBColorSpace;
      console.log('🎨 贴花纹理设置已应用');
    }
    
    console.log('✅ 资源处理完成');
  }
  
  // 获取资源的便捷方法
  getTexture(name: string): THREE.Texture | null {
    const item = this.items[name];
    return item && item.isTexture ? item : null;
  }
  
  getGLTF(name: string): any | null {
    const item = this.items[name];
    return item && item.scene ? item : null;
  }
  
  getFBX(name: string): THREE.Group | null {
    const item = this.items[name];
    return item && item.isGroup ? item : null;
  }
  
  // 创建环境贴图的辅助方法
  createEnvMapFromHDR(name: string): THREE.Texture | null {
    const hdrTexture = this.items[name];
    if (!hdrTexture) return null;
    
    // 设置HDR纹理为环境贴图
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    return hdrTexture;
  }
}
