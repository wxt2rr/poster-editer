import React, { useRef, useState } from 'react';

const Toolbar = ({ 
  onAddText, 
  onAddImage,
  onExportImage,
  onExportPDF,
  onDelete, 
  onUndo, 
  onRedo, 
  onCopy, 
  onPaste, 
  onSaveProject, 
  onLoadProject,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onZoomToActual,
  onSetCanvasSize,
  onUpdateProjectSettings,
  onShowHelp,
  canUndo, 
  canRedo, 
  canPaste,
  selectedElementIds,
  canvasSize,
  projectSettings
}) => {
  const fileInputRef = useRef(null);
  const loadProjectInputRef = useRef(null);
  const [showProjectSettings, setShowProjectSettings] = useState(false);


  const handleAddText = () => {
    onAddText && onAddText();
  };

  const handleAddImageClick = () => {
    fileInputRef.current.click();
  };



  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onAddImage && onAddImage(files);
    }
  };

  const handleExportImage = (format, scale) => {
    onExportImage && onExportImage(format, scale);
  };

  const handleExportPDF = () => {
    onExportPDF && onExportPDF();
  };

  const handleDelete = () => {
    onDelete && onDelete();
  };

  const handleUndoClick = () => {
    onUndo && onUndo();
  };

  const handleRedoClick = () => {
    onRedo && onRedo();
  };
  
  const handleCopyClick = () => {
    onCopy && onCopy();
  };
  
  const handlePasteClick = () => {
    onPaste && onPaste();
  };
  
  const handleSaveProjectClick = () => {
    onSaveProject && onSaveProject();
  };
  
  const handleLoadProjectClick = () => {
    loadProjectInputRef.current.click();
  };
  
  const handleLoadProjectChange = (event) => {
    onLoadProject && onLoadProject(event);
  };
  
  const handleZoomInClick = () => {
    onZoomIn && onZoomIn();
  };
  
  const handleZoomOutClick = () => {
    onZoomOut && onZoomOut();
  };
  
  const handleZoomToFitClick = () => {
    onZoomToFit && onZoomToFit();
  };
  
  const handleZoomToActualClick = () => {
    onZoomToActual && onZoomToActual();
  };
  
  const handleSetCanvasSizeClick = (width, height) => {
    onSetCanvasSize && onSetCanvasSize(width, height);
  };
  
  const handleUpdateProjectSettingsClick = (settings) => {
    onUpdateProjectSettings && onUpdateProjectSettings(settings);
  };
  
  const handleShowHelpClick = () => {
    onShowHelp && onShowHelp();
  };
  


  // 预设画布尺寸
  const canvasPresets = {
    'A4': { width: 794, height: 1123 }, // A4纸张 (72 DPI)
    'A3': { width: 1123, height: 1587 }, // A3纸张 (72 DPI)
    '海报-小': { width: 600, height: 800 }, // 小海报
    '海报-中': { width: 800, height: 1200 }, // 中海报
    '海报-大': { width: 1200, height: 1800 }, // 大海报
    '方形-小': { width: 600, height: 600 }, // 小方形
    '方形-中': { width: 800, height: 800 }, // 中方形
    '横幅': { width: 1200, height: 400 }, // 横幅
    '社交媒体': { width: 1080, height: 1080 }, // Instagram正方形
    '手机壁纸': { width: 750, height: 1334 }, // iPhone 6/7/8
  };

  const handleCanvasPresetSelect = (presetName) => {
    const preset = canvasPresets[presetName];
    if (preset && onSetCanvasSize) {
      onSetCanvasSize(preset.width, preset.height);
    }
  };

  return (
    <div className="toolbar">
      {/* 左侧区域 - 工具名称 */}
      <div className="toolbar-section toolbar-left">
        <h2 className="toolbar-title">🎨 海报编辑器</h2>
      </div>
      
      {/* 中间区域 - 画布预设和主要操作 */}
      <div className="toolbar-section toolbar-center">
        <div className="canvas-preset-control">
          <label className="preset-label">画布预设:</label>
          <select 
            className="preset-select btn btn-ghost"
            onChange={(e) => e.target.value && handleCanvasPresetSelect(e.target.value)}
            defaultValue=""
          >
            <option value="">选择预设尺寸</option>
            {Object.keys(canvasPresets).map(preset => (
              <option key={preset} value={preset}>
                {preset} ({canvasPresets[preset].width}×{canvasPresets[preset].height})
              </option>
            ))}
          </select>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <button className="btn btn-ghost" onClick={handleDelete} disabled={!selectedElementIds || selectedElementIds.length === 0}>
          🗑️ 删除
        </button>
        <button className="btn btn-ghost" onClick={handleUndoClick} disabled={!canUndo}>
          ↶ 撤销
        </button>
        <button className="btn btn-ghost" onClick={handleRedoClick} disabled={!canRedo}>
          ↷ 重做
        </button>
        <button className="btn btn-ghost" onClick={handleCopyClick} disabled={!selectedElementIds || selectedElementIds.length === 0}>
          📋 复制
        </button>
        <button className="btn btn-ghost" onClick={handlePasteClick} disabled={!canPaste}>
          📄 粘贴
        </button>
      </div>

      {/* 右侧区域 - 项目管理和导出 */}
      <div className="toolbar-section toolbar-right">
        <button className="btn btn-ghost" onClick={handleSaveProjectClick}>
          💾 保存
        </button>
        <button className="btn btn-ghost" onClick={handleLoadProjectClick}>
          📂 加载
        </button>
        <button className="btn btn-ghost" onClick={() => setShowProjectSettings(true)}>
          ⚙️ 设置
        </button>
        
        <div className="toolbar-divider"></div>
        
        <div className="export-dropdown">
          <button className="btn btn-primary">📤 导出 ▼</button>
          <div className="export-dropdown-content">
            <button onClick={() => handleExportImage('png')}>导出为 PNG</button>
            <button onClick={() => handleExportImage('jpeg')}>导出为 JPEG</button>
            <button onClick={() => handleExportImage('png', 2)}>导出为高清 PNG (2x)</button>
            <button onClick={() => handleExportImage('png', 3)}>导出为高清 PNG (3x)</button>
            <button onClick={handleExportPDF}>导出为 PDF</button>
          </div>
        </div>
        
        <button className="btn btn-ghost" onClick={handleShowHelpClick}>
          ❓ 帮助
        </button>
      </div>
      
      {/* 隐藏的输入框 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />
      <input
        type="file"
        ref={loadProjectInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleLoadProjectChange}
      />

      
      {/* 项目设置弹窗 */}
      {showProjectSettings && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowProjectSettings(false)}>&times;</span>
            <h2>项目设置</h2>
            <label>
              项目名称:
              <input
                type="text"
                value={projectSettings.name}
                onChange={(e) => handleUpdateProjectSettingsClick({...projectSettings, name: e.target.value})}
              />
            </label>
            <br />
            <label>
              项目描述:
              <textarea
                value={projectSettings.description}
                onChange={(e) => handleUpdateProjectSettingsClick({...projectSettings, description: e.target.value})}
              />
            </label>
            <br />
            <label>
              作者:
              <input
                type="text"
                value={projectSettings.author}
                onChange={(e) => handleUpdateProjectSettingsClick({...projectSettings, author: e.target.value})}
              />
            </label>
            <br />
            <button onClick={() => setShowProjectSettings(false)}>关闭</button>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default Toolbar;