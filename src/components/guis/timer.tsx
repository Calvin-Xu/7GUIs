import { observer } from "mobx-react"
import FlexBox from "../flexbox"
import { makeObservable, observable } from "mobx"

const MAX = 20000 // ms

class TimerStore {

    elapsed = 0
    duration = 10000

    constructor() {
        makeObservable(this, {
            elapsed: observable,
            duration: observable,
        })

        setInterval(() => {
            this.elapsed = Math.min(this.elapsed + 100, MAX)
        }, 100)
    }

    reset() {
        this.elapsed = 0
    }

}

const timer = new TimerStore()

const Timer = observer(() => <FlexBox flexDirection="column" gap={10}>
    <FlexBox flexDirection="row" gap={20}>
        <span>Elapsed Time:</span>
        <meter value={timer.elapsed} min="0" max={timer.duration}></meter>
    </FlexBox>
    <span style={{ textAlign: "center" }}>{Math.min(timer.elapsed / 1000, timer.duration / 1000)}s</span>
    <FlexBox flexDirection="row" gap={20}>
        <span>Duration:</span>
        <input
            style={{ position: "relative", top: "0.1em" }}
            type="range" min="0" max={MAX}
            value={timer.duration}
            onChange={(e) => timer.duration = parseInt(e.target.value)}>
        </input>
    </FlexBox>
    <button onClick={() => timer.reset()}>Reset</button>
</FlexBox >)

export default Timer