import React, { useState, useCallback } from 'react';
import jsPDF from 'jspdf';

// 引入各个功能区域组件
import Toolbar from './Toolbar';
import CanvasArea from './CanvasArea';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import BottomBar from './BottomBar';

// 引入样式
import './Editor.css';

const Editor = () => {
  const [elements, setElements] = useState([]);
  const [selectedElementIds, setSelectedElementIds] = useState([]); // 支持多选
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState([]); // 历史记录栈
  const [historyIndex, setHistoryIndex] = useState(-1); // 当前历史记录索引
  const [clipboard, setClipboard] = useState(null); // 剪贴板
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 }); // 画布尺寸
  const [projectSettings, setProjectSettings] = useState({ // 项目设置
    name: '未命名项目',
    description: '',
    author: '',
  });
  const [showHelp, setShowHelp] = useState(false); // 帮助系统
  const [canvasBackground, setCanvasBackground] = useState({
    type: 'solid', // 'solid', 'gradient', 'image'
    color: '#ffffff',
    gradientColors: ['#ffffff', '#f0f0f0'],
    gradientDirection: 'to bottom',
    imageUrl: null,
    imageMode: 'cover', // 'cover', 'contain', 'repeat'
  }); // 画布背景设置

  // 保存当前状态到历史记录
  const saveHistory = (newElements) => {
    // 如果当前索引不是历史记录的最后一个，则截断历史记录
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newElements));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // 添加文字元素
  const handleAddText = () => {
    const newElement = {
      id: Date.now().toString(),
      type: 'text',
      content: '双击编辑文字',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      fontSize: 16,
      color: '#000000',
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveHistory(newElements);
  };

  // 添加图片元素 (处理真实文件上传)
  const handleAddImage = (files) => {
    if (!files || files.length === 0) return;
    
    // 处理每个上传的文件
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // 创建图片元素以获取原始尺寸
          const img = new Image();
          img.onload = () => {
            // 计算适合画布的尺寸（保持宽高比）
            const maxWidth = 400;
            const maxHeight = 300;
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
              const scale = Math.min(maxWidth / width, maxHeight / height);
              width = width * scale;
              height = height * scale;
            }
            
            const newElement = {
              id: `${Date.now()}-${index}`,
              type: 'image',
              src: e.target.result, // 使用base64数据URL
              x: 100 + (index * 20), // 稍微偏移避免重叠
              y: 100 + (index * 20),
              width: Math.round(width),
              height: Math.round(height),
              originalFileName: file.name,
              fileSize: file.size,
            };
            
            const newElements = [...elements, newElement];
            setElements(newElements);
            saveHistory(newElements);
          };
          
          img.onerror = () => {
            console.error('Failed to load image:', file.name);
            alert(`无法加载图片: ${file.name}`);
          };
          
          img.src = e.target.result;
        };
        
        reader.onerror = () => {
          console.error('Failed to read file:', file.name);
          alert(`无法读取文件: ${file.name}`);
        };
        
        // 读取文件为base64数据URL
        reader.readAsDataURL(file);
      } else {
        alert(`文件 ${file.name} 不是有效的图片格式`);
      }
    });
  };

  // 添加矩形图形
  const handleAddRectangle = () => {
    const newElement = {
      id: Date.now().toString(),
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fillColor: '#3498db',
      strokeColor: '#2980b9',
      strokeWidth: 2,
      opacity: 1,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveHistory(newElements);
  };

  // 添加圆形图形
  const handleAddCircle = () => {
    const newElement = {
      id: Date.now().toString(),
      type: 'circle',
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      fillColor: '#e74c3c',
      strokeColor: '#c0392b',
      strokeWidth: 2,
      opacity: 1,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveHistory(newElements);
  };

  // 添加线条图形
  const handleAddLine = () => {
    const newElement = {
      id: Date.now().toString(),
      type: 'line',
      x: 100,
      y: 100,
      width: 200,
      height: 2,
      strokeColor: '#2c3e50',
      strokeWidth: 3,
      opacity: 1,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveHistory(newElements);
  };

  // 添加三角形图形
  const handleAddTriangle = () => {
    const newElement = {
      id: Date.now().toString(),
      type: 'triangle',
      x: 100,
      y: 100,
      width: 150,
      height: 130,
      fillColor: '#f39c12',
      strokeColor: '#e67e22',
      strokeWidth: 2,
      opacity: 1,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveHistory(newElements);
  };


  


  // 选中元素 (支持多选)
  const handleSelectElements = (ids) => {
    setSelectedElementIds(ids);
  };

  // 更新元素属性
  const handleUpdateElement = (id, properties) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...properties } : el
    );
    setElements(newElements);
    // 更新历史记录
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newElements));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // 图层重新排序
  const handleReorderElements = (action, elementId) => {
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) return;
    
    const newElements = [...elements];
    const element = newElements[elementIndex];
    
    switch (action) {
      case 'top':
        newElements.splice(elementIndex, 1);
        newElements.push(element);
        break;
      case 'bottom':
        newElements.splice(elementIndex, 1);
        newElements.unshift(element);
        break;
      case 'up':
        if (elementIndex < newElements.length - 1) {
          [newElements[elementIndex], newElements[elementIndex + 1]] = [newElements[elementIndex + 1], newElements[elementIndex]];
        }
        break;
      case 'down':
        if (elementIndex > 0) {
          [newElements[elementIndex], newElements[elementIndex - 1]] = [newElements[elementIndex - 1], newElements[elementIndex]];
        }
        break;
      default:
        break;
    }
    
    setElements(newElements);
    saveHistory(newElements);
  };

  // 删除选中的元素
  const handleDeleteElement = useCallback(() => {
    if (selectedElementIds.length > 0) {
      const newElements = elements.filter(el => !selectedElementIds.includes(el.id));
      setElements(newElements);
      setSelectedElementIds([]);
      saveHistory(newElements);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElementIds, elements]);
  
  // 复制选中的元素
  const handleCopyElement = useCallback(() => {
    if (selectedElementIds.length > 0) {
      const elementsToCopy = elements.filter(el => selectedElementIds.includes(el.id));
      setClipboard(elementsToCopy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElementIds, elements]);
  
  // 粘贴元素
  const handlePasteElement = () => {
    if (clipboard && clipboard.length > 0) {
      const newElements = clipboard.map(el => ({
        ...el,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // 生成新的ID
        x: el.x + 20, // 简单偏移
        y: el.y + 20,
      }));
      const updatedElements = [...elements, ...newElements];
      setElements(updatedElements);
      setSelectedElementIds(newElements.map(el => el.id)); // 选中粘贴的元素
      saveHistory(updatedElements);
    }
  };

  // 撤销操作
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = JSON.parse(history[historyIndex - 1]);
      setElements(prevState);
      setHistoryIndex(historyIndex - 1);
      // 如果撤销后没有选中的元素，则取消选中
      if (!prevState.find(el => selectedElementIds.includes(el.id))) {
        setSelectedElementIds([]);
      }
    }
  };

  // 重做操作
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = JSON.parse(history[historyIndex + 1]);
      setElements(nextState);
      setHistoryIndex(historyIndex + 1);
      // 如果重做后没有选中的元素，则取消选中
      if (!nextState.find(el => selectedElementIds.includes(el.id))) {
        setSelectedElementIds([]);
      }
    }
  };
  
  // 缩放操作
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 10, 50));
  };
  
  const handleZoomToFit = () => {
    // 这里可以实现适应屏幕的逻辑，暂时设置为100%
    setZoom(100);
  };
  
  const handleZoomToActual = () => {
    // 实际大小
    setZoom(100);
  };
  
  // 设置画布尺寸
  const handleSetCanvasSize = (width, height) => {
    setCanvasSize({ width, height });
    // 重置画布元素
    setElements([]);
    setSelectedElementIds([]);
    // 重置历史记录
    setHistory([]);
    setHistoryIndex(-1);
  };
  
  // 更新项目设置
  const handleUpdateProjectSettings = (settings) => {
    setProjectSettings(settings);
  };
  
  // 显示帮助
  const handleShowHelp = () => {
    setShowHelp(true);
  };
  
  // 设置画布背景
  const handleSetCanvasBackground = (backgroundConfig) => {
    setCanvasBackground(backgroundConfig);
  };

  // 导出为图片 (优化版本)
  const handleExportImage = (format = 'png', scale = 1) => {
    const canvasContainer = document.querySelector('.canvas-container');
    if (canvasContainer) {
      // 使用画布的实际尺寸进行导出
      const exportWidth = canvasSize.width * scale;
      const exportHeight = canvasSize.height * scale;
      
      // 创建一个临时的 canvas 元素
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = exportWidth;
      tempCanvas.height = exportHeight;
      const ctx = tempCanvas.getContext('2d');
      
      // 设置背景
      if (canvasBackground.type === 'solid') {
        ctx.fillStyle = canvasBackground.color;
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      } else if (canvasBackground.type === 'gradient') {
        // 创建渐变
        let gradient;
        if (canvasBackground.gradientDirection === 'to bottom') {
          gradient = ctx.createLinearGradient(0, 0, 0, exportHeight);
        } else if (canvasBackground.gradientDirection === 'to right') {
          gradient = ctx.createLinearGradient(0, 0, exportWidth, 0);
        } else if (canvasBackground.gradientDirection === 'to top') {
          gradient = ctx.createLinearGradient(0, exportHeight, 0, 0);
        } else if (canvasBackground.gradientDirection === 'to left') {
          gradient = ctx.createLinearGradient(exportWidth, 0, 0, 0);
        } else {
          gradient = ctx.createLinearGradient(0, 0, 0, exportHeight);
        }
        gradient.addColorStop(0, canvasBackground.gradientColors[0]);
        gradient.addColorStop(1, canvasBackground.gradientColors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      } else if (canvasBackground.type === 'image' && canvasBackground.imageUrl) {
        // 背景图片在画布上渲染比较复杂，这里使用简单的纯色替代
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      }
      
      // 绘制所有元素
      const drawElement = (element) => {
        return new Promise((resolve) => {
          if (element.type === 'text') {
            ctx.save();
            ctx.translate(element.x * scale, element.y * scale);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            
            ctx.font = `${element.fontSize * scale}px Arial`;
            ctx.fillStyle = element.color;
            ctx.textBaseline = 'top';
            ctx.fillText(element.content, 0, 0);
            
            ctx.restore();
            resolve();
          } else if (element.type === 'rectangle') {
            ctx.save();
            ctx.translate(element.x * scale, element.y * scale);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            ctx.globalAlpha = element.opacity || 1;
            
            // 绘制填充
            if (element.fillColor) {
              ctx.fillStyle = element.fillColor;
              ctx.fillRect(0, 0, element.width * scale, element.height * scale);
            }
            
            // 绘制边框
            if (element.strokeColor && element.strokeWidth > 0) {
              ctx.strokeStyle = element.strokeColor;
              ctx.lineWidth = element.strokeWidth * scale;
              ctx.strokeRect(0, 0, element.width * scale, element.height * scale);
            }
            
            ctx.restore();
            resolve();
          } else if (element.type === 'circle') {
            ctx.save();
            ctx.translate((element.x + element.width/2) * scale, (element.y + element.height/2) * scale);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            ctx.globalAlpha = element.opacity || 1;
            
            const radiusX = (element.width / 2) * scale;
            const radiusY = (element.height / 2) * scale;
            
            ctx.beginPath();
            ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
            
            // 绘制填充
            if (element.fillColor) {
              ctx.fillStyle = element.fillColor;
              ctx.fill();
            }
            
            // 绘制边框
            if (element.strokeColor && element.strokeWidth > 0) {
              ctx.strokeStyle = element.strokeColor;
              ctx.lineWidth = element.strokeWidth * scale;
              ctx.stroke();
            }
            
            ctx.restore();
            resolve();
          } else if (element.type === 'line') {
            ctx.save();
            ctx.translate(element.x * scale, element.y * scale);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            ctx.globalAlpha = element.opacity || 1;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(element.width * scale, 0);
            ctx.strokeStyle = element.strokeColor;
            ctx.lineWidth = element.strokeWidth * scale;
            ctx.stroke();
            
            ctx.restore();
            resolve();
          } else if (element.type === 'triangle') {
            ctx.save();
            ctx.translate(element.x * scale, element.y * scale);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            ctx.globalAlpha = element.opacity || 1;
            
            const width = element.width * scale;
            const height = element.height * scale;
            
            ctx.beginPath();
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(0, height);
            ctx.lineTo(width, height);
            ctx.closePath();
            
            // 绘制填充
            if (element.fillColor) {
              ctx.fillStyle = element.fillColor;
              ctx.fill();
            }
            
            // 绘制边框
            if (element.strokeColor && element.strokeWidth > 0) {
              ctx.strokeStyle = element.strokeColor;
              ctx.lineWidth = element.strokeWidth * scale;
              ctx.stroke();
            }
            
            ctx.restore();
            resolve();
          } else if (element.type === 'image') {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // 处理跨域图片
            img.onload = () => {
              ctx.save();
              ctx.translate(element.x * scale, element.y * scale);
              ctx.rotate((element.rotation || 0) * Math.PI / 180);
              
              // 计算缩放比例以适应元素尺寸
              const scaleX = (element.width * scale) / img.width;
              const scaleY = (element.height * scale) / img.height;
              
              ctx.scale(scaleX, scaleY);
              ctx.drawImage(img, 0, 0);
              
              ctx.restore();
              resolve();
            };
            img.onerror = () => {
              // 如果图片加载失败，绘制一个占位符
              ctx.save();
              ctx.translate(element.x * scale, element.y * scale);
              ctx.rotate((element.rotation || 0) * Math.PI / 180);
              
              ctx.fillStyle = '#cccccc';
              ctx.fillRect(0, 0, element.width * scale, element.height * scale);
              ctx.fillStyle = '#666666';
              ctx.font = `${12 * scale}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('Image not found', (element.width * scale) / 2, (element.height * scale) / 2);
              
              ctx.restore();
              resolve();
            };
            img.src = element.src;
          } else {
            resolve();
          }
        });
      };
      
      // 绘制所有元素
      Promise.all(elements.map(drawElement)).then(() => {
        // 将 canvas 转换为图片并下载
        const link = document.createElement('a');
        link.download = `poster.${format}`;
        link.href = tempCanvas.toDataURL(`image/${format}`);
        link.click();
      });
    }
  };
  
  // 导出为 PDF
  const handleExportPDF = () => {
    const canvasContainer = document.querySelector('.canvas-container');
    if (canvasContainer) {
      // 使用画布的实际尺寸进行导出
      const exportWidth = canvasSize.width;
      const exportHeight = canvasSize.height;
      
      // 创建一个临时的 canvas 元素
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = exportWidth;
      tempCanvas.height = exportHeight;
      const ctx = tempCanvas.getContext('2d');
      
      // 设置背景
      if (canvasBackground.type === 'solid') {
        ctx.fillStyle = canvasBackground.color;
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      } else if (canvasBackground.type === 'gradient') {
        // 创建渐变
        let gradient;
        if (canvasBackground.gradientDirection === 'to bottom') {
          gradient = ctx.createLinearGradient(0, 0, 0, exportHeight);
        } else if (canvasBackground.gradientDirection === 'to right') {
          gradient = ctx.createLinearGradient(0, 0, exportWidth, 0);
        } else if (canvasBackground.gradientDirection === 'to top') {
          gradient = ctx.createLinearGradient(0, exportHeight, 0, 0);
        } else if (canvasBackground.gradientDirection === 'to left') {
          gradient = ctx.createLinearGradient(exportWidth, 0, 0, 0);
        } else {
          gradient = ctx.createLinearGradient(0, 0, 0, exportHeight);
        }
        gradient.addColorStop(0, canvasBackground.gradientColors[0]);
        gradient.addColorStop(1, canvasBackground.gradientColors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      } else if (canvasBackground.type === 'image' && canvasBackground.imageUrl) {
        // 背景图片在画布上渲染比较复杂，这里使用简单的纯色替代
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      }
      
      // 绘制所有元素
      const drawElement = (element) => {
        return new Promise((resolve) => {
          if (element.type === 'text') {
            ctx.save();
            ctx.translate(element.x, element.y);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            
            ctx.font = `${element.fontSize}px Arial`;
            ctx.fillStyle = element.color;
            ctx.textBaseline = 'top';
            ctx.fillText(element.content, 0, 0);
            
            ctx.restore();
            resolve();
          } else if (element.type === 'rectangle') {
            ctx.save();
            ctx.translate(element.x, element.y);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            ctx.globalAlpha = element.opacity || 1;
            
            // 绘制填充
            if (element.fillColor) {
              ctx.fillStyle = element.fillColor;
              ctx.fillRect(0, 0, element.width, element.height);
            }
            
            // 绘制边框
            if (element.strokeColor && element.strokeWidth > 0) {
              ctx.strokeStyle = element.strokeColor;
              ctx.lineWidth = element.strokeWidth;
              ctx.strokeRect(0, 0, element.width, element.height);
            }
            
            ctx.restore();
            resolve();
          } else if (element.type === 'circle') {
            ctx.save();
            ctx.translate(element.x + element.width/2, element.y + element.height/2);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            ctx.globalAlpha = element.opacity || 1;
            
            const radiusX = element.width / 2;
            const radiusY = element.height / 2;
            
            ctx.beginPath();
            ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
            
            // 绘制填充
            if (element.fillColor) {
              ctx.fillStyle = element.fillColor;
              ctx.fill();
            }
            
            // 绘制边框
            if (element.strokeColor && element.strokeWidth > 0) {
              ctx.strokeStyle = element.strokeColor;
              ctx.lineWidth = element.strokeWidth;
              ctx.stroke();
            }
            
            ctx.restore();
            resolve();
          } else if (element.type === 'line') {
            ctx.save();
            ctx.translate(element.x, element.y);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            ctx.globalAlpha = element.opacity || 1;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(element.width, 0);
            ctx.strokeStyle = element.strokeColor;
            ctx.lineWidth = element.strokeWidth;
            ctx.stroke();
            
            ctx.restore();
            resolve();
          } else if (element.type === 'triangle') {
            ctx.save();
            ctx.translate(element.x, element.y);
            ctx.rotate((element.rotation || 0) * Math.PI / 180);
            ctx.globalAlpha = element.opacity || 1;
            
            const width = element.width;
            const height = element.height;
            
            ctx.beginPath();
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(0, height);
            ctx.lineTo(width, height);
            ctx.closePath();
            
            // 绘制填充
            if (element.fillColor) {
              ctx.fillStyle = element.fillColor;
              ctx.fill();
            }
            
            // 绘制边框
            if (element.strokeColor && element.strokeWidth > 0) {
              ctx.strokeStyle = element.strokeColor;
              ctx.lineWidth = element.strokeWidth;
              ctx.stroke();
            }
            
            ctx.restore();
            resolve();
          } else if (element.type === 'image') {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // 处理跨域图片
            img.onload = () => {
              ctx.save();
              ctx.translate(element.x, element.y);
              ctx.rotate((element.rotation || 0) * Math.PI / 180);
              
              // 计算缩放比例以适应元素尺寸
              const scaleX = element.width / img.width;
              const scaleY = element.height / img.height;
              
              ctx.scale(scaleX, scaleY);
              ctx.drawImage(img, 0, 0);
              
              ctx.restore();
              resolve();
            };
            img.onerror = () => {
              // 如果图片加载失败，绘制一个占位符
              ctx.save();
              ctx.translate(element.x, element.y);
              ctx.rotate((element.rotation || 0) * Math.PI / 180);
              
              ctx.fillStyle = '#cccccc';
              ctx.fillRect(0, 0, element.width, element.height);
              ctx.fillStyle = '#666666';
              ctx.font = '12px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('Image not found', element.width / 2, element.height / 2);
              
              ctx.restore();
              resolve();
            };
            img.src = element.src;
          } else {
            resolve();
          }
        });
      };
      
      // 绘制所有元素
      Promise.all(elements.map(drawElement)).then(() => {
        // 创建 PDF
        const pdf = new jsPDF({
          orientation: exportWidth > exportHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [exportWidth, exportHeight]
        });
        
        // 将 canvas 添加到 PDF
        const imgData = tempCanvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, exportWidth, exportHeight);
        
        // 下载 PDF
        pdf.save('poster.pdf');
      });
    }
  };
  
  // 保存项目
  const handleSaveProject = () => {
    const projectData = {
      elements: elements,
      canvas: { ...canvasSize, background: canvasBackground }, // 包含画布背景设置
      settings: projectSettings // 包含项目设置
    };
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'poster-project.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // 加载项目
  const handleLoadProject = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          setElements(projectData.elements || []);
          setCanvasSize(projectData.canvas ? { width: projectData.canvas.width, height: projectData.canvas.height } : { width: 800, height: 600 });
          // 加载画布背景设置（兼容旧格式）
          const bgData = projectData.canvas?.background;
          if (typeof bgData === 'string') {
            // 兼容旧的字符串格式
            setCanvasBackground({
              type: 'solid',
              color: bgData,
              gradientColors: ['#ffffff', '#f0f0f0'],
              gradientDirection: 'to bottom',
              imageUrl: null,
              imageMode: 'cover',
            });
          } else if (bgData && typeof bgData === 'object') {
            // 新的对象格式
            setCanvasBackground(bgData);
          } else {
            // 默认背景
            setCanvasBackground({
              type: 'solid',
              color: '#ffffff',
              gradientColors: ['#ffffff', '#f0f0f0'],
              gradientDirection: 'to bottom',
              imageUrl: null,
              imageMode: 'cover',
            });
          }
          setProjectSettings(projectData.settings || { name: '未命名项目', description: '', author: '' }); // 加载项目设置
          // 保存到历史记录
          const newHistory = [JSON.stringify(projectData.elements || [])];
          setHistory(newHistory);
          setHistoryIndex(0);
          setSelectedElementIds([]);
        } catch (error) {
          console.error('Failed to parse project file:', error);
          alert('Failed to load project file. It may be corrupted.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid JSON file.');
    }
    // 清空input value，以便可以重复选择同一个文件
    event.target.value = null;
  };

  // 获取选中的元素
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

  // 处理键盘事件
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // 阻止浏览器默认的快捷键行为
      if (e.ctrlKey && ['z', 'y', 'c', 'v', 's'].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === 'Delete') {
        handleDeleteElement();
      } else if (e.ctrlKey && e.key === 'z') {
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        handleRedo();
      } else if (e.ctrlKey && e.key === 'c') {
        handleCopyElement();
      } else if (e.ctrlKey && e.key === 'v') {
        handlePasteElement();
      } else if (e.ctrlKey && e.key === 's') {
        handleSaveProject();
      } else if (e.key === 'ArrowUp') {
        // 微调位置 - 上移
        if (selectedElementIds.length > 0) {
          const newElements = elements.map(el => 
            selectedElementIds.includes(el.id) ? { ...el, y: el.y - 1 } : el
          );
          setElements(newElements);
          saveHistory(newElements);
        }
      } else if (e.key === 'ArrowDown') {
        // 微调位置 - 下移
        if (selectedElementIds.length > 0) {
          const newElements = elements.map(el => 
            selectedElementIds.includes(el.id) ? { ...el, y: el.y + 1 } : el
          );
          setElements(newElements);
          saveHistory(newElements);
        }
      } else if (e.key === 'ArrowLeft') {
        // 微调位置 - 左移
        if (selectedElementIds.length > 0) {
          const newElements = elements.map(el => 
            selectedElementIds.includes(el.id) ? { ...el, x: el.x - 1 } : el
          );
          setElements(newElements);
          saveHistory(newElements);
        }
      } else if (e.key === 'ArrowRight') {
        // 微调位置 - 右移
        if (selectedElementIds.length > 0) {
          const newElements = elements.map(el => 
            selectedElementIds.includes(el.id) ? { ...el, x: el.x + 1 } : el
          );
          setElements(newElements);
          saveHistory(newElements);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElementIds, historyIndex, clipboard, elements]);

  return (
    <div className="editor">
      {/* 顶部工具栏 */}
      <Toolbar
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onExportImage={handleExportImage}
        onExportPDF={handleExportPDF}
        onDelete={handleDeleteElement}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCopy={handleCopyElement}
        onPaste={handlePasteElement}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomToFit={handleZoomToFit}
        onZoomToActual={handleZoomToActual}
        onSetCanvasSize={handleSetCanvasSize}
        onUpdateProjectSettings={handleUpdateProjectSettings}
        onShowHelp={handleShowHelp}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        canPaste={!!clipboard}
        selectedElementIds={selectedElementIds}
        canvasSize={canvasSize}
        projectSettings={projectSettings}
      />
      
      {/* 主内容区 */}
      <div className="editor-main">
        {/* 左侧面板 */}
        <LeftPanel 
          onAddText={handleAddText}
          onAddImage={handleAddImage}
          onAddRectangle={handleAddRectangle}
          onAddCircle={handleAddCircle}
          onAddTriangle={handleAddTriangle}
          onAddLine={handleAddLine}
          onSetCanvasBackground={handleSetCanvasBackground}
          canvasBackground={canvasBackground}
        />
        
        {/* 中间画布区域 */}
        <CanvasArea
          elements={elements}
          selectedElementIds={selectedElementIds}
          onSelectElements={handleSelectElements}
          onUpdateElement={handleUpdateElement}
          zoom={zoom}
          canvasSize={canvasSize}
          canvasBackground={canvasBackground}
        />
        
        {/* 右侧面板 */}
        <RightPanel
          selectedElements={selectedElements}
          onUpdateElement={handleUpdateElement}
          elements={elements}
          onReorderElements={handleReorderElements}
          onSelectElements={handleSelectElements}
        />
      </div>
      
      {/* 底部状态栏 */}
      <BottomBar 
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomToFit={handleZoomToFit}
        onZoomToActual={handleZoomToActual}
        elementCount={elements.length}
        selectedCount={selectedElementIds.length}
        canvasSize={canvasSize}
      />
      
      {/* 帮助系统 */}
      {showHelp && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowHelp(false)}>&times;</span>
            <h2>帮助</h2>
            <ul>
              <li><strong>添加文字:</strong> 点击工具栏的"添加文字"按钮。</li>
              <li><strong>添加图片:</strong> 点击工具栏的"添加图片"按钮，或直接将图片拖拽到画布上。</li>
              <li><strong>编辑文字:</strong> 双击文字元素进入编辑模式。</li>
              <li><strong>移动元素:</strong> 点击并拖拽元素。</li>
              <li><strong>缩放元素:</strong> 选中元素后，拖拽角落或边缘的控制点。</li>
              <li><strong>旋转元素:</strong> 选中元素后，拖拽元素上方的旋转手柄。</li>
              <li><strong>删除元素:</strong> 选中元素后，按 Delete 键或点击工具栏的"删除"按钮。</li>
              <li><strong>复制/粘贴元素:</strong> 选中元素后，按 Ctrl+C 复制，按 Ctrl+V 粘贴。</li>
              <li><strong>撤销/重做:</strong> 按 Ctrl+Z 撤销，按 Ctrl+Y 重做。</li>
              <li><strong>缩放画布:</strong> 使用工具栏的缩放按钮或滚动鼠标滚轮。</li>
              <li><strong>导出:</strong> 点击工具栏的"导出"按钮，选择导出格式。</li>
              <li><strong>保存/加载项目:</strong> 点击工具栏的"保存项目"/"加载项目"按钮。</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;