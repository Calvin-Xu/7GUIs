import { observer } from "mobx-react"
import { observable } from "mobx"
import FlexBox from "../flexbox"

const count = observable.box(0)

const Counter = observer(() => <FlexBox flexDirection="row" gap={20}>
    <div>Count: {count.get()}</div>
    <button onClick={() => count.set(count.get() + 1)}>Increment</button>
</FlexBox>)

export default Counter