import React from 'react'
import './App.css'
import Counter from "./components/guis/counter"
import Window, { WindowStore } from "./components/window"
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import TemperatureConverter from './components/guis/temperatureConverter'

class GuiStore {
  guis: { [key: string]: { component: JSX.Element, description: string, challenges: string, isVisible: boolean, windowStore: WindowStore } }

  constructor() {
    makeAutoObservable(this)
    this.guis = {
      "Counter": {
        component: <Counter />,
        description: "Click button and number goes up",
        challenges: "basic ideas of language/toolkit",
        isVisible: true,
        windowStore: new WindowStore()
      },
      "TemperatureConverter": {
        component: <TemperatureConverter />,
        description: "Celsius to Fahrenheit, and the other way around",
        challenges: "bidirectional data flow, user-provided text input",
        isVisible: true,
        windowStore: new WindowStore()
      }
    }
  }

  toggleVisibility(guiName: string) {
    if (this.guis[guiName]) {
      this.guis[guiName].isVisible = !this.guis[guiName].isVisible
    }
  }
}

const guiStore = new GuiStore()

const App: React.FC = observer(() => {
  return (
    <div className="App">
      <h1>7GUIs with React + MobX + Typescript</h1>
      <p>Implementation of <a href="https://eugenkiss.github.io/7guis/">7GUIs</a> at <a href="https://github.com/Calvin-Xu/7GUIs">Calvin-Xu/7GUIs</a></p>
      <br />
      <div className="App-guis">
        {Object.entries(guiStore.guis).map(([name, gui]) => {
          if (gui.isVisible) {
            return (
              <div key={name}>
                <div>
                  <Window title={name} resizable={true} onClose={() => guiStore.toggleVisibility(name)} windowStore={gui.windowStore}>
                    {gui.component}
                  </Window>
                </div>
                <br />
                <p className='App-desc'>{gui.description}</p>
                <span className='App-desc'><b>Challenges:</b> <span>{gui.challenges}</span></span>
              </div>
            )
          }
          return null
        })}
      </div>
    </div >
  )
})

export default App
