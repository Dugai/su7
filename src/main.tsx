import './style.css';
import Experience from './Experience/Experience';

// 创建HTML结构
document.querySelector<HTMLDivElement>('#root')!.innerHTML = `
<div id="sketch"></div>
<div class="loader-screen">
    <div class="loading-container">
        <div class="loading">
            <span style="--i: 0">L</span>
            <span style="--i: 1">O</span>
            <span style="--i: 2">A</span>
            <span style="--i: 3">D</span>
            <span style="--i: 4">I</span>
            <span style="--i: 5">N</span>
            <span style="--i: 6">G</span>
        </div>
    </div>
</div>
`;

// 移动端适配函数
function adaptMobileDOM(element: HTMLElement) {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    element.style.touchAction = 'none';
    element.style.userSelect = 'none';
  }
}

const app = document.querySelector("#root")! as HTMLElement;

// 初始适配
adaptMobileDOM(app);

// 监听窗口大小变化
window.addEventListener("resize", () => {
  adaptMobileDOM(app);
});

// 创建Experience实例
console.log('🚀 启动小米SU7原生THREE.js版本...');

try {
  new Experience("#sketch");
  console.log('✅ Experience启动成功');
} catch (error) {
  console.error('❌ Experience启动失败:', error);
  
  // 显示错误信息
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-family: monospace;
    z-index: 10000;
    max-width: 80%;
    text-align: center;
  `;
  errorDiv.innerHTML = `
    <h3>❌ 启动失败</h3>
    <p>原生THREE.js版本遇到问题</p>
    <pre style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow: auto; max-height: 200px;">
      ${error instanceof Error ? error.message : String(error)}
    </pre>
  `;
  document.body.appendChild(errorDiv);
}