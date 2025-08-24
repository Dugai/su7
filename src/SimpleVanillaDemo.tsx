import React, { useEffect, useRef } from 'react';

interface SimpleVanillaDemoProps {
  onClose: () => void;
}

const SimpleVanillaDemo: React.FC<SimpleVanillaDemoProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initDemo = async () => {
      try {
        // 动态导入Three.js
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        const gsap = await import('gsap');

        if (!containerRef.current) return;

        // 创建基础3D场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // 创建相机
        const camera = new THREE.PerspectiveCamera(
          33.4,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 2, -8);
        camera.lookAt(0, 0.5, 0);

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.CineonToneMapping;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        containerRef.current.appendChild(renderer.domElement);

        // 创建控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.5, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // 创建简单的汽车形状（使用基础几何体）
        const carGroup = new THREE.Group();
        carGroup.name = 'car';

        // 车身
        const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x26d6e9,
          metalness: 0.7,
          roughness: 0.1,
          emissive: 0x001122,  // 添加微弱自发光
          emissiveIntensity: 0.1
        });
        const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        carBody.position.y = 0.3;
        carBody.castShadow = true;
        carGroup.add(carBody);

        // 车顶
        const roofGeometry = new THREE.BoxGeometry(1.5, 0.4, 2);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x26d6e9,
          metalness: 0.7,
          roughness: 0.1,
          emissive: 0x001122,  // 添加微弱自发光
          emissiveIntensity: 0.1
        });
        const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
        carRoof.position.y = 0.8;
        carRoof.castShadow = true;
        carGroup.add(carRoof);

        // 车轮
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x444444,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x111111,  // 轮胎也加点自发光
          emissiveIntensity: 0.05
        });

        const wheels: THREE.Mesh[] = [];
        const wheelPositions = [
          [-0.8, 0, -1.2],
          [0.8, 0, -1.2],
          [-0.8, 0, 1.2],
          [0.8, 0, 1.2]
        ];

        wheelPositions.forEach((pos, index) => {
          const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
          wheel.position.set(pos[0], pos[1], pos[2]);
          wheel.rotation.z = Math.PI / 2;
          wheel.castShadow = true;
          wheels.push(wheel);
          carGroup.add(wheel);
        });

        // 添加车头灯
        const headlightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const headlightMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 0.8
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.6, 0.4, 2.1);
        carGroup.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.6, 0.4, 2.1);
        carGroup.add(rightHeadlight);

        // 添加车尾灯
        const taillightMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xff0000,
          emissive: 0x440000,
          emissiveIntensity: 0.5
        });
        
        const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
        leftTaillight.position.set(-0.6, 0.4, -2.1);
        carGroup.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
        rightTaillight.position.set(0.6, 0.4, -2.1);
        carGroup.add(rightTaillight);

        scene.add(carGroup);

        // 创建地面
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x555555,
          metalness: 0.3,
          roughness: 0.6,
          emissive: 0x222222,  // 地面也加点自发光
          emissiveIntensity: 0.03
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // 添加更亮的光照
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // 添加更多光源提升亮度
        const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
        frontLight.position.set(0, 5, 10);
        scene.add(frontLight);

        const backLight = new THREE.DirectionalLight(0x8888ff, 0.8);
        backLight.position.set(0, 5, -10);
        scene.add(backLight);

        const leftLight = new THREE.DirectionalLight(0xffaa88, 0.6);
        leftLight.position.set(-10, 3, 0);
        scene.add(leftLight);

        const rightLight = new THREE.DirectionalLight(0xffaa88, 0.6);
        rightLight.position.set(10, 3, 0);
        scene.add(rightLight);

        // 环境光照动画
        let lightAnimationProgress = 0;
        let isRushing = false;
        let speed = 0;

        // 入场动画
        const enterAnimation = () => {
          // 隐藏加载屏幕
          const loaderScreen = document.querySelector('.simple-loader-screen');
          if (loaderScreen) {
            (loaderScreen as HTMLElement).style.opacity = '0';
            setTimeout(() => {
              loaderScreen.remove();
            }, 300);
          }

          // 相机入场动画
          gsap.default.timeline()
            .to(camera.position, {
              x: 0,
              y: 1.5,
              z: -6,
              duration: 4,
              ease: "power2.inOut"
            })
            .to({ progress: 0 }, {
              progress: 1,
              duration: 4,
              ease: "power2.inOut",
              onUpdate: function() {
                lightAnimationProgress = this.targets()[0].progress;
                ambientLight.intensity = 0.8 + lightAnimationProgress * 0.5;
                directionalLight.intensity = 2 + lightAnimationProgress * 1;
                frontLight.intensity = 1.5 + lightAnimationProgress * 0.5;
                backLight.intensity = 0.8 + lightAnimationProgress * 0.3;
                leftLight.intensity = 0.6 + lightAnimationProgress * 0.4;
                rightLight.intensity = 0.6 + lightAnimationProgress * 0.4;
              }
            }, 0);
        };

        // 加速动画
        const rushAnimation = () => {
          if (isRushing) return;
          isRushing = true;

          gsap.default.timeline()
            .to({ speed: 0 }, {
              speed: 10,
              duration: 3,
              ease: "power2.out",
              onUpdate: function() {
                speed = this.targets()[0].speed;
                
                // 车轮旋转
                wheels.forEach(wheel => {
                  wheel.rotation.x -= speed * 0.03;
                });
                
                // 相机震动效果
                const shake = speed * 0.01;
                camera.position.x += (Math.random() - 0.5) * shake;
                camera.position.y += (Math.random() - 0.5) * shake;
                camera.position.z += (Math.random() - 0.5) * shake;
              }
            })
            .to(camera, {
              fov: 40,
              duration: 2,
              ease: "power2.out",
              onUpdate: () => {
                camera.updateProjectionMatrix();
              }
            }, 0)
            .to(ambientLight, {
              intensity: 0.3,
              duration: 1,
              ease: "power2.out"
            }, 0)
            .to(directionalLight.color, {
              r: 0.2,
              g: 0.4,
              b: 1.0,
              duration: 2,
              ease: "power2.out"
            }, 0.5);
        };

        // 停止加速
        const stopRush = () => {
          if (!isRushing) return;
          isRushing = false;

          gsap.default.timeline()
            .to({ speed }, {
              speed: 0,
              duration: 2,
              ease: "power2.out",
              onUpdate: function() {
                speed = this.targets()[0].speed;
              }
            })
            .to(camera, {
              fov: 33.4,
              duration: 1.5,
              ease: "power2.out",
              onUpdate: () => {
                camera.updateProjectionMatrix();
              }
            }, 0)
            .to(ambientLight, {
              intensity: 1.3,
              duration: 1.5,
              ease: "power2.out"
            }, 0)
            .to(directionalLight.color, {
              r: 1,
              g: 1,
              b: 1,
              duration: 1.5,
              ease: "power2.out"
            }, 0);
        };

        // 点击交互
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseClick = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObject(carGroup, true);

          if (intersects.length > 0) {
            if (isRushing) {
              stopRush();
            } else {
              rushAnimation();
            }
          }
        };

        window.addEventListener('click', onMouseClick);

        // 窗口缩放处理
        const onWindowResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', onWindowResize);

        // 渲染循环
        const animate = () => {
          requestAnimationFrame(animate);
          
          controls.update();
          renderer.render(scene, camera);
        };

        // 启动
        setTimeout(enterAnimation, 1000);
        animate();

        // 清理函数
        return () => {
          window.removeEventListener('click', onMouseClick);
          window.removeEventListener('resize', onWindowResize);
          if (containerRef.current && renderer.domElement) {
            containerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };

      } catch (error) {
        console.error('Simple demo failed:', error);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center;">
              <h3>⚠️ 简化演示启动失败</h3>
              <p>请检查控制台获取详细信息</p>
              <pre style="font-size: 12px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; text-align: left;">
                ${error.message}
              </pre>
            </div>
          `;
        }
      }
    };

    initDemo();
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'black',
        zIndex: 1000
      }}
    >
      <div 
        className="simple-loader-screen"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.3s',
          zIndex: 1001
        }}
      >
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🚗</div>
          <div style={{ fontSize: '18px' }}>小米SU7 简化演示</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
            正在初始化 3D 场景...
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1002,
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <strong>🎮 简化演示版本</strong><br/>
        • 基础3D汽车模型<br/>
        • 点击汽车触发加速<br/>
        • 鼠标拖拽旋转视角<br/>
        • 滚轮缩放场景
      </div>
    </div>
  );
};

export default SimpleVanillaDemo;
