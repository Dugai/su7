import React, { useEffect, useRef } from 'react';

interface VanillaDemoProps {
  onClose: () => void;
}

const VanillaDemo: React.FC<VanillaDemoProps> = ({ onClose }) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initVanilla = async () => {
      try {
        // 动态导入所有必要的依赖
        const [
          { adaptMobileDOM },
          ExperienceVanilla
        ] = await Promise.all([
          import('kokomi.js'),
          import('./Experience/ExperienceVanilla').then(m => m.default)
        ]);

        // 创建DOM结构
        const container = document.querySelector('#vanilla-container');
        if (!container) return;

        container.innerHTML = `
          <div id="sketch" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;"></div>
          <div class="loader-screen" style="position: fixed; z-index: 5; top: 0; left: 0; width: 100%; height: 100%; transition: 0.3s; background: black;">
            <div class="loading-container" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
              <div class="loading" style="color: white; font-size: 1.875rem; letter-spacing: 0.1em;">
                <span style="--i: 0; animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;">L</span>
                <span style="--i: 1; animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;">O</span>
                <span style="--i: 2; animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;">A</span>
                <span style="--i: 3; animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;">D</span>
                <span style="--i: 4; animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;">I</span>
                <span style="--i: 5; animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;">N</span>
                <span style="--i: 6; animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;">G</span>
              </div>
            </div>
          </div>
        `;

        // 移动端适配
        adaptMobileDOM(container as HTMLElement);
        window.addEventListener("resize", () => {
          adaptMobileDOM(container as HTMLElement);
        });

        // 创建体验实例
        const experience = new ExperienceVanilla("#sketch");
        
        // 添加资源加载监听
        experience.am.on("ready", () => {
          console.log('🎉 所有资源加载完成！');
          // 如果需要，可以调用 enterDirectly 跳过动画直接显示明亮场景
          // experience.world.enterDirectly();
        });
        
        experience.am.on("error", (error) => {
          console.warn('⚠️ 资源加载出现问题:', error);
          console.log('💡 提示：完整版本需要所有资源文件，建议尝试简化演示版本');
        });

        console.log('🚗 小米SU7 Vanilla版本已启动');
        console.log('💡 如果场景太暗，请等待入场动画完成，或者尝试简化演示版本');
        console.log('⚡ 按 Space 键可以跳过动画直接进入明亮场景');
        
        // 添加快捷键监听
        const handleKeyPress = (event: KeyboardEvent) => {
          if (event.code === 'Space') {
            event.preventDefault();
            console.log('⚡ 跳过动画，直接进入明亮场景');
            experience.world?.enterDirectly();
          }
        };
        
        window.addEventListener('keydown', handleKeyPress);
      } catch (error) {
        console.error('启动Vanilla版本失败:', error);
        
        // 显示错误信息
        const container = document.querySelector('#vanilla-container');
        if (container) {
          container.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; background: rgba(255,0,0,0.1); padding: 20px; border-radius: 10px;">
              <h3>⚠️ 启动失败</h3>
              <p>Vanilla版本启动时遇到问题</p>
              <p style="font-size: 12px; color: #ccc;">请检查控制台获取详细信息</p>
              <details style="margin-top: 10px; text-align: left;">
                <summary>错误详情</summary>
                <pre style="font-size: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow: auto; max-height: 200px;">
                  ${error.message}
                </pre>
              </details>
            </div>
          `;
        }
      }
    };

    // 添加模糊动画CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blur {
        to {
          filter: blur(2px);
        }
      }
    `;
    document.head.appendChild(style);

    initVanilla();

    return () => {
      // 清理资源
      const container = document.querySelector('#vanilla-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      id="vanilla-container" 
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
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '18px',
        textAlign: 'center'
      }}>
        <div>🚀 正在启动 Vanilla 版本...</div>
        <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
          请稍候，正在加载必要的资源
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1001,
          padding: '10px 20px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '5px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)'
        }}
      >
        ← 返回选择页面
      </button>

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
        <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#26d6e9' }}>💡 使用提示</div>
        <div style={{ marginBottom: '5px' }}>• 🚗 汽车模型现在有明亮的自发光效果</div>
        <div style={{ marginBottom: '5px' }}>• 🔆 已优化多重光源系统</div>
        <div style={{ marginBottom: '5px' }}>• 按 <kbd style={{ background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace' }}>Space</kbd> 键跳过动画</div>
        <div style={{ marginBottom: '5px' }}>• 鼠标拖拽旋转视角，滚轮缩放</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px', color: '#26d6e9' }}>
          ✨ 现在汽车应该清晰可见了！
        </div>
      </div>
    </div>
  );
};

export default VanillaDemo;
