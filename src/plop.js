const P = require('pegjs')

const condition = `
condition = odd
  / _ left:expression _ op:operator _ right:expression _ {
    return {
      left: left,
      right: right,
      op: op
    }
  }

odd = _ "odd" __ exp:condition {
  return {
    odd: exp
  }
}

operator = "=" / "#" / "<=" / "<" / ">=" / ">"
`

const expression_partial = `
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
  ${expression_partial}

  ${term}

  ${factor}

  ${number}

  ${ident}

  ${base}
`

module.exports.Expression = P.generate(expression)
module.exports.Condition = condition
