import { observer } from "mobx-react"
import FlexBox from "../flexbox"
import { observable, computed, makeObservable, action } from "mobx"

const getDateTimeString = (date: Date) => {
    return date.toISOString().split('T')[0]
    // TODO: UTC, but I don't want to deal with it or pull a package
}

class FlightBookerStore {

    bookingType: "one-way" | "return" = "one-way"

    startDateString = getDateTimeString(new Date())
    endDateString = this.startDateString

    constructor() {
        makeObservable(this, {
            bookingType: observable,
            startDate: computed,
            endDate: computed,
            startDateString: observable,
            endDateString: observable,
            startDateValid: computed,
            endDateValid: computed,
            setBookingType: action,
            setStartDateString: action,
            setEndDateString: action
        })
    }

    lastValidStart = new Date()
    lastValidEnd = new Date()

    get startDate() {
        const date = new Date(this.startDateString)
        if (!isNaN(date.getTime())) {
            this.lastValidStart = date
            return date
        } else {
            return this.lastValidStart
        }
    }

    get endDate() {
        const date = new Date(this.endDateString)
        if (!isNaN(date.getTime())) {
            this.lastValidEnd = date
            return date
        } else {
            return this.lastValidEnd
        }
    }

    get startDateValid() {
        const date = new Date(this.startDateString)
        return !isNaN(date.getTime())
    }

    get endDateValid() {
        const date = new Date(this.endDateString)
        return !isNaN(date.getTime()) && date >= this.startDate
    }

    setBookingType(type: "one-way" | "return") {
        this.bookingType = type
    }

    setStartDateString(date: string) {
        this.startDateString = date
    }

    setEndDateString(date: string) {
        this.endDateString = date
    }
}

const flightBooker = new FlightBookerStore()

const FlightBooker = observer(() => {
    const handleBook = () => {
        switch (flightBooker.bookingType) {
            case "one-way":
                return alert("You have booked a one-way flight on " + getDateTimeString(flightBooker.startDate))
            case "return":
                return alert("You have booked flights departing " + getDateTimeString(flightBooker.startDate) + " and returning " + getDateTimeString(flightBooker.endDate))
            default:
                return alert("Unexpected booking type")
        }
    }

    return <FlexBox flexDirection="column" gap={10}>
        <select value={flightBooker.bookingType} onChange={e => flightBooker.setBookingType(e.target.value as "one-way" | "return")}>
            <option value="one-way">one-way flight</option>
            <option value="return">return flight</option>
        </select>
        <input value={flightBooker.startDateString}
            onChange={(e) => flightBooker.setStartDateString(e.target.value)}
            style={{ backgroundColor: flightBooker.startDateValid ? 'inherit' : '#ec6a5e' }}></input>
        <input value={flightBooker.endDateString}
            onChange={(e) => flightBooker.setEndDateString(e.target.value)}
            disabled={flightBooker.bookingType === "one-way"}
            style={{ backgroundColor: flightBooker.bookingType === "one-way" || flightBooker.endDateValid ? 'inherit' : '#ec6a5e' }}></input>
        <button onClick={handleBook}
            disabled={flightBooker.bookingType === "one-way"
                ? !flightBooker.startDateValid
                : !flightBooker.startDateValid || !flightBooker.endDateValid}>Book</button>
    </FlexBox >
})

export default FlightBooker