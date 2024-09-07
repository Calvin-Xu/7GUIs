import { observer } from "mobx-react"
import FlexBox from "../flexbox"
import { makeObservable, observable } from "mobx"

const CRUD = observer(() => <FlexBox flexDirection="column" gap={10}>
    <FlexBox flexDirection="row" gap={10}>
        <span>Filter prefix: </span> <input></input>
    </FlexBox>
    <FlexBox flexDirection="row" gap={10}>
        <select></select>
        <FlexBox flexDirection="column" gap={10}>
            <FlexBox flexDirection="row" gap={10}>
                <span>Name: </span> <input style={{ width: "50%", right: "0" }}></input>
            </FlexBox>
            <FlexBox flexDirection="row" gap={10}>
                <span>Surname: </span> <input style={{ width: "50%", right: "0" }}></input>
            </FlexBox>
        </FlexBox>
    </FlexBox>
</FlexBox>
)

export default CRUD