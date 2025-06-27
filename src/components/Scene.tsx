import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Lights from "./Lights";
import Ground from "./Ground";
import Car from "./Car";
import Camera from "./Camera";

interface SceneProps {
  backgroundColor?: number;
}

const Scene: React.FC<SceneProps> = ({ backgroundColor = 0x333333 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 场景设置
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // 相机设置
    const camera = new Camera();
    const cameraInstance = camera.getInstance();

    // 控制器
    const controls = new OrbitControls(cameraInstance, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 添加组件
    const lights = new Lights(scene);
    const ground = new Ground(scene);
    const car = new Car(scene);

    // 窗口大小调整
    const handleResize = () => {
      cameraInstance.aspect = window.innerWidth / window.innerHeight;
      cameraInstance.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 等待模型加载完成后再开始动画
    let animationFrameId: number;

    const startAnimation = () => {
      console.log("模型加载完成，车轮状态:");

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();
        car.update();
        renderer.render(scene, cameraInstance);
      };
      animate();
    };

    // 等待模型加载完成
    car.waitForLoad().then(() => {
      startAnimation();
    });

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      renderer.dispose();
      scene.traverse((object) => {
        if ((object as THREE.Mesh).geometry) {
          (object as THREE.Mesh).geometry.dispose();
        }
        if ((object as THREE.Mesh).material) {
          const material = (object as THREE.Mesh).material;
          if (Array.isArray(material)) {
            material.forEach((mat: THREE.Material) => mat.dispose());
          } else {
            material.dispose();
          }
        }
      });
    };
  }, [backgroundColor]);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Scene;
