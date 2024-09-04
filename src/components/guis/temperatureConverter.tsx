import { observer } from "mobx-react"
import FlexBox from "../flexbox"
import { makeAutoObservable } from "mobx"

class TemperatureConverterStore {
    celsius: number = NaN
    fahrenheit: number = NaN
    constructor() {
        makeAutoObservable(this)
    }

    onChangeCelsius = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.celsius = parseFloat(e.target.value)
        this.fahrenheit = this.celsius * (9 / 5) + 32
    }

    onChangeFahrenheit = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.fahrenheit = parseFloat(e.target.value)
        this.celsius = (this.fahrenheit - 32) * (5 / 9)
    }
}

const converter = new TemperatureConverterStore()

const TemperatureConverter = observer(() =>
    <FlexBox flexDirection="row" gap={10}>
        <input type="number" value={Number.isNaN(converter.celsius) ? "" : converter.celsius.toString()} onChange={converter.onChangeCelsius}></input>
        <span>°C</span>
        <span>=</span>
        <input type="number" value={Number.isNaN(converter.fahrenheit) ? "" : converter.fahrenheit.toString()} onChange={converter.onChangeFahrenheit}></input>
        <span>°F</span>
    </FlexBox>
)

export default TemperatureConverter