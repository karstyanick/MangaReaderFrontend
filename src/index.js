import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import "./App.css"

ReactDOM.render(
  <React.StrictMode>
    <App style={{"background-color":'black'}}/>
  </React.StrictMode>,
  document.getElementById('root')
);

document.body.style = 'background: #565656; margin: 0';
document.body.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }