const Parser = require('./parser')
const Evaluator = require('./evaluator')
const _  = require('lodash')


function initEditable(pane) {
  let editor = pane.getElementsByClassName('editor').item(0)
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

function applyParseError(editable, parseError) {
  let location = parseError.location
  let startLine = location.start.line - 1
  let lines = editable.editor.textContent.split('\n')
  editable.editor.innerHTML = _.chain(lines).map((item, idx) => {
    if (idx === startLine) {
      return `<span style="background-color: rgba(200, 120, 120, 0.4)">${item}</span>`
    } else {
      return item
    }
  })
  .join('\n')
  .value()
}

function unapplyParseError(editable) {
  editable.editor.textContent = editable.editor.textContent
}

function handleParseError(editable, parseError) {
    editable.viewer.textContent = parseError.toString()
    editable.viewer.style.cssText = `
      border: solid 2px rgb(230, 70, 70);
      border-radius: 3px;
      padding:1px;
    `
    applyParseError(editable, parseError)
}

function attemptParse(editable, parserCallback) {
    var code = editable.editor.textContent
    let ast = parserCallback(code)
    let astText = JSON.stringify(ast, null, 2)
    unapplyParseError(editable)
    editable.viewer.textContent = astText
    editable.viewer.style.cssText = editableStyle

}

function renderContent(editable, parserCallback) {
  try {
    attemptParse(editable, parserCallback)
  } catch (parseError) {
    handleParseError(editable, parseError)
  }
}


function setStyle(editable) {
  //pane.style.cssText = `display: flex;`
  editable.editor.style.cssText = editableStyle
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
  renderContent(editable, parserCallback)
  addAction(editable, parserCallback)
  setStyle(editable)
}

module.exports.initParser = initParser
