function evaluate(block, printer) {
  var env = {
    consts: {},
    vars: {},
    procedures: {},
    printer: printer
  }
  evaluateBlock(block, env)
}

module.exports.evaluate = evaluate

function evaluateBlock(block, env) {
  addVars(block.vars, env)
  addConsts(block.consts, env)
  addProcedures(block.procedures, env)
  evaluateStatement(block.statement, env)
}

module.exports.evaluateBlock = evaluateBlock

function evaluateProcedure(procedure, env) {
  evaluateBlock(procedure.body, env)
}

function addVars(vars, env) {
  if (!vars) return
  for (var varName of vars) {
    env.vars[varName] = undefined
  }
}

function addConsts(consts, env) {
  if (!consts) return
  for (var constant of consts) {
    env.consts[constant.ident] = constant.value
  }
}

function addProcedures(procedures, env) {
  if (!procedures) return
  for (var procedure of procedures) {
    env.procedures[procedure.name] = procedure
  }
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
  } else if (statement.print !== undefined) {
    evaluatePrint(statement.print, env)
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
    throw new Error(`Procedure "${callIdent}" is not defined`)
  }
}

function isPrintable(printIdent, env) {
    return env.consts[printIdent] !== undefined
        || env.vars[printIdent] !== undefined
}

function evaluatePrint(printable, env) {
  env.printer(evaluateExpression(printable, env))
}

function evaluateAssignment(assignment, env) {
  let ident = assignment.ident
  let expressionResult = evaluateExpression(assignment.expression, env)
  if (ident in env.vars) {
    let variable = env.vars[ident]
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
  if (condition.odd !== undefined) {
    let expression = evaluateExpression(condition.odd, env)
    return (expression % 2) !== 0
  }
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
      value -= result
    } else if (op === '+') {
      value += result
    } else if (op === '*') {
      value *= result
    } else if (op === '/') {
      value = Math.floor(value / result)
    }
    else {
      throw new Error(`"${op}" is not a valid operator`)
    }
  }
  if (expression.sign === '-') {
    value *= -1
  }
  return value
}

function evaluateIdent(ident, env) {
  if (ident in env.consts) {
    let constant = env.consts[ident]
    if (constant === undefined) {
      throw new Error(`"${ident}" has been created as constant but not assigned`)
    }
    return constant
  }
  if (ident in env.vars) {
    let resolved = env.vars[ident]
    if (resolved === undefined) {
      throw new Error(`"${ident}" has been created as variable but not assigned`)
    }
    return evaluateTerm(resolved, env)
  }
  throw new Error(`"${ident}" is not defined as a const or var`)
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
    throw new Error(`Error: "${pp(term)}" is not a valid term :(`)
  }
}

module.exports.evaluateExpression = evaluateExpression
