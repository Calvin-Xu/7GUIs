import { observer } from "mobx-react"
import FlexBox from "../flexbox"
import { action, computed, makeObservable, observable } from 'mobx'

interface entry {
    id: number
    name: string
    surname: string
}

class CRUDStore {

    highestId: number = 0 // autoincrement
    prefixFilter: string = ''
    name: string = ''
    surname: string = ''
    selected: number = 0

    entries: entry[] = [
        { id: 1, name: 'Hans', surname: 'Emil' },
        { id: 2, name: 'Max', surname: 'Mustermann' },
        { id: 3, name: 'Roman', surname: 'Tisch' }
    ]

    constructor() {
        makeObservable(this, {
            entries: observable,
            prefixFilter: observable,
            name: observable,
            surname: observable,
            selected: observable,
            filteredEntries: computed,
            selectedIdx: computed,
            addEntry: action,
            deleteEntry: action
        })

        this.highestId = this.entries[this.entries.length - 1].id || 0
        this.selected = this.entries[0].id
    }

    get filteredEntries() {
        return this.entries.filter(entry => entry.surname.toLowerCase().startsWith(this.prefixFilter.toLowerCase()))
    }

    get selectedIdx() {
        return this.entries.findIndex(entry => entry.id === this.selected)
    }

    addEntry() {
        if (this.name === '' || this.surname === '') {
            alert('Name and surname must not be empty')
            return
        }
        this.entries.push({ id: ++this.highestId, name: this.name, surname: this.surname })
        this.name = ''
        this.surname = ''
    }

    deleteEntry() {
        if (this.selectedIdx === -1) {
            return
        }
        const lastSelected = this.selectedIdx
        this.entries.splice(this.selectedIdx, 1)
        this.selected = Math.max(this.entries[lastSelected]?.id || 0, this.entries[lastSelected - 1]?.id || 0)
    }

    updateEntry() {
        if (this.name === '' || this.surname === '') {
            alert('Name and surname must not be empty')
            return
        }
        if (this.selectedIdx === -1) {
            return
        }
        this.entries[this.selectedIdx] = { id: this.entries[this.selectedIdx].id, name: this.name, surname: this.surname }
        this.name = ''
        this.surname = ''
    }

    updateFilter(filter: string) {
        this.prefixFilter = filter
        this.selected = this.entries[0]?.id || 0
    }
}

const crud = new CRUDStore()

const CRUD = observer(() => (
    <FlexBox flexDirection="column" gap={20}>
        <FlexBox flexDirection="row" gap={10} justifyContent="flex-start">
            <label>Filter prefix:</label>
            <input style={{ maxWidth: '6em' }}
                value={crud.prefixFilter}
                onChange={action(e => crud.updateFilter(e.target.value))} />
        </FlexBox>
        <FlexBox flexDirection="row" gap={10} alignItems="flex-start">
            <select style={{ flex: 1, minWidth: '14em', minHeight: '6em' }}
                value={crud.selected}
                onChange={action(e => crud.selected = parseInt(e.target.value))}
                size={Math.max(crud.filteredEntries.length, 2)} // avoid diff appearance of size 1
            >
                {crud.filteredEntries.map(entry => <option key={entry.id} value={entry.id}>{entry.surname}, {entry.name}</option>)}
            </select>
            <FlexBox flexDirection="column" gap={10} style={{ flex: 1 }}>
                <FlexBox flexDirection="row" gap={10}>
                    <label style={{ width: '5em' }}>Name:</label>
                    <input style={{ flex: 1, maxWidth: '6em' }}
                        value={crud.name}
                        onChange={action(e => crud.name = e.target.value)} />
                </FlexBox>
                <FlexBox flexDirection="row" gap={10}>
                    <label style={{ width: '5em' }}>Surname:</label>
                    <input style={{ flex: 1, maxWidth: '6em' }}
                        value={crud.surname}
                        onChange={action(e => crud.surname = e.target.value)} />
                </FlexBox>
            </FlexBox>
        </FlexBox>
        <FlexBox flexDirection="row" gap={10} justifyContent="flex-start">
            <button onClick={action(() => crud.addEntry())}>Create</button>
            <button onClick={action(() => crud.updateEntry())}>Update</button>
            <button onClick={action(() => crud.deleteEntry())}>Delete</button>
        </FlexBox>
    </FlexBox >
))


export default CRUD
