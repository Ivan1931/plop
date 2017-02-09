const Parser = require('./parser')
const Evaluator = require('./evaluator')
const codemirror = require('codemirror')

function init() {
  initParsers()
}

function initParsers() {
  let parsers = document.getElementsByTagName('textarea')
  for (let child of parsers) {
  }
}

function initEvaluators() {
}

function initParserViewer(initialString, parser) {
}

function initEvaluatorViewer(initalString, initalEnv, evaluator) {
}

module.exports.init = init
