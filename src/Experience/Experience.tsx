import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import { Howl } from "howler";
import { useParams } from "./hooks/useParams";
import { useAssets } from "./hooks/useAssets";
import { World } from "./World/World";
import { Postprocessing } from "./Postprocessing";

interface ExperienceProps {
  className?: string;
}

export const Experience: React.FC<ExperienceProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const worldRef = useRef<World | null>(null);
  const postRef = useRef<Postprocessing | null>(null);
  const frameIdRef = useRef<number>(0);
  const bgmRef = useRef<Howl | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [isEntered, setIsEntered] = useState(false);
  
  // 添加GSAP动画的引用
  const cameraAnimationRef = useRef<gsap.core.Tween | null>(null);
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

  const params = useParams();
  const { assets, isLoading } = useAssets();

  // 添加相机位置动画函数
  const animateCameraTo = (
    targetPosition: THREE.Vector3, 
    duration: number = 2, 
    ease: string = "power2.inOut"
  ) => {
    const camera = cameraRef.current;
    if (!camera) return;

    // 停止之前的动画
    if (cameraAnimationRef.current) {
      cameraAnimationRef.current.kill();
    }

    // 创建新的动画
    cameraAnimationRef.current = gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration,
      ease,
      onUpdate: () => {
        // 在动画过程中禁用控制器
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
      },
      onComplete: () => {
        // 动画完成后重新启用控制器
        if (controlsRef.current && !params.isCameraMoving) {
          controlsRef.current.enabled = true;
        }
      }
    });
  };

  useEffect(() => {
    if (!containerRef.current || isLoading) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      params.cameraFov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(
      params.cameraPos.x,
      params.cameraPos.y,
      params.cameraPos.z
    );
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    // 初始化目标位置
    targetPositionRef.current.copy(camera.position);

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.8, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false; // Initially disabled
    controlsRef.current = controls;

    // Initialize raycaster for interaction
    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster;

    // Initialize world
    const world = new World(scene, camera, renderer, assets, params);
    worldRef.current = world;

    // Initialize post-processing
    const post = new Postprocessing(scene, camera, renderer);
    postRef.current = post;

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleClick = () => {
      if (params.disableInteract) return;

      raycaster.setFromCamera(mouseRef.current, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        // Check if clicked on car
        if (
          clickedObject.parent?.name === "car" ||
          clickedObject.name === "car"
        ) {
          world.rush();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    // Animation loop
    const animate = (time: number) => {
      // 检查相机位置是否需要更新
      const newTargetPosition = new THREE.Vector3(
        params.cameraPos.x,
        params.cameraPos.y,
        params.cameraPos.z
      );

      // 如果目标位置发生变化，启动动画
      if (!targetPositionRef.current.equals(newTargetPosition)) {
        targetPositionRef.current.copy(newTargetPosition);
        
        if (params.isCameraMoving) {
          // 使用GSAP动画移动相机
          animateCameraTo(newTargetPosition, 1.5, "power2.inOut");
        }
      }

      // 只有在非动画状态下才启用控制器
      if (!params.isCameraMoving && !cameraAnimationRef.current?.isActive()) {
        controls.enabled = true;
      } else {
        controls.enabled = false;
      }

      // Update world
      world.update();

      // Update controls
      controls.update();

      // Render
      post.render();
      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Update camera
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Update post-processing
      post.resize();
    };

    window.addEventListener("resize", handleResize);

    // Start the experience with camera animation
    setTimeout(() => {
      world.enter();
      setIsEntered(true);
      
      // 初始相机动画
      const initialPosition = new THREE.Vector3(
        params.cameraPos.x,
        params.cameraPos.y,
        params.cameraPos.z
      );
      animateCameraTo(initialPosition, 2, "power2.out");
      
      // bgm.play();
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(frameIdRef.current);

      // 清理GSAP动画
      if (cameraAnimationRef.current) {
        cameraAnimationRef.current.kill();
      }

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      world.dispose();
      renderer.dispose();
      // bgm.stop();
    };
  }, [assets, isLoading, params]);

  // 暴露相机动画函数给外部使用
  useEffect(() => {
    // 可以在这里监听params的变化来触发相机动画
    if (cameraRef.current && params.cameraPos) {
      const newPosition = new THREE.Vector3(
        params.cameraPos.x,
        params.cameraPos.y,
        params.cameraPos.z
      );
      
      if (!targetPositionRef.current.equals(newPosition)) {
        animateCameraTo(newPosition, 1.5, "power2.inOut");
      }
    }
  }, [params.cameraPos]);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loader-screen">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`experience-container ${className || ""}`}
    />
  );
};