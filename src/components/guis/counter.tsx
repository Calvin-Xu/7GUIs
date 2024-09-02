import { observer } from "mobx-react"
import FlexBox from "../flexbox"
import { makeAutoObservable } from "mobx"

class CounterStore {
    count = 0
    constructor() {
        makeAutoObservable(this)
    }

    get() {
        return this.count
    }

    set(count: number) {
        this.count = count
    }
}

const count = new CounterStore()

const Counter = observer(() => <FlexBox flexDirection="row" gap={20}>
    <div>Count: {count.get()}</div>
    <button onClick={() => count.set(count.get() + 1)}>Increment</button>
</FlexBox>)

export default Counter
