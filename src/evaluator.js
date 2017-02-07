function evaluateExpression(expression, env) {
  var value = evaluateTerm(expression.first, env)
  for (var term of expression.rest) {
    let op = term.op
    let result = evaluateTerm(term.term, env)
    if (op === '-') {
      op -= result
    } else if (op === '+') {
      value += result
    } else if (op === '*') {
      value *= result
    } else if (op === '/') {
      value /= result
    }
    else {
      throw new SyntaxError(`${op} is not a valid operator`)
    }
  }
  if (expression.sign === '-') {
    value *= -1
  }
  return value
}

function evaluateIdent(ident, env) {
  let resolved = env[ident]
  if (resolved === undefined) {
    throw new SyntaxError(`Symbol ${ident} is undefined :(`)
  }
  return evaluateExpression(resolved, env)
}

function pp(blah) {
  return JSON.stringify(blah, null, 2) }

function evaluateTerm(term, env) {
  if (term.number !== undefined) {
    return term.number
  } else if (term.ident !== undefined) {
    return evaluateIdent(term.ident, env)
  } else if (term.first !== undefined) {
    return evaluateExpression(term, env)
  } else {
    throw new SyntaxError(`Error: ${pp(term)}\nis not a valid term :(`)
  }
}

module.exports.evaluateExpression = evaluateExpression
