import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/**
 * GLTF解码器工具类
 * 解决kokomi.js中的Meshopt压缩问题
 */
export class GLTFDecoderSetup {
  private static isInitialized = false;

  static async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // 方法1: 设置全局THREE.js GLTFLoader
      if ((window as any).THREE) {
        const THREE = (window as any).THREE;
        if (THREE.GLTFLoader) {
          const originalLoad = THREE.GLTFLoader.prototype.load;
          THREE.GLTFLoader.prototype.load = function(url: string, onLoad: any, onProgress: any, onError: any) {
            if (this.setMeshoptDecoder && MeshoptDecoder) {
              this.setMeshoptDecoder(MeshoptDecoder);
            }
            return originalLoad.call(this, url, onLoad, onProgress, onError);
          };
          console.log('✅ 全局 THREE.GLTFLoader Meshopt 解码器已设置');
        }
      }

      // 方法2: 预设置标准GLTFLoader
      const testLoader = new GLTFLoader();
      if (testLoader.setMeshoptDecoder && MeshoptDecoder) {
        testLoader.setMeshoptDecoder(MeshoptDecoder);
        console.log('✅ 标准 GLTFLoader Meshopt 解码器已设置');
      }

      // 方法3: 尝试设置kokomi内部的加载器
      await this.setupKokomiBundledLoader();

      this.isInitialized = true;
      console.log('🚀 GLTF解码器初始化完成');
      
    } catch (error) {
      console.warn('⚠️ GLTF解码器设置失败，但会尝试继续加载:', error);
    }
  }

  private static async setupKokomiBundledLoader() {
    try {
      // 等待一小段时间让kokomi完全加载
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 尝试访问kokomi的内部加载器
      const kokomi = await import('kokomi.js');
      
      if (kokomi && (kokomi as any).GLTFLoader) {
        const KokomiBundledGLTFLoader = (kokomi as any).GLTFLoader;
        const kokomiBundledLoader = new KokomiBundledGLTFLoader();
        
        if (kokomiBundledLoader.setMeshoptDecoder && MeshoptDecoder) {
          kokomiBundledLoader.setMeshoptDecoder(MeshoptDecoder);
          console.log('✅ Kokomi内置 GLTFLoader Meshopt 解码器已设置');
        }
      }
      
      // 尝试修改kokomi的AssetManager
      if (kokomi && (kokomi as any).AssetManager) {
        const originalAssetManager = (kokomi as any).AssetManager;
        const originalPrototype = originalAssetManager.prototype;
        
        if (originalPrototype && originalPrototype.startLoading) {
          const originalStartLoading = originalPrototype.startLoading;
          originalPrototype.startLoading = function() {
            // 在开始加载前设置解码器
            if (this.loaders && this.loaders.gltfModel) {
              const gltfLoader = this.loaders.gltfModel;
              if (gltfLoader.setMeshoptDecoder && MeshoptDecoder) {
                gltfLoader.setMeshoptDecoder(MeshoptDecoder);
                console.log('✅ Kokomi AssetManager GLTFLoader 解码器已设置');
              }
            }
            return originalStartLoading.call(this);
          };
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Kokomi内置加载器设置失败:', error);
    }
  }

  /**
   * 创建一个已配置解码器的GLTFLoader实例
   */
  static createConfiguredLoader(): GLTFLoader {
    const loader = new GLTFLoader();
    
    if (loader.setMeshoptDecoder && MeshoptDecoder) {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
    
    return loader;
  }
}



