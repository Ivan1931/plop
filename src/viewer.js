const Parser = require('./parser')
const Evaluator = require('./evaluator')
const codemirror = require('codemirror')


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

function renderContent(editable, parserCallback) {
  var code = editable.editor.textContent
  try {
    let ast = parserCallback(code)
    let astText = JSON.stringify(ast, null, 2)
    editable.viewer.textContent = astText
    editable.viewer.style.cssText = editableStyle
  } catch (parseError) {
    console.log(parseError)
    editable.viewer.textContent = parseError.toString()
    editable.viewer.style.cssText = `
      border: solid 2px rgb(230, 70, 70);
      border-radius: 3px;
      padding:1px;
    `
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
