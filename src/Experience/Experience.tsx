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

  const params = useParams();
  const { assets, isLoading } = useAssets();

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

    // Initialize background music
    const bgm = new Howl({
      src: ["/audio/bgm.mp3"],
      loop: true,
      volume: 0.5,
    });
    bgmRef.current = bgm;

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
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      // Update camera movement
      if (params.isCameraMoving) {
        controls.enabled = false;
        camera.position.set(
          params.cameraPos.x,
          params.cameraPos.y,
          params.cameraPos.z
        );
      } else {
        controls.enabled = true;
      }

      // Update world
      world.update();

      // Update controls
      controls.update();

      // Render
      post.render();
    };

    animate();

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

    // Start the experience
    setTimeout(() => {
      world.enter();
      setIsEntered(true);
      bgm.play();
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(frameIdRef.current);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      world.dispose();
      renderer.dispose();
      bgm.stop();
    };
  }, [assets, isLoading, params]);

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
