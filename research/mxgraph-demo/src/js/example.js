const colorAssigner = new ConvergenceColorAssigner.ColorAssigner();
let textEditor;
let localSelectionReference;

// const username = randomDisplayName();
// document.getElementById("username").innerHTML = username;

console.log("textarea connect >>> ", MxGraphConfig.CONVERGENCE_URL, ConvergenceCollaborationController._getGraphId())


Convergence.connectAnonymously(MxGraphConfig.CONVERGENCE_URL).then(domain => {
  const omodelId = ConvergenceCollaborationController._getGraphId();
  return domain.models().openAutoCreate({
    collection: "example-textarea",
    id: omodelId+"_text",
    ephemeral: true,
    data: defaultData
  });
}).then(model => {
  const textarea = document.getElementById("mdBox");
  const rts = model.elementAt(["text"]);

  // Set the initial data, and set the cursor to the beginning.
  textarea.value = rts.value();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 0;

//   easyMDE.codemirror.on("change", () => {
    // console.log(easyMDE.value(), textarea, textarea.value, rts.value() );
    // textarea.value = easyMDE.value();
//   }); 


  // Create the editor and set up two way data binding.
  textEditor = new HtmlTextCollabExt.CollaborativeTextArea({
    control: textarea,
    onInsert: (index, value) => {rts.insert(index, value); console.log("triggered1")},
    onDelete: (index, length) => {rts.remove(index, length); console.log("triggered1")},
    onSelectionChanged: sendLocalSelection
  });

  rts.on(Convergence.StringInsertEvent.NAME, (e) => {textEditor.insertText(e.index, e.value); console.log("triggered3")});
  rts.on(Convergence.StringRemoveEvent.NAME, (e) => {textEditor.deleteText(e.index, e.value.length); console.log("triggered4")});

  // handle reference events
  initSharedSelection(rts, textarea);

}).catch(error => {
  console.error(error);
});

function sendLocalSelection() {
  const selection = textEditor.selectionManager().getSelection();
  localSelectionReference.set({start: selection.anchor, end: selection.target});
}

function initSharedSelection(rts, textarea) {
  localSelectionReference = rts.rangeReference("selection");

  const references = rts.references({key: "selection"});
  references.forEach((reference) => {
    if (!reference.isLocal()) {
      addSelection(reference);
    }
  });

  sendLocalSelection();
  localSelectionReference.share();

  rts.on("reference", (e) => {
    if (e.reference.key() === "selection") {
      this.addSelection(e.reference);
    }
  });

  textarea.addEventListener("blur", () => {
    localSelectionReference.clear();
  })
}

function addSelection(reference) {
  const color = colorAssigner.getColorAsHex(reference.sessionId());
  const remoteRange = reference.value();

  const selectionManager = textEditor.selectionManager();

  selectionManager.addCollaborator(
    reference.sessionId(),
    reference.user().displayName,
    color,
    {anchor: remoteRange.start, target: remoteRange.end});

  reference.on("cleared", () => {
    const collaborator = selectionManager.getCollaborator(reference.sessionId());
    collaborator.clearSelection();
  });
  reference.on("disposed", () => selectionManager.removeCollaborator(reference.sessionId()) );
  reference.on("set", (e) => {
    const selection = reference.value();
    const collaborator = selectionManager.getCollaborator(reference.sessionId());
    collaborator.setSelection({anchor: selection.start, target: selection.end});
    if (!e.synthetic) {
      collaborator.flashCursorToolTip(2);
    }
  });
}

const defaultData = {
  text: document.getElementById("mdBox").value,
};