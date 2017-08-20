const Parser = require('./parser')
const Evaluator = require('./evaluator')
/* Skep hack to prevent this module from breaking tests */
let CodeMirror;
try {
  CodeMirror = require('codemirror')
} catch(e) {
}


function initEditable(pane) {
  let body = document.getElementsByTagName('body')[0]
  let style = document.createElement('style')
      style.innerHTML = require("!!css-loader!codemirror/lib/codemirror.css")
  body.appendChild(style)
  let editor = CodeMirror.fromTextArea(pane.getElementsByClassName('editor').item(0), {
    lineNumbers: true
  })
  let viewer = pane.getElementsByClassName('viewer').item(0)
  let button = pane.getElementsByClassName('evaluate-button').item(0)
  return {
    editor: editor,
    viewer: viewer,
    pane: pane,
    button: button
  }
}

const editableStyle = `
  border: solid 1px rgb(200, 200, 200);
  border-radius: 3px;
`

const errorViewStyle = `
  border: solid 2px rgb(230, 70, 70);
  border-radius: 3px;
  padding:1px;
`

function makeErrorMessage(parseError) {
    return `Error on line ${parseError.location.start.line}: ${parseError.toString()}`
}

function handleParseError(editable, parseError) {
    editable.viewer.textContent = makeErrorMessage(parseError)
    editable.viewer.style.cssText = errorViewStyle
}

function getEditorContent(editable) {
    return editable.editor.getValue()
}

function attemptParse(editable, parserCallback) {
    var code = getEditorContent(editable)
    let ast = parserCallback(code)
    let astText = ast
    if (editable.prettyPrint) {
        astText = JSON.stringify(ast, null, 2)
    } 
    editable.viewer.textContent = astText
    setStyle(editable)
}

function handleRuntimeError(editable, runtimeError) {
    editable.viewer.textContent = runtimeError.toString()
    editable.viewer.style.cssText = errorViewStyle
}

function renderContent(editable, parserCallback) {
  try {
    attemptParse(editable, parserCallback)
  } catch (error) {
    if (error.location !== undefined) {
        handleParseError(editable, error)
    } else {
        handleRuntimeError(editable, error)
    }
  }
}


function setStyle(editable) {
  editable.viewer.style.cssText = editableStyle
}

function addAction(editable, parserCallback) {
  editable.button.onclick = () => {
    renderContent(editable, parserCallback)
  }
}

function initParser(parserEditorID, parserCallback) {
  let pane = document.getElementById(parserEditorID)
  let editable = initEditable(pane)
  editable.prettyPrint = true
  renderContent(editable, parserCallback)
  addAction(editable, parserCallback)
  setStyle(editable)
}

function initEvaluator(parserEditorID, evaluatorCallback) {
  let pane = document.getElementById(parserEditorID)
  let editable = initEditable(pane)
  renderContent(editable, evaluatorCallback)
  addAction(editable, evaluatorCallback)
  setStyle(editable)
}

module.exports.initParser = initParser
module.exports.initEvaluator = initEvaluator
