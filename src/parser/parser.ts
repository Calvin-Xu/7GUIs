import { SpreadSheetStore, COLUMNS } from "../components/guis/spreadsheet"
import type { Coordinate } from "../components/guis/spreadsheet"

type Range = { start: Coordinate; end: Coordinate }
type NumberLiteral = number
type Textual = string
type List = Expression[]
type Procedure = (args: Argument[]) => Expression
type Argument = NumberLiteral | Argument[]
type Expression = Coordinate | Range | NumberLiteral | Textual | Procedure | List

const parseCoordinate = (str: string): Coordinate => {
    return { row: parseInt(str.slice(1)), column: COLUMNS.indexOf(str[0]) }
}

const flattenNumericalArgs = (args: Argument[]): number[] => {
    const flattened: number[] = []
    args.forEach(arg => {
        if (Array.isArray(arg)) {
            flattened.push(...flattenNumericalArgs(arg))
        } else {
            const num = arg.toString() === "" ? 0 : parseFloat(arg.toString())
            if (isNaN(num)) {
                throw new Error(`Invalid numerical arg: '${arg}'`)
            }
            flattened.push(num)
        }
    })
    return flattened
}

const makeNumericalProcedure = (fn: (args: number[]) => number): Procedure => {
    // treats all args as numbers; flattens lists in args
    return (args: Argument[]) => {
        const arg_nums: number[] = flattenNumericalArgs(args)
        return fn(arg_nums).toFixed(2)
    }
}

const procedures: { [key: string]: (Procedure) } = {
    "add": makeNumericalProcedure(args => args[0] + args[1]),
    "sub": makeNumericalProcedure(args => args[0] - args[1]),
    "mul": makeNumericalProcedure(args => args[0] * args[1]),
    "div": makeNumericalProcedure(args => args[0] / args[1]),
    "mod": makeNumericalProcedure(args => args[0] % args[1]),
    "pow": makeNumericalProcedure(args => Math.pow(args[0], args[1])),
    "sum": makeNumericalProcedure(args => args.reduce((a, b) => a + b, 0)),
    "prod": makeNumericalProcedure(args => args.reduce((a, b) => a * b, 1)),
    "mean": makeNumericalProcedure(args => args.reduce((a, b) => a + b, 0) / args.length),
    "median": makeNumericalProcedure(args => {
        const sorted = args.sort((a, b) => a - b)
        if (sorted.length % 2 === 0) {
            return (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        } else {
            return sorted[Math.floor(sorted.length / 2)]
        }
    }),
    "var": makeNumericalProcedure(args => {
        const mean = procedures["mean"](args) as number
        const variance = (procedures["sum"](args.map(arg => Math.pow(arg - mean, 2))) as number) / args.length
        return variance
    }),
    "std": makeNumericalProcedure(args => Math.sqrt(procedures["var"](args) as number)),
    "min": makeNumericalProcedure(args => args.reduce((a, b) => a < b ? a : b, args[0])),
    "max": makeNumericalProcedure(args => args.reduce((a, b) => a > b ? a : b, args[0])),
}

const tokenize = (input: string): string[] => {
    const tokens: string[] = []
    let current = ''
    const delimiters = new Set(['(', ')', ',', '=', ' '])

    for (let i = 0; i < input.length; i++) {
        const char = input[i]
        if (delimiters.has(char)) {
            if (current) {
                tokens.push(current)
                current = ''
            }
            if (char !== ' ') tokens.push(char)
        } else {
            current += char
        }
    }

    if (current) {
        tokens.push(current)
    }

    return tokens
}

const parseExpr = (tokens: string[], context: SpreadSheetStore): Expression => {
    let token = tokens.shift()

    if (!token) {
        throw new Error("Unexpected end of input.")
    }

    // handle direct number literals
    if (!isNaN(parseFloat(token))) {
        return parseFloat(token) as NumberLiteral
    }

    // handle range
    if (token.includes(":")) {
        const [start, end] = token.split(":")
        return context.getRange(parseCoordinate(start), parseCoordinate(end)).map(cell => cell.value)
    }

    // handle assignment
    if (token.match(/^[A-Z]+[0-9]+$/)) {
        try {
            return context.getCellStore(parseCoordinate(token))?.evaluatedValue || "" as string
        } catch (e: any) { throw new Error(`Could not obtain value of ${token}: ` + e.message + ".") }
    }

    // handle procedure call
    if (!procedures[token]) {
        throw new Error(`Procedure ${token} not found.`)
    }

    const procedureName = token
    const args: Argument[] = []

    if (tokens.shift() !== '(') throw new Error("Expected '(' after procedure name.")

    while (tokens.length > 0 && tokens[0] !== ')') {
        args.push(parseExpr(tokens, context) as Argument)
        if (tokens[0] === ',') {
            tokens.shift()
        }
    }

    if (tokens.shift() !== ')') {
        throw new Error("Expected ')' at the end of arguments.")
    }

    return procedures[procedureName](args)
}

const evaluate = (input: string, context: SpreadSheetStore): string => {
    if (!input.startsWith('=')) {
        return input
    }
    const tokens = tokenize(input)
    try {
        return parseExpr(tokens.slice(1), context).toString()
    } catch (e: any) {
        throw new Error("Error: " + e.message)
    }
}

export { evaluate, parseCoordinate }