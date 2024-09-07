import React from 'react'
import './App.css'
import Counter from "./components/guis/counter"
import Window, { WindowStore } from "./components/window"
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import TemperatureConverter from './components/guis/temperatureConverter'
import FlightBooker from './components/guis/flightBooker'
import Timer from './components/guis/timer'

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
      "Temperature Converter": {
        component: <TemperatureConverter />,
        description: "Celsius to Fahrenheit, and the other way around",
        challenges: "bidirectional data flow, user-provided text input",
        isVisible: true,
        windowStore: new WindowStore()
      },
      "Flight Booker": {
        component: <FlightBooker />,
        description: "Book a flight (default JavaScript date string parsing)",
        challenges: "constraints",
        isVisible: true,
        windowStore: new WindowStore()
      },
      "Timer": {
        component: <Timer />,
        description: "Timer with a duration slider to play with",
        challenges: "concurrency, competing user/signal interactions, responsiveness.",
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
      <h1>7GUIs with React + MobX + TypeScript</h1>
      <p>My implementation of <a href="https://eugenkiss.github.io/7guis/">7GUIs</a> at <a href="https://github.com/Calvin-Xu/7GUIs">Calvin-Xu/7GUIs</a>; no other packages pulled</p>
      <br />
      {Object.entries(guiStore.guis).map(([name, gui]) => (
        gui.isVisible && (
          <div key={name}>
            <div className="App-guis">
              <Window title={name} resizable={true} onClose={() => guiStore.toggleVisibility(name)} windowStore={gui.windowStore}>
                {gui.component}
              </Window>
            </div>
            <div className="App-desc-container">
              <p className='App-desc'>{gui.description}</p>
              <p className='App-desc'><b>Challenges:</b> {gui.challenges}</p>
            </div>
          </div>
        )
      ))}
    </div>
  )
})

export default App
