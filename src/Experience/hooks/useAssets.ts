import { useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module";
import { resources, ResourceItem } from "../resources";

type LoadedAssets = {
  [key: string]: THREE.Texture | THREE.Object3D | AudioBuffer;
};

export const useAssets = () => {
  const [assets, setAssets] = useState<LoadedAssets>({});
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();
    const fbxLoader = new FBXLoader();
    const rgbeLoader = new RGBELoader();
    const audioLoader = new THREE.AudioLoader();

    // Set up Meshopt decoder
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);

    const loadResource = async (resource: ResourceItem): Promise<any> => {
      switch (resource.type) {
        case "texture":
          return await textureLoader.loadAsync(resource.path);
        case "gltfModel":
          const gltf = await gltfLoader.loadAsync(resource.path);
          return gltf;
        // case "fbxModel":
        //   return await fbxLoader.loadAsync(resource.path);
        case "hdrTexture":
          return await rgbeLoader.loadAsync(resource.path);
        case "audio":
          return await audioLoader.loadAsync(resource.path);
        default:
          throw new Error(`Unknown resource type: ${resource.type}`);
      }
    };

    const loadAllResources = async () => {
      const totalResources = resources.length;
      const loadedAssets: LoadedAssets = {};

      for (let i = 0; i < totalResources; i++) {
        const resource = resources[i];
        try {
          loadedAssets[resource.name] = await loadResource(resource);
          setProgress((i + 1) / totalResources);
        } catch (error) {
          console.error(`Error loading resource ${resource.name}:`, error);
        }
      }

      setAssets(loadedAssets);
      setIsLoading(false);
    };

    loadAllResources();

    return () => {
      // Cleanup textures and geometries
      Object.values(assets).forEach((asset) => {
        if (asset instanceof THREE.Texture) {
          asset.dispose();
        } else if (asset instanceof THREE.Object3D) {
          asset.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }
      });
    };
  }, []);

  return { assets, progress, isLoading };
};
