function evaluateProcedure(procedure, env) {
  return {}
}

function evaluateStatement(statement, env) {
  if (statement.call !== undefined) {
    evaluateCall(statement.call, env)
  } else if (statement.assignment !== undefined) {
    evaluateAssignment(statement.assignment, env)
  } else if (statement.if !== undefined) {
    evaluateIf(statement.if, env)
  } else if (statement.while !== undefined) {
    evaluateWhile(statement.while, env)
  } else if (statement.begin !== undefined) {
    evaluateBegin(statement.begin, env)
  } else {
    throw new Error(`Unrecognized statement ${pp(statement)}`)
  }
}

module.exports.evaluateStatement = evaluateStatement

function evaluateCall(callIdent, env) {
  let procedure = env.procedures[callIdent]
  if (procedure) {
    evaluateProcedure(procedure, env)
  } else {
    throw new Error(`Procedure ${callIdent} is not defined`)
  }
}

function evaluateAssignment(assignment, env) {
  let ident = assignment.ident
  let expressionResult = evaluateExpression(assignment.expression, env)
  let variable = env.vars[ident]
  if (variable !== undefined) {
    env.vars[ident] = { number: expressionResult }
    return expressionResult
  } else {
    throw new Error(`${ident} has not been defined as a variable`)
  }
}

function evaluateIf(ifStatement, env) {
  let condition = evaluateCondition(ifStatement.condition, env)
  if (condition) {
    evaluateStatement(ifStatement.statement, env)
  }
}

function evaluateWhile(whileStatement, env) {
  var condition = evaluateCondition(whileStatement.condition, env)
  while (condition) {
    evaluateStatement(whileStatement.statement, env)
    condition = evaluateCondition(whileStatement.condition, env)
  }
}

function evaluateBegin(statements, env) {
  for (var statement of statements) {
    evaluateStatement(statement, env)
  }
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
  let constant = env.consts[ident]
  if (constant !== undefined) {
    return constant
  }
  let resolved = env.vars[ident]
  if (resolved !== undefined) {
    return evaluateTerm(resolved, env)
  }
  throw new SyntaxError(`${ident} is undefined`)
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
