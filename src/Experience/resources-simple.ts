export interface ResourceItem {
  name: string;
  type: "audio" | "gltfModel" | "texture" | "hdrTexture" | "fbxModel";
  path: string;
}

// 恢复小米汽车模型，尝试加载
export const resources: ResourceItem[] = [
  // 小米SU7汽车模型
  {
    name: "sm_car",
    type: "gltfModel",
    path: "/mesh/sm_car.gltf",
  },
  // 开始房间模型
  {
    name: "sm_startroom",
    type: "gltfModel",
    path: "/mesh/sm_startroom.raw.gltf",
  },
  // 基本纹理
  {
    name: "ut_env_light",
    type: "hdrTexture",
    path: "/texture/t_env_light.hdr",
  },
  {
    name: "ut_env_night",
    type: "hdrTexture",
    path: "/texture/t_env_night.hdr",
  },
  {
    name: "ut_floor_normal",
    type: "texture",
    path: "/texture/t_floor_normal.webp",
  },
  {
    name: "ut_floor_roughness",
    type: "texture",
    path: "/texture/t_floor_roughness.webp",
  },
  {
    name: "ut_car_body_ao",
    type: "texture", 
    path: "/texture/t_car_body_AO.raw.jpg",
  },
  {
    name: "decal",
    type: "texture",
    path: "/texture/decal.png",
  },
];
