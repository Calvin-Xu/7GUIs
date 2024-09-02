import React from 'react'
import './App.css'
import Counter from "./components/guis/counter"
import Window from "./components/window"
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'

class GuiStore {
  guis: { [key: string]: { component: JSX.Element, description: string, isVisible: boolean } }

  constructor() {
    makeAutoObservable(this)
    this.guis = {
      "Counter": {
        component: <Counter />,
        description: "Click button and number goes up",
        isVisible: true
      },
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
      <p>Implementation of <a href="https://eugenkiss.github.io/7guis/">7GUIs</a>; source at <a href="https://github.com/Calvin-Xu/7GUIs">Calvin-Xu/7GUIs</a></p>
      <div className="App-guis">
        {Object.entries(guiStore.guis).map(([name, gui]) => {
          if (gui.isVisible) {
            return (
              <Window key={name} title={name} resizable={true} onClose={() => guiStore.toggleVisibility(name)}>
                {gui.component}
              </Window>
            )
          }
          return null
        })}
      </div>
    </div>
  )
})

export default App
