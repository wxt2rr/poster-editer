import React, { useState, useRef, useEffect } from 'react';

const CanvasElement = ({ element, isSelected, onSelect, onUpdate, onMove, onStopMove }) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 缩放状态
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  
  // 旋转状态
  const [isRotating, setIsRotating] = useState(false);
  const [initialRotation, setInitialRotation] = useState(0);
  const [rotationCenter, setRotationCenter] = useState({ x: 0, y: 0 });
  
  // 文字编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content || '');

  const handleMouseDown = (e) => {
    // 如果元素被锁定，则不能进行任何操作
    if (element.locked) {
      e.stopPropagation();
      return;
    }
    
    e.stopPropagation();
    onSelect(element.id, e);
    
    // 检查是否点击了旋转手柄
    const targetClass = e.target.className;
    if (targetClass && targetClass.includes('rotate-handle')) {
      e.stopPropagation();
      setIsRotating(true);
      setInitialRotation(element.rotation || 0);
      
      // 计算旋转中心点 (元素中心)
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setRotationCenter({ x: centerX, y: centerY });
      return;
    }
    
    // 检查是否点击了控制点
    if (targetClass && targetClass.startsWith('resize-handle')) {
      e.stopPropagation();
      setIsResizing(true);
      setResizeDirection(targetClass.split(' ')[1]);
      setInitialSize({ width: element.width, height: element.height });
      setInitialPosition({ x: element.x, y: element.y });
      return;
    }
    
    // 检查是否是文字元素且双击
    if (element.type === 'text' && e.detail === 2) {
      setIsEditing(true);
      setEditContent(element.content || '');
      return;
    }
    
    const rect = elementRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    // 如果元素被锁定，则不能进行任何操作
    if (element.locked) {
      return;
    }
    
    if (isDragging) {
      const canvasRect = document.querySelector('.canvas-container').getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // 更新元素位置
      onUpdate(element.id, { x: newX, y: newY });
      
      // 触发移动事件，用于计算对齐线
      onMove && onMove({ ...element, x: newX, y: newY });
    } else if (isResizing) {
      const canvasRect = document.querySelector('.canvas-container').getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      let newX = initialPosition.x;
      let newY = initialPosition.y;
      
      // 根据不同的控制点计算新的尺寸和位置
      switch (resizeDirection) {
        case 'nw':
          newWidth = initialSize.width - (mouseX - initialPosition.x);
          newHeight = initialSize.height - (mouseY - initialPosition.y);
          newX = mouseX;
          newY = mouseY;
          break;
        case 'ne':
          newWidth = mouseX - initialPosition.x;
          newHeight = initialSize.height - (mouseY - initialPosition.y);
          newY = mouseY;
          break;
        case 'sw':
          newWidth = initialSize.width - (mouseX - initialPosition.x);
          newHeight = mouseY - initialPosition.y;
          newX = mouseX;
          break;
        case 'se':
          newWidth = mouseX - initialPosition.x;
          newHeight = mouseY - initialPosition.y;
          break;
        case 'n':
          newHeight = initialSize.height - (mouseY - initialPosition.y);
          newY = mouseY;
          break;
        case 's':
          newHeight = mouseY - initialPosition.y;
          break;
        case 'w':
          newWidth = initialSize.width - (mouseX - initialPosition.x);
          newX = mouseX;
          break;
        case 'e':
          newWidth = mouseX - initialPosition.x;
          break;
        default:
          break;
      }
      
      // 确保尺寸不为负数
      if (newWidth < 10) newWidth = 10;
      if (newHeight < 10) newHeight = 10;
      
      // 更新元素尺寸和位置
      onUpdate(element.id, { width: newWidth, height: newHeight, x: newX, y: newY });
    } else if (isRotating) {
      // 计算旋转角度
      const centerX = rotationCenter.x;
      const centerY = rotationCenter.y;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
      // 调整角度，使0度为正右方
      let newRotation = angle + 90;
      // 确保角度在0-360范围内
      if (newRotation < 0) newRotation += 360;
      
      // 更新元素旋转角度
      onUpdate(element.id, { rotation: newRotation });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    // 触发停止移动事件
    onStopMove && onStopMove();
  };
  
  // 处理文字编辑完成
  const handleEditComplete = () => {
    setIsEditing(false);
    onUpdate(element.id, { content: editContent });
  };
  
  // 处理文字编辑取消
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(element.content || '');
  };

  // 在 document 上监听 mousemove 和 mouseup 事件，以支持在画布外拖拽
  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
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
  }, [isDragging, isResizing, isRotating, dragOffset, resizeDirection, initialSize, initialPosition, initialRotation, rotationCenter]);

  // 计算变换样式
  const elementStyle = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    border: isSelected ? '2px dashed blue' : 'none',
    cursor: element.locked ? 'not-allowed' : 'move', // 锁定时改变光标
    userSelect: 'none', // 防止文本被选中
    transform: `rotate(${element.rotation || 0}deg)`,
    transformOrigin: 'center center',
    opacity: element.visible === false ? 0.5 : 1, // 隐藏时半透明
  };

  // 渲染控制点
  const renderResizeHandles = () => {
    // 如果元素被锁定或隐藏，则不显示控制点
    if (!isSelected || element.locked || element.visible === false) return null;
    
    const handles = [];
    const handleDirections = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    
    handleDirections.forEach(direction => {
      handles.push(
        <div
          key={direction}
          className={`resize-handle ${direction}`}
        />
      );
    });
    
    return handles;
  };
  
  // 渲染旋转手柄
  const renderRotateHandle = () => {
    // 如果元素被锁定或隐藏，则不显示旋转手柄
    if (!isSelected || element.locked || element.visible === false) return null;
    
    return (
      <div
        className="rotate-handle"
      />
    );
  };

  if (element.type === 'text') {
    if (isEditing) {
      return (
        <div
          ref={elementRef}
          style={{
            ...elementStyle,
            fontSize: element.fontSize,
            color: element.color,
            border: '1px solid blue',
            backgroundColor: 'white',
          }}
          onBlur={handleEditComplete}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleEditComplete();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              handleEditCancel();
            }
          }}
        >
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: element.fontSize,
              color: element.color,
              fontFamily: element.fontFamily || 'Arial, sans-serif',
              backgroundColor: 'transparent',
              overflow: 'hidden',
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              textDecoration: element.textDecoration || 'none',
              lineHeight: element.lineHeight || 1,
              letterSpacing: element.letterSpacing || 'normal',
              textAlign: element.textAlign || 'left',
            }}
          />
        </div>
      );
    } else {
      return (
        <div
          ref={elementRef}
          style={{
            ...elementStyle,
            fontSize: element.fontSize,
            color: element.color,
            fontFamily: element.fontFamily || 'Arial, sans-serif',
            fontWeight: element.fontWeight || 'normal',
            fontStyle: element.fontStyle || 'normal',
            textDecoration: element.textDecoration || 'none',
            lineHeight: element.lineHeight || 1,
            letterSpacing: element.letterSpacing !== undefined ? `${element.letterSpacing}px` : 'normal',
            textAlign: element.textAlign || 'left',
            display: element.visible === false ? 'none' : 'block', // 隐藏时完全隐藏
          }}
          onMouseDown={handleMouseDown}
        >
          {element.content}
          {renderResizeHandles()}
          {renderRotateHandle()}
        </div>
      );
    }
  } else if (element.type === 'image') {
    return (
      <div
        ref={elementRef}
        style={{
          ...elementStyle,
          display: element.visible === false ? 'none' : 'block', // 隐藏时完全隐藏
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          src={element.src}
          alt="Canvas Element"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: element.locked ? 0.7 : 1, // 锁定时半透明
          }}
        />
        {renderResizeHandles()}
        {renderRotateHandle()}
      </div>
    );
  } else if (element.type === 'rectangle') {
    return (
      <div
        ref={elementRef}
        style={{
          ...elementStyle,
          backgroundColor: element.fillColor || 'transparent',
          border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.strokeColor}` : 'none',
          opacity: (element.opacity || 1) * (element.locked ? 0.7 : 1),
          display: element.visible === false ? 'none' : 'block',
        }}
        onMouseDown={handleMouseDown}
      >
        {renderResizeHandles()}
        {renderRotateHandle()}
      </div>
    );
  } else if (element.type === 'circle') {
    return (
      <div
        ref={elementRef}
        style={{
          ...elementStyle,
          backgroundColor: element.fillColor || 'transparent',
          border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.strokeColor}` : 'none',
          borderRadius: '50%',
          opacity: (element.opacity || 1) * (element.locked ? 0.7 : 1),
          display: element.visible === false ? 'none' : 'block',
        }}
        onMouseDown={handleMouseDown}
      >
        {renderResizeHandles()}
        {renderRotateHandle()}
      </div>
    );
  } else if (element.type === 'line') {
    return (
      <div
        ref={elementRef}
        style={{
          ...elementStyle,
          backgroundColor: element.strokeColor || '#000000',
          opacity: (element.opacity || 1) * (element.locked ? 0.7 : 1),
          display: element.visible === false ? 'none' : 'block',
        }}
        onMouseDown={handleMouseDown}
      >
        {renderResizeHandles()}
        {renderRotateHandle()}
      </div>
    );
  } else if (element.type === 'triangle') {
    const triangleStyle = {
      width: 0,
      height: 0,
      borderLeft: `${element.width / 2}px solid transparent`,
      borderRight: `${element.width / 2}px solid transparent`,
      borderBottom: `${element.height}px solid ${element.fillColor || '#f39c12'}`,
      position: 'relative',
    };

    return (
      <div
        ref={elementRef}
        style={{
          ...elementStyle,
          opacity: (element.opacity || 1) * (element.locked ? 0.7 : 1),
          display: element.visible === false ? 'none' : 'block',
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={triangleStyle}></div>
        {renderResizeHandles()}
        {renderRotateHandle()}
      </div>
    );
  }

  return null;
};

export default CanvasElement;