function evaluateProcedure(procedure, env) {
}

function evaluateStatement(statement, env) {
  if (statement.call !== undefined) {
    return evaluateCall(statement.call, env)
  } else if (statement.assignment !== undefined) {
    return evaluateAssignment(statement.assignment, env)
  } else if (statement.if !== undefined) {
    return evaluateIf(statement.if, env)
  } else if (statement.while !== undefined) {
    return evaluateWhile(statement.while, env)
  } else {
    throw new Error(`Unrecognized statement ${statement}`)
  }
}

function evaluateCall(callIdent, env) {
  let procedure = env.procedures[callIdent]
  if (procedure) {
    return evaluateProcedure(procedure)
  } else {
    throw new Error(`Procedure ${callIdent} is not defined`)
  }
}

function evaluateAssignment(assignment, env) {
}

function evaluateIf(ifStatementt, env) {
}

function evaluateWhile(whileStatement, env) {
}

function evaluateCondition(condition, env) {
  let left = evaluateExpression(condition.left, env)
  let right = evaluateExpression(condition.right, env)
  switch (condition.op) {
  case '#': return left !== right
  case '=': return left === right
  case '>': return left > right
  case '<': return left < right
  case '<=': return left <= right
  case '>=': return left >= right
  default: throw new Error(`${condition.op} is not a valid comparison operator`)
  }
}

module.exports.evaluateCondition = evaluateCondition

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
  return JSON.stringify(blah, null, 2)
}

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
