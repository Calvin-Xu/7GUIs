import { SpreadSheetStore, COLUMNS } from "../components/guis/spreadsheet"
import type { Coordinate } from "../components/guis/spreadsheet"

type Range = { start: Coordinate; end: Coordinate }
type NumberLiteral = number
type Textual = string
type List = Expression[]
type Procedure = (args: Argument[]) => Expression
type Argument = NumberLiteral | Argument[]
type Expression = Coordinate | Range | NumberLiteral | Textual | Procedure | List

const isTextual = (expr: Expression): expr is Textual => typeof expr === 'string'
const isNumberLiteral = (expr: Expression): expr is NumberLiteral => typeof expr === 'number'
const isProcedure = (expr: Expression): expr is Procedure => typeof expr === 'function'

const makeNumericalProcedure = (args: Argument[], fn: (args: number[]) => Expression): Expression => {
    const arg_nums: number[] = args.map(arg => parseFloat(arg.toString()))
    return fn(arg_nums)
}

const procedures: { [key: string]: (Procedure) } = {
    "add": (args: Argument[]) => makeNumericalProcedure(args, args => args[0] + args[1]),
    "sub": (args: Argument[]) => makeNumericalProcedure(args, args => args[0] - args[1]),
    "mul": (args: Argument[]) => makeNumericalProcedure(args, args => args[0] * args[1]),
    "div": (args: Argument[]) => makeNumericalProcedure(args, args => args[0] / args[1]),
    "mod": (args: Argument[]) => makeNumericalProcedure(args, args => args[0] % args[1]),
    "pow": (args: Argument[]) => makeNumericalProcedure(args, args => Math.pow(args[0], args[1])),
    "sum": (args: Argument[]) => makeNumericalProcedure(args, args => args.reduce((a, b) => a + b, 0)),
    "prod": (args: Argument[]) => makeNumericalProcedure(args, args => args.reduce((a, b) => a * b, 1)),
    "mean": (args: Argument[]) => makeNumericalProcedure(args, args => args.reduce((a, b) => a + b, 0) / args.length),
    "median": (args: Argument[]) => makeNumericalProcedure(args, args => {
        const sorted = args.sort((a, b) => a - b)
        if (sorted.length % 2 === 0) {
            return (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        } else {
            return sorted[Math.floor(sorted.length / 2)]
        }
    }),
    "var": (args: Argument[]) => makeNumericalProcedure(args, args => {
        const mean = procedures["mean"](args) as number
        const variance = (procedures["sum"](args.map(arg => Math.pow(arg - mean, 2))) as number) / args.length
        return variance
    }),
    "std": (args: Argument[]) => makeNumericalProcedure(args, args => Math.sqrt(procedures["var"](args) as number)),
    "min": (args: Argument[]) => makeNumericalProcedure(args, args => args.reduce((a, b) => a < b ? a : b, args[0])),
    "max": (args: Argument[]) => makeNumericalProcedure(args, args => args.reduce((a, b) => a > b ? a : b, args[0])),
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

    if (token !== "=") {
        throw new Error(`Unexpected token ${token}; perhaps you mean '=${token}'.`)
    }

    token = tokens.shift() // remove '='
    if (!token) {
        throw new Error("Unexpected end of input.")
    }

    // handle assignment
    if (token.match(/^[A-Z]+[0-9]+$/)) {
        const row: number = parseInt(token.slice(1))
        const column: number = COLUMNS.indexOf(token[0])

        try {
            return context.getCellStore({ row, column } as Coordinate)?.evaluatedValue || "" as string
        } catch (e: any) { throw `Error obtaining value of ${token}: ` + e.message + "." }
    }


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
    const tokens = tokenize(input)
    if (!input.startsWith('=')) {
        return input
    }
    try {
        return parseExpr(tokens, context).toString()
    } catch (e: any) {
        throw new Error("Error: " + e.message)
    }
}

export { evaluate }