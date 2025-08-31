import React, { useState, useRef } from 'react';
import CanvasElement from './CanvasElement';

const CanvasArea = ({ elements, selectedElementIds, onSelectElements, onUpdateElement, onDrop, zoom, canvasSize, canvasBackground }) => {
  const canvasRef = useRef(null);
  const [snapLines, setSnapLines] = useState({ vertical: [], horizontal: [] });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  // 生成画布背景样式
  const getCanvasBackgroundStyle = (bgConfig) => {
    if (!bgConfig) return '#ffffff';
    
    if (typeof bgConfig === 'string') {
      // 兼容旧的字符串格式
      return bgConfig;
    }
    
    switch (bgConfig.type) {
      case 'solid':
        return bgConfig.color || '#ffffff';
      case 'gradient':
        const direction = bgConfig.gradientDirection || 'to bottom';
        const colors = bgConfig.gradientColors || ['#ffffff', '#f0f0f0'];
        return `linear-gradient(${direction}, ${colors[0]}, ${colors[1]})`;
      case 'image':
        if (bgConfig.imageUrl) {
          const mode = bgConfig.imageMode || 'cover';
          return `url(${bgConfig.imageUrl}) center center / ${mode} no-repeat`;
        }
        return bgConfig.color || '#ffffff';
      default:
        return '#ffffff';
    }
  };

  // 画布容器引用
  const canvasContainerRef = (element) => {
    canvasRef.current = element;
  };

  // 处理画布鼠标按下事件，用于开始框选
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (zoom / 100);
      const y = (e.clientY - rect.top) / (zoom / 100);
      
      setStartPoint({ x, y });
      setSelectionBox({ x, y, width: 0, height: 0 });
      setIsSelecting(true);
      
      // 清除之前的选择
      onSelectElements([]);
    }
  };

  // 处理鼠标移动事件，用于更新框选区域
  const handleMouseMove = (e) => {
    if (isSelecting) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / (zoom / 100);
      const currentY = (e.clientY - rect.top) / (zoom / 100);
      
      const x = Math.min(startPoint.x, currentX);
      const y = Math.min(startPoint.y, currentY);
      const width = Math.abs(currentX - startPoint.x);
      const height = Math.abs(currentY - startPoint.y);
      
      setSelectionBox({ x, y, width, height });
    }
  };

  // 处理鼠标抬起事件，用于结束框选并选择元素
  const handleMouseUp = (e) => {
    if (isSelecting) {
      setIsSelecting(false);
      
      // 检查哪些元素在框选区域内
      const selectedIds = elements.filter(element => {
        return (
          element.x >= selectionBox.x &&
          element.x + element.width <= selectionBox.x + selectionBox.width &&
          element.y >= selectionBox.y &&
          element.y + element.height <= selectionBox.y + selectionBox.height
        );
      }).map(element => element.id);
      
      onSelectElements(selectedIds);
      setSelectionBox({ x: 0, y: 0, width: 0, height: 0 });
    }
  };

  // 在 document 上监听 mousemove 和 mouseup 事件，以支持在画布外拖拽
  React.useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, startPoint, selectionBox]);

  // 处理画布点击事件，用于取消选中元素或选中元素
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onSelectElements([]);
    }
  };

  // 计算对齐辅助线
  const calculateSnapLines = (movingElement, elements) => {
    const lines = { vertical: [], horizontal: [] };
    const threshold = 5; // 对齐阈值
    
    // 获取移动元素的边界
    const movingLeft = movingElement.x;
    const movingRight = movingElement.x + movingElement.width;
    const movingCenterX = movingElement.x + movingElement.width / 2;
    const movingTop = movingElement.y;
    const movingBottom = movingElement.y + movingElement.height;
    const movingCenterY = movingElement.y + movingElement.height / 2;
    
    // 遍历其他元素
    elements.forEach(element => {
      if (element.id === movingElement.id) return; // 跳过自身
      
      const left = element.x;
      const right = element.x + element.width;
      const centerX = element.x + element.width / 2;
      const top = element.y;
      const bottom = element.y + element.height;
      const centerY = element.y + element.height / 2;
      
      // 垂直对齐线
      if (Math.abs(movingLeft - left) < threshold) {
        lines.vertical.push({ x: left, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      if (Math.abs(movingLeft - right) < threshold) {
        lines.vertical.push({ x: right, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      if (Math.abs(movingLeft - centerX) < threshold) {
        lines.vertical.push({ x: centerX, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      
      if (Math.abs(movingRight - left) < threshold) {
        lines.vertical.push({ x: left, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      if (Math.abs(movingRight - right) < threshold) {
        lines.vertical.push({ x: right, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      if (Math.abs(movingRight - centerX) < threshold) {
        lines.vertical.push({ x: centerX, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      
      if (Math.abs(movingCenterX - left) < threshold) {
        lines.vertical.push({ x: left, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      if (Math.abs(movingCenterX - right) < threshold) {
        lines.vertical.push({ x: right, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      if (Math.abs(movingCenterX - centerX) < threshold) {
        lines.vertical.push({ x: centerX, y1: Math.min(movingTop, top), y2: Math.max(movingBottom, bottom) });
      }
      
      // 水平对齐线
      if (Math.abs(movingTop - top) < threshold) {
        lines.horizontal.push({ y: top, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
      if (Math.abs(movingTop - bottom) < threshold) {
        lines.horizontal.push({ y: bottom, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
      if (Math.abs(movingTop - centerY) < threshold) {
        lines.horizontal.push({ y: centerY, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
      
      if (Math.abs(movingBottom - top) < threshold) {
        lines.horizontal.push({ y: top, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
      if (Math.abs(movingBottom - bottom) < threshold) {
        lines.horizontal.push({ y: bottom, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
      if (Math.abs(movingBottom - centerY) < threshold) {
        lines.horizontal.push({ y: centerY, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
      
      if (Math.abs(movingCenterY - top) < threshold) {
        lines.horizontal.push({ y: top, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
      if (Math.abs(movingCenterY - bottom) < threshold) {
        lines.horizontal.push({ y: bottom, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
      if (Math.abs(movingCenterY - centerY) < threshold) {
        lines.horizontal.push({ y: centerY, x1: Math.min(movingLeft, left), x2: Math.max(movingRight, right) });
      }
    });
    
    // 对齐到画布边缘
    if (Math.abs(movingLeft - 0) < threshold) {
      lines.vertical.push({ x: 0, y1: movingTop, y2: movingBottom });
    }
    if (Math.abs(movingRight - canvasSize.width) < threshold) {
      lines.vertical.push({ x: canvasSize.width, y1: movingTop, y2: movingBottom });
    }
    if (Math.abs(movingCenterX - canvasSize.width / 2) < threshold) {
      lines.vertical.push({ x: canvasSize.width / 2, y1: movingTop, y2: movingBottom });
    }
    
    if (Math.abs(movingTop - 0) < threshold) {
      lines.horizontal.push({ y: 0, x1: movingLeft, x2: movingRight });
    }
    if (Math.abs(movingBottom - canvasSize.height) < threshold) {
      lines.horizontal.push({ y: canvasSize.height, x1: movingLeft, x2: movingRight });
    }
    if (Math.abs(movingCenterY - canvasSize.height / 2) < threshold) {
      lines.horizontal.push({ y: canvasSize.height / 2, x1: movingLeft, x2: movingRight });
    }
    
    return lines;
  };

  // 渲染对齐辅助线
  const renderSnapLines = () => {
    return (
      <>
        {snapLines.vertical.map((line, index) => (
          <div
            key={`v-${index}`}
            style={{
              position: 'absolute',
              left: line.x,
              top: line.y1,
              width: '1px',
              height: line.y2 - line.y1,
              backgroundColor: 'red',
              zIndex: 1000,
            }}
          />
        ))}
        {snapLines.horizontal.map((line, index) => (
          <div
            key={`h-${index}`}
            style={{
              position: 'absolute',
              left: line.x1,
              top: line.y,
              width: line.x2 - line.x1,
              height: '1px',
              backgroundColor: 'red',
              zIndex: 1000,
            }}
          />
        ))}
      </>
    );
  };
  
  // 渲染框选区域
  const renderSelectionBox = () => {
    if (!isSelecting || selectionBox.width === 0 || selectionBox.height === 0) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          left: selectionBox.x,
          top: selectionBox.y,
          width: selectionBox.width,
          height: selectionBox.height,
          border: '1px dashed blue',
          backgroundColor: 'rgba(0, 0, 255, 0.1)',
          zIndex: 999,
        }}
      />
    );
  };

  return (
    <div 
      className="canvas-area" 
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
    >
      <div
        className="canvas-container"
        ref={canvasContainerRef}
        style={{ 
          background: getCanvasBackgroundStyle(canvasBackground),
          transform: `scale(${zoom / 100})`,
          transformOrigin: '0 0',
          width: `${canvasSize.width * 100 / zoom}px`,
          height: `${canvasSize.height * 100 / zoom}px`,
        }}
      >
        {elements.map(element => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElementIds.includes(element.id)}
            onSelect={(id, e) => {
              // 如果按住 Ctrl 或 Shift 键，则切换选择状态
              if (e.ctrlKey || e.shiftKey) {
                if (selectedElementIds.includes(id)) {
                  onSelectElements(selectedElementIds.filter(selectedId => selectedId !== id));
                } else {
                  onSelectElements([...selectedElementIds, id]);
                }
              } else {
                onSelectElements([id]);
              }
            }}
            onUpdate={onUpdateElement}
            onMove={(movingElement) => {
              // 计算并设置对齐线
              const lines = calculateSnapLines(movingElement, elements);
              setSnapLines(lines);
            }}
            onStopMove={() => {
              // 移动停止时清除对齐线
              setSnapLines({ vertical: [], horizontal: [] });
            }}
          />
        ))}
        {renderSnapLines()}
        {renderSelectionBox()}
      </div>
    </div>
  );
};

export default CanvasArea;