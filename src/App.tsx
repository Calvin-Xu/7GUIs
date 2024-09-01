import React from 'react';
import logo from './logo.svg';
import './App.css';
import Counter from "./components/guis/counter";
import Window from "./components/window";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Window title="Counter">
          <Counter />
        </Window>
      </header>
    </div>
  );
}

export default App;
