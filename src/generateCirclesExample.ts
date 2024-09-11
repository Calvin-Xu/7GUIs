import { CircleStore } from "./components/guis/circleDrawer"

export const generateCirclesExample = () => {
    const store = new CircleStore()
    store.addCircle(235, 200)
    store.pushNewState()
    store.selectCircleNear(235, 200)
    store.adjustDiameter(100)

    store.addCircle(143, 184)
    store.pushNewState()
    store.selectCircleNear(143, 184)
    store.adjustDiameter(120)


    store.addCircle(303, 67)
    store.pushNewState()
    store.selectCircleNear(303, 67)
    store.adjustDiameter(220)

    store.addCircle(352, 91)
    store.pushNewState()
    store.selectCircleNear(352, 91)
    store.adjustDiameter(74)

    store.selected = undefined

    return store
}