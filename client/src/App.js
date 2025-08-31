import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

// 主要的编辑器组件
import Editor from './components/Editor';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <Editor />
      </div>
    </DndProvider>
  );
}

export default App;