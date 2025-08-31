import React, { useState } from 'react';



const LeftPanel = ({ onAddText, onAddImage, onAddRectangle, onAddCircle, onAddTriangle, onAddLine, onSetCanvasBackground, canvasBackground }) => {
  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0 && onAddImage) {
      onAddImage(files);
    }
    // 清空输入框，允许重复选择同一文件
    event.target.value = '';
  };

  const handleSetCanvasBackgroundClick = (backgroundConfig) => {
    onSetCanvasBackground && onSetCanvasBackground(backgroundConfig);
  };

  return (
    <div className="left-panel">
      <h3>创建工具</h3>
      <div className="create-tools-section">
        <div className="create-tools-grid">
          <button className="btn btn-primary create-tool-btn" onClick={onAddText}>
            📝 添加文字
          </button>
          <button className="btn btn-secondary create-tool-btn" onClick={() => document.getElementById('fileInput').click()}>
            🖼️ 添加图片
          </button>
        </div>
      </div>
      
      <h3>素材库</h3>
      <div className="materials-section">
        <p>上传图片素材</p>
        <div className="file-upload-area" onClick={() => document.getElementById('fileInput').click()}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>点击上传图片</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            支持 JPG, PNG, GIF, WEBP 等格式
          </div>
          <input 
            id="fileInput"
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileUpload}
          />
        </div>
      </div>
      
      <h3>图形工具</h3>
      <div className="shapes-section">
        <div className="shapes-grid">
          <button className="btn btn-ghost shape-btn" onClick={onAddRectangle} title="添加矩形">
            📦 矩形
          </button>
          <button className="btn btn-ghost shape-btn" onClick={onAddCircle} title="添加圆形">
            🔵 圆形
          </button>
          <button className="btn btn-ghost shape-btn" onClick={onAddTriangle} title="添加三角形">
            🔺 三角形
          </button>
          <button className="btn btn-ghost shape-btn" onClick={onAddLine} title="添加线条">
            ➖ 线条
          </button>
        </div>
      </div>

      <h3>背景设置</h3>
      <div className="background-section">
        <div className="form-group">
          <label className="form-label">背景类型</label>
          <div className="radio-group">
            <label className="radio-item">
              <input 
                type="radio" 
                name="bgType" 
                value="solid" 
                checked={canvasBackground?.type === 'solid'}
                onChange={(e) => handleSetCanvasBackgroundClick({...canvasBackground, type: e.target.value})}
              />
              <span>纯色</span>
            </label>
            <label className="radio-item">
              <input 
                type="radio" 
                name="bgType" 
                value="gradient" 
                checked={canvasBackground?.type === 'gradient'}
                onChange={(e) => handleSetCanvasBackgroundClick({...canvasBackground, type: e.target.value})}
              />
              <span>渐变</span>
            </label>
            <label className="radio-item">
              <input 
                type="radio" 
                name="bgType" 
                value="image" 
                checked={canvasBackground?.type === 'image'}
                onChange={(e) => handleSetCanvasBackgroundClick({...canvasBackground, type: e.target.value})}
              />
              <span>图片</span>
            </label>
          </div>
        </div>

        {canvasBackground?.type === 'solid' && (
          <div className="form-group">
            <label className="form-label">背景色</label>
            <input
              className="form-input color-input"
              type="color"
              value={canvasBackground.color || '#ffffff'}
              onChange={(e) => handleSetCanvasBackgroundClick({...canvasBackground, color: e.target.value})}
            />
          </div>
        )}

        {canvasBackground?.type === 'gradient' && (
          <>
            <div className="form-group">
              <label className="form-label">起始颜色</label>
              <input
                className="form-input color-input"
                type="color"
                value={canvasBackground.gradientColors?.[0] || '#ffffff'}
                onChange={(e) => {
                  const newColors = [...(canvasBackground.gradientColors || ['#ffffff', '#f0f0f0'])];
                  newColors[0] = e.target.value;
                  handleSetCanvasBackgroundClick({...canvasBackground, gradientColors: newColors});
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">结束颜色</label>
              <input
                className="form-input color-input"
                type="color"
                value={canvasBackground.gradientColors?.[1] || '#f0f0f0'}
                onChange={(e) => {
                  const newColors = [...(canvasBackground.gradientColors || ['#ffffff', '#f0f0f0'])];
                  newColors[1] = e.target.value;
                  handleSetCanvasBackgroundClick({...canvasBackground, gradientColors: newColors});
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">渐变方向</label>
              <select 
                className="form-select"
                value={canvasBackground.gradientDirection || 'to bottom'}
                onChange={(e) => handleSetCanvasBackgroundClick({...canvasBackground, gradientDirection: e.target.value})}
              >
                <option value="to bottom">从上到下</option>
                <option value="to top">从下到上</option>
                <option value="to right">从左到右</option>
                <option value="to left">从右到左</option>
              </select>
            </div>
          </>
        )}

        {canvasBackground?.type === 'image' && (
          <>
            <div className="form-group">
              <label className="form-label">图片URL</label>
              <input
                className="form-input"
                type="url"
                placeholder="输入图片链接..."
                value={canvasBackground.imageUrl || ''}
                onChange={(e) => handleSetCanvasBackgroundClick({...canvasBackground, imageUrl: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">显示模式</label>
              <select 
                className="form-select"
                value={canvasBackground.imageMode || 'cover'}
                onChange={(e) => handleSetCanvasBackgroundClick({...canvasBackground, imageMode: e.target.value})}
              >
                <option value="cover">覆盖</option>
                <option value="contain">包含</option>
                <option value="repeat">重复</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;