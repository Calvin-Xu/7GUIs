import React from 'react'
import './App.css'
import Counter from "./components/guis/counter"
import Window from './components/window'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import TemperatureConverter from './components/guis/temperatureConverter'
import FlightBooker from './components/guis/flightBooker'
import Timer from './components/guis/timer'
import CRUD from './components/guis/crud'
import CircleDrawer from './components/guis/circleDrawer'
import Spreadsheet from './components/guis/spreadsheet'

class GuiStore {
  guis: { [key: string]: { component: JSX.Element, description: string, challenges: string, comments?: string, isVisible: boolean } }

  constructor() {
    makeAutoObservable(this)
    this.guis = {
      "Counter": {
        component: <Counter />,
        description: "Click button and number goes up",
        challenges: "basic ideas of language/toolkit",
        isVisible: true,
      },
      "Temperature Converter": {
        component: <TemperatureConverter />,
        description: "Celsius to Fahrenheit, and the other way around",
        challenges: "bidirectional data flow, user-provided text input",
        isVisible: true,
      },
      "Flight Booker": {
        component: <FlightBooker />,
        description: "Book a flight (default JavaScript date string parsing)",
        challenges: "constraints",
        isVisible: true,
      },
      "Timer": {
        component: <Timer />,
        description: "Timer with a duration slider to play with",
        challenges: "concurrency, competing user/signal interactions, responsiveness.",
        isVisible: true,
      },
      "CRUD": {
        component: <CRUD />,
        description: "A classic but satisfying CRUD interface",
        challenges: "separating the domain and presentation logic, managing mutation, sane selection focus when deleting and filtering",
        isVisible: true,
      },
      "Circle Drawer": {
        component: <CircleDrawer />,
        description: "Draw circles by clicking around; right click to adjust diameter",
        challenges: "undo/redo, custom drawing (canvas), dialog control",
        comments: "right click works if your browser is not protecting the contextual menu; if you are on mobile, I am sorry the spec is this way",
        isVisible: true,
      },
      "Spreadsheet": {
        component: <Spreadsheet />,
        description: "A fancier spreadsheet than per the original spec with formula support and intuitive UX (click or arrow key to change selection, enter or double click (or just start typing) to edit, esc to cancel and unselect, backspace to clear)",
        challenges: "change propagation, widget customization, implementing a more authentic/involved GUI application, lazy rendering & sparse storage, formula support, crafting user experience",
        comments: "supported formula example: =mean(B1:C5, C7:C12, sum(3.5, 7, E1), F1) <br/> prefix notation only for now; <a href='https://github.com/Calvin-Xu/7GUIs/blob/main/src/parser/parser.ts'>source</a>",
        isVisible: true,
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
      <h1 style={{ textAlign: "center" }}>7GUIs with React + MobX + TypeScript</h1>
      <p style={{ textAlign: "left", padding: "0 1em" }}>My concise & accurate implementation of <a href="https://eugenkiss.github.io/7guis/">7GUIs</a> at <a href="https://github.com/Calvin-Xu/7GUIs">Calvin-Xu/7GUIs</a>; no other packages pulled</p>
      {Object.entries(guiStore.guis).map(([name, gui]) => (
        gui.isVisible && (
          <div key={name} className="App-row">
            <div className="App-guis">
              <Window title={name} onClose={() => guiStore.toggleVisibility(name)}>
                {gui.component}
              </Window>
            </div>
            <div className="App-desc-container">
              <p className='App-desc'>{gui.description}</p>
              <p className='App-desc'><b>Challenges:</b> {gui.challenges}</p>
              {gui.comments && <p className='App-desc'><i dangerouslySetInnerHTML={{ __html: gui.comments }}></i></p>}
            </div>
          </div>
        )
      ))}
    </div>
  )
})

export default App
