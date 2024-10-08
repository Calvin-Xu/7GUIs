import { observer } from "mobx-react"
import FlexBox from "../flexbox"
import { action, makeObservable, observable } from "mobx"

const MAX = 20000 // ms

class TimerStore {

    elapsed = 0
    duration = 10000
    interval?: NodeJS.Timer

    constructor() {
        makeObservable(this, {
            elapsed: observable,
            duration: observable,
            reset: action
        })

        this.startTimer()
    }

    startTimer() {
        this.stopTimer()
        this.interval = setInterval(action(() => {
            this.elapsed += 100
            if (this.elapsed >= MAX) {
                this.stopTimer()
            }
        }), 100)
    }

    stopTimer() {
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = undefined
        }
    }

    reset() {
        this.elapsed = 0
        this.startTimer()
    }

}

const timer = new TimerStore()

const Timer = observer(() => <FlexBox flexDirection="column" gap={10}>
    <FlexBox flexDirection="row" alignItems="center" gap={20}>
        <span>Elapsed Time:</span>
        <meter value={timer.elapsed} style={{ position: "relative", top: "0.1em" }} min="0" max={timer.duration}></meter>
    </FlexBox>
    <span style={{ textAlign: "center" }}>{Math.min(timer.elapsed / 1000, timer.duration / 1000)}s</span>
    <FlexBox flexDirection="row" gap={20}>
        <span>Duration:</span>
        <input
            style={{ position: "relative", top: "0.1em" }}
            type="range" min="0" max={MAX}
            value={timer.duration}
            onChange={(e) => action(() => timer.duration = parseInt(e.target.value))()}>
        </input>
    </FlexBox>
    <button onClick={() => timer.reset()} style={{ minHeight: "2em" }}>Reset</button>
</FlexBox >)

export default Timer