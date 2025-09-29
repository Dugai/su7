import React, { useEffect, useRef } from "react";

const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initNativeExperience = async () => {
      try {
        console.log('🚀 启动原生THREE.js小米SU7展示...');
        
        // 动态导入Experience
        const { default: Experience } = await import('./Experience/Experience');
        
        // 创建Experience实例
        new Experience('#sketch');
        
        console.log('✅ 原生THREE.js版本启动成功！');
        
      } catch (error) {
        console.error('❌ 原生THREE.js版本启动失败:', error);
        
        const container = mountRef.current;
        if (container) {
          container.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; background: rgba(255,0,0,0.1); padding: 20px; border-radius: 10px;">
              <h3>⚠️ 启动失败</h3>
              <p>原生THREE.js版本启动时遇到问题</p>
              <p style="font-size: 12px; color: #ccc;">请检查控制台获取详细信息</p>
              <pre style="font-size: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow: auto; max-height: 200px;">
                ${error instanceof Error ? error.message : String(error)}
              </pre>
            </div>
          `;
        }
      }
    };

    initNativeExperience();
  }, []);

  return (
    <div 
      ref={mountRef}
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
      <div id="sketch"></div>
      <div className="loader-screen">
        <div className="loading-container">
          <div className="loading">
            <span style={{'--i': 0} as React.CSSProperties}>L</span>
            <span style={{'--i': 1} as React.CSSProperties}>O</span>
            <span style={{'--i': 2} as React.CSSProperties}>A</span>
            <span style={{'--i': 3} as React.CSSProperties}>D</span>
            <span style={{'--i': 4} as React.CSSProperties}>I</span>
            <span style={{'--i': 5} as React.CSSProperties}>N</span>
            <span style={{'--i': 6} as React.CSSProperties}>G</span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1001,
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          maxWidth: '320px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#26d6e9' }}>🚗 小米SU7原生THREE.js版本</div>
        <div style={{ marginBottom: '5px' }}>• 🏎️ 完整复刻example项目</div>
        <div style={{ marginBottom: '5px' }}>• 🔧 100%原生THREE.js实现</div>
        <div style={{ marginBottom: '5px' }}>• 🪞 实时反射地面</div>
        <div style={{ marginBottom: '5px' }}>• 🌅 动态环境贴图混合</div>
        <div style={{ marginBottom: '5px' }}>• 💨 速度线特效</div>
        <div style={{ marginBottom: '5px' }}>• 📳 相机震动效果</div>
        <div style={{ marginBottom: '5px' }}>• 🎬 GSAP动画系统</div>
        <div style={{ marginBottom: '5px' }}>• 🖱️ 点击汽车开启冲刺模式</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px', color: '#26d6e9' }}>
          ✨ 无kokomi.js依赖，完全原生！
        </div>
      </div>
    </div>
  );
};

export default App;