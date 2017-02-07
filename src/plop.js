const P = require('pegjs')

const blockPartial = `
block = consts:(const / nothing) vars:(var / nothing) procedures:procedures statement:statement {
  return {
    consts: consts,
    vars: vars,
    procedures: procedures,
    statement: statement
  }
}

const =
  constWord ident:ident "=" value:number rest:constAssignment* ";" {
    return [{ident: ident, value: value}].concat(rest)
  }
constAssignment = "," ident:ident "=" value:number {
  return {
    ident: ident,
    value: value
  }
}
constWord = _ 'const' _

var = varWord ident:ident rest:identCommas* ";" {
  return [ident].concat(rest)
}

identCommas = "," ident:ident {
  return ident
}

varWord = _ "var" _

procedures = procedures:procedureList*

procedureList = procedureWord name:ident ";" block:block ";" {
  return {
    name: name,
    body: block
  }
}

procedureWord = _ "procedure" _
`

const statementPartial = `
statement = _ statement:(assignment / call / begin / if / while / "") _ {
  return statement
}

assignment = ident:ident ":=" expression:expression {
  return {
    assignment: {
      ident: ident,
      expression: expression
    }
  }
}

call = callWord ident:ident {
  return { call: ident }
}

callWord = _ "call" _

begin = "begin" first:statement rest:semi_colon_statement+ end {
  let statements = [first]
      .concat(rest)
      .filter(stm => stm !== '')
  return { begin: statements }
}

semi_colon_statement = !end _ ";" _ statement:statement {
  return statement
}

end = _ "end" _

if = ifWord condition:condition thenWord statement:statement {
  return {
    if: {
      condition: condition,
      statement: statement
    }
  }
}

ifWord = _ "if" _
thenWord = _ "then" _

while = whileWord condition:condition doWord statement:statement {
  return {
    while: {
      condition: condition,
      statement: statement
    }
  }
}

whileWord = _ "while" _
doWord = _ "do" _
`

const conditionPartial = `
condition = odd
  / _ left:expression _ op:operator _ right:expression _ {
    return {
      left: left,
      right: right,
      op: op
    }
  }

odd = _ "odd" __ exp:expression {
  return {
    odd: exp
  }
}

operator = "=" / "#" / "<=" / "<" / ">=" / ">"
`

const expressionPartial = `
expression = sign:("+"/"-"/"") _ first:term rest:op_then_term* {
  var expr = {
    first: first,
    rest: rest
  }
  if ((sign === "") || (sign === "+")) {
    expr.sign = "+"
  } else {
    expr.sign = "-"
  }
  return expr
}

op_then_term = _ op:("+"/"*") _ term:term {
  return {
    op: op,
    term: term
  }
}
`

const term =  `
term = _ first:factor _ rest:op_then_factor* {
  if (rest.length === 0) {
    return first
  }
  return {
    first: first,
    rest: rest
  }
}

op_then_factor = op:("*"/"/") _ fact:factor {
  return {
    "op": op,
    "factor": fact
  }
}
`

const factor = `
factor = ident:ident {
  return {
    ident: ident
  }
} / num:number {
  return {
    number: num
  }
} / "(" expr:expression ")" {
  return {
    expression: expr
  }
}
`

const base = `
_ "whitespace" = [\\t\\n\\r ]*

__ "forced whitespcace" = [\\t\\n\\r ]+

nothing = "" {
  return null
}

`

const ident = `
ident = _ ident:[a-zA-Z]+ _ {
  return ident.join("")
}
`

const number = `
number = _ digits:[0-9]+ _ {
  return parseInt(digits.join(""))
}
`

module.exports.Ident = P.generate(`
  ${ident}

  ${base}
`)

module.exports.Number = P.generate(`
  ${number}

  ${base}
`)

const expression = `
  ${expressionPartial}

  ${term}

  ${factor}

  ${number}

  ${ident}

  ${base}
`

module.exports.Expression = P.generate(expression)

const condition = `
  ${conditionPartial}

  ${expression}
`
module.exports.Condition = P.generate(condition)

const statement = `
  ${statementPartial}

  ${condition}
`
module.exports.Statement = P.generate(statement)

const block = `
  ${blockPartial}

  ${statement}
`

module.exports.Block = P.generate(block)
