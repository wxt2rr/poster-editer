import React, { useState } from 'react';

const RightPanel = ({ selectedElements, onUpdateElement, elements, onReorderElements, onSelectElements }) => {
  const [showLayerPanel, setShowLayerPanel] = useState(true);

  // 图层列表组件
  const LayerPanel = () => (
    <div className="layer-panel">
      <h4 onClick={() => setShowLayerPanel(!showLayerPanel)} style={{cursor: 'pointer'}}>
        图层管理 {showLayerPanel ? '▼' : '▶'}
      </h4>
      {showLayerPanel && (
        <div className="layer-list" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px' }}>
          {elements.slice().reverse().map((element, index) => {
            const actualIndex = elements.length - 1 - index;
            const isSelected = selectedElements.some(sel => sel.id === element.id);
            return (
              <div 
                key={element.id}
                className={`layer-item ${isSelected ? 'selected' : ''}`}
                style={{
                  padding: '8px',
                  margin: '2px 0',
                  border: isSelected ? '2px solid #007acc' : '1px solid #ccc',
                  backgroundColor: isSelected ? '#e7f3ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => onSelectElements && onSelectElements([element.id])}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <span style={{ marginRight: '8px' }}>
                    {element.type === 'text' && '📝'}
                    {element.type === 'image' && '🖼️'}
                    {element.type === 'rectangle' && '📦'}
                    {element.type === 'circle' && '🔵'}
                    {element.type === 'triangle' && '🔺'}
                    {element.type === 'line' && '➖'}
                  </span>
                  <span style={{ 
                    opacity: element.visible === false ? 0.5 : 1,
                    textDecoration: element.locked ? 'line-through' : 'none'
                  }}>
                    {element.type === 'text' ? 
                      (element.content?.substring(0, 10) + (element.content?.length > 10 ? '...' : '')) : 
                      `${element.type} ${actualIndex + 1}`
                    }
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    style={{ fontSize: '10px', padding: '2px 4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement && onUpdateElement(element.id, { visible: !element.visible });
                    }}
                    title={element.visible === false ? '显示' : '隐藏'}
                  >
                    {element.visible === false ? '👁️' : '🙈'}
                  </button>
                  <button 
                    style={{ fontSize: '10px', padding: '2px 4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement && onUpdateElement(element.id, { locked: !element.locked });
                    }}
                    title={element.locked ? '解锁' : '锁定'}
                  >
                    {element.locked ? '🔒' : '🔓'}
                  </button>
                </div>
              </div>
            );
          })}
          {elements.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
              暂无图层
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (selectedElements.length === 0) {
    return (
      <div className="right-panel">
        <LayerPanel />
        <h3>属性面板</h3>
        <p>请选择一个元素以编辑其属性</p>
      </div>
    );
  }

  // 如果只选中了一个元素，则显示该元素的属性
  if (selectedElements.length === 1) {
    const element = selectedElements[0];
    
    const handlePropertyChange = (property, value) => {
      onUpdateElement && onUpdateElement(element.id, { [property]: value });
    };
    
    // 图层操作
    const handleMoveToTop = () => {
      onReorderElements && onReorderElements('top', element.id);
    };
    
    const handleMoveToBottom = () => {
      onReorderElements && onReorderElements('bottom', element.id);
    };
    
    const handleMoveUp = () => {
      onReorderElements && onReorderElements('up', element.id);
    };
    
    const handleMoveDown = () => {
      onReorderElements && onReorderElements('down', element.id);
    };
    
    // 锁定/解锁元素
    const handleToggleLock = () => {
      onUpdateElement && onUpdateElement(element.id, { locked: !element.locked });
    };
    
    // 隐藏/显示元素
    const handleToggleVisibility = () => {
      onUpdateElement && onUpdateElement(element.id, { visible: !element.visible });
    };

    return (
      <div className="right-panel">
        <LayerPanel />
        <h3>属性面板</h3>
        <div>
          <h4>元素类型: {element.type}</h4>
          {element.type === 'text' && (
            <>
              <label>
                文字内容:
                <input
                  type="text"
                  value={element.content || ''}
                  onChange={(e) => handlePropertyChange('content', e.target.value)}
                />
              </label>
              <br />
              {/* 字体选择 */}
              <label>
                字体:
                <select
                  value={element.fontFamily || 'Arial'}
                  onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Palatino">Palatino</option>
                    <option value="Garamond">Garamond</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Arial Black">Arial Black</option>
                  <option value="Impact">Impact</option>
                </select>
              </label>
              <br />
              <label>
                字体大小:
                <input
                  type="number"
                  value={element.fontSize || 16}
                  onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                />
              </label>
              <br />
              <label>
                颜色:
                <input
                  type="color"
                  value={element.color || '#000000'}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                />
              </label>
              <br />
              {/* 加粗/斜体/下划线 */}
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={element.fontWeight === 'bold'}
                    onChange={(e) => handlePropertyChange('fontWeight', e.target.checked ? 'bold' : 'normal')}
                  />
                  加粗
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={element.fontStyle === 'italic'}
                    onChange={(e) => handlePropertyChange('fontStyle', e.target.checked ? 'italic' : 'normal')}
                  />
                  斜体
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={element.textDecoration === 'underline'}
                    onChange={(e) => handlePropertyChange('textDecoration', e.target.checked ? 'underline' : 'none')}
                  />
                  下划线
                </label>
              </div>
              {/* 行间距/字间距 */}
              <label>
                行间距:
                <input
                  type="number"
                  step="0.1"
                  value={element.lineHeight || 1}
                  onChange={(e) => handlePropertyChange('lineHeight', parseFloat(e.target.value))}
                />
              </label>
              <br />
              <label>
                字间距:
                <input
                  type="number"
                  step="0.1"
                  value={element.letterSpacing || 0}
                  onChange={(e) => handlePropertyChange('letterSpacing', parseFloat(e.target.value))}
                />
              </label>
              <br />
              {/* 文本对齐 */}
              <div>
                <label>
                  <input
                    type="radio"
                    name="textAlign"
                    value="left"
                    checked={element.textAlign === 'left' || element.textAlign === undefined}
                    onChange={(e) => handlePropertyChange('textAlign', e.target.value)}
                  />
                  左对齐
                </label>
                <label>
                  <input
                    type="radio"
                    name="textAlign"
                    value="center"
                    checked={element.textAlign === 'center'}
                    onChange={(e) => handlePropertyChange('textAlign', e.target.value)}
                  />
                  居中对齐
                </label>
                <label>
                  <input
                    type="radio"
                    name="textAlign"
                    value="right"
                    checked={element.textAlign === 'right'}
                    onChange={(e) => handlePropertyChange('textAlign', e.target.value)}
                  />
                  右对齐
                </label>
              </div>
            </>
          )}
          {(element.type === 'rectangle' || element.type === 'circle' || element.type === 'triangle') && (
            <>
              <label>
                填充颜色:
                <input
                  type="color"
                  value={element.fillColor || '#3498db'}
                  onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
                />
              </label>
              <br />
              <label>
                边框颜色:
                <input
                  type="color"
                  value={element.strokeColor || '#2980b9'}
                  onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
                />
              </label>
              <br />
              <label>
                边框宽度:
                <input
                  type="number"
                  min="0"
                  value={element.strokeWidth || 2}
                  onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
                />
              </label>
              <br />
              <label>
                透明度:
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.opacity || 1}
                  onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                />
                <span>{Math.round((element.opacity || 1) * 100)}%</span>
              </label>
              <br />
            </>
          )}
          {element.type === 'line' && (
            <>
              <label>
                线条颜色:
                <input
                  type="color"
                  value={element.strokeColor || '#2c3e50'}
                  onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
                />
              </label>
              <br />
              <label>
                线条宽度:
                <input
                  type="number"
                  min="1"
                  value={element.strokeWidth || 3}
                  onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
                />
              </label>
              <br />
              <label>
                透明度:
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.opacity || 1}
                  onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                />
                <span>{Math.round((element.opacity || 1) * 100)}%</span>
              </label>
              <br />
            </>
          )}
          {/* 可以在这里添加更多针对不同类型元素的属性编辑 */}
          <div>
            <h4>位置和尺寸</h4>
            <label>
              X:
              <input
                type="number"
                value={element.x || 0}
                onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
              />
            </label>
            <br />
            <label>
              Y:
              <input
                type="number"
                value={element.y || 0}
                onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
              />
            </label>
            <br />
            <label>
              宽度:
              <input
                type="number"
                value={element.width || 0}
                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
              />
            </label>
            <br />
            <label>
              高度:
              <input
                type="number"
                value={element.height || 0}
                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
              />
            </label>
            <br />
            <label>
              旋转角度:
              <input
                type="number"
                value={element.rotation || 0}
                onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
              />
            </label>
          </div>
          
          <div>
            <h4>图层操作</h4>
            <button onClick={handleMoveToTop}>置顶</button>
            <button onClick={handleMoveUp}>上移</button>
            <button onClick={handleMoveDown}>下移</button>
            <button onClick={handleMoveToBottom}>置底</button>
            <br />
            <button onClick={handleToggleLock}>
              {element.locked ? '解锁' : '锁定'}
            </button>
            <button onClick={handleToggleVisibility}>
              {element.visible === false ? '显示' : '隐藏'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 如果选中了多个元素，则显示多选属性
  if (selectedElements.length > 1) {
    return (
      <div className="right-panel">
        <LayerPanel />
        <h3>属性面板</h3>
        <p>已选择 {selectedElements.length} 个元素</p>
        <div>
          <h4>批量操作</h4>
          {/* 可以在这里添加批量操作，例如对齐、分布等 */}
        </div>
      </div>
    );
  }

  return null;
};

export default RightPanel;