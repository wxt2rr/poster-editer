import React from 'react';

const BottomBar = ({ 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onZoomToFit, 
  onZoomToActual,
  elementCount,
  selectedCount,
  canvasSize
}) => {
  return (
    <div className="bottom-bar" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px',
      borderTop: '1px solid #ddd',
      backgroundColor: '#f8f9fa',
      fontSize: '12px'
    }}>
      {/* 左侧：状态信息 */}
      <div className="status-info" style={{ display: 'flex', gap: '20px' }}>
        <span>画布: {canvasSize.width} × {canvasSize.height}</span>
        <span>元素: {elementCount}</span>
        <span>已选择: {selectedCount}</span>
      </div>

      {/* 右侧：缩放控制 */}
      <div className="zoom-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={onZoomOut}
          style={{ 
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          -
        </button>
        <span style={{ minWidth: '60px', textAlign: 'center' }}>{zoom}%</span>
        <button 
          onClick={onZoomIn}
          style={{ 
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          +
        </button>
        <button 
          onClick={onZoomToFit}
          style={{ 
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          适应
        </button>
        <button 
          onClick={onZoomToActual}
          style={{ 
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          100%
        </button>
      </div>
    </div>
  );
};

export default BottomBar;