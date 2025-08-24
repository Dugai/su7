import React, { useState } from "react";
import { Experience } from "./Experience/Experience";
import VanillaDemo from "./VanillaDemo";
import SimpleVanillaDemo from "./SimpleVanillaDemo";

type DemoMode = 'react' | 'vanilla' | 'simple';

const App: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>('react');

  const handleBackToReact = () => {
    setMode('react');
  };

  if (mode === 'vanilla') {
    return <VanillaDemo onClose={handleBackToReact} />;
  }

  if (mode === 'simple') {
    return <SimpleVanillaDemo onClose={handleBackToReact} />;
  }

  return (
    <div className="app">
      <div className="version-selector" style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
          🚗 小米SU7 特效演示
        </div>
        <div style={{ marginBottom: '15px', fontSize: '12px', opacity: 0.8 }}>
          选择你想体验的版本
        </div>
        
        <button 
          onClick={() => setMode('simple')}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: '8px',
            padding: '10px 16px',
            background: '#26d6e9',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🎮 简化演示版本
        </button>
        
        <button 
          onClick={() => setMode('vanilla')}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px 16px',
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🚀 完整 Vanilla 版本
        </button>
        
        <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.6, lineHeight: '1.3' }}>
          简化版本：无需资源文件，立即体验<br/>
          完整版本：需要完整资源文件
        </div>
      </div>
      <Experience />
    </div>
  );
};

export default App;
