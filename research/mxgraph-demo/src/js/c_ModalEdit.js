function initEditModal(){
    // Get the modal
    var EditModal = document.getElementById("EditModal");

    // Get the <span> element that closes the modal
    var closeEditModalContainer = document.getElementById("closeEditModal");

    // When the user clicks on <span> (x), close the modal
    closeEditModalContainer.onclick = function() {
        EditModal.style.display = "none";
    }

    // // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == EditModal) {
        EditModal.style.display = "none";
        }
    }
}

function saveEditModalData(cell, newdata ,mdl){
    console.log("save triggered >>> ", cell, newdata ,mdl)
    Graph.prototype.updateCell(cell, newdata, mdl);
    EditModal.style.display = "none";
}

function addToModal(cell, mdl){
    console.log("cell >>>", cell.value)
    var modalC = document.getElementById("EditModalContent");
    var modalSaveBtn = document.getElementById("EditModalSaveButton");
    
    var parser = new DOMParser();
    var htmlVal = parser.parseFromString(cell.value,"text/html");

    console.log("htmlVal >>>", htmlVal)

    var c4Params = htmlVal.getElementsByClassName('C4Param')

    var inputs = []

    modalC.innerHTML = ""

    innerForm=""

    for (let i = 0; i < c4Params.length; i++) {
        const param = c4Params[i];

        inputs.push(c4Params[i].getAttribute('id'))

        console.log(c4Params[i].getAttribute('id'),c4Params[i].innerHTML)

        innerForm += `
        <div style='width: 100%; height: 30px; text-align: left; vertical-align: middle;'>
        <div style='float: left; width:50%;'>`+c4Params[i].getAttribute('id')+`:</div>
        <div style='float: right; width:50%;'><input type='text' id='input_`+c4Params[i].getAttribute('id')+`' value='`+c4Params[i].innerHTML+`'/></div>
        </div>
        `
    }

    modalC.innerHTML = innerForm

    modalSaveBtn.onclick = function() { 

        console.log("FORM inputs >>>", modalC.getElementsByTagName('input'))

        var formInputs = modalC.getElementsByTagName('input')

        var newValues = []

        for (let g = 0; g < formInputs.length; g++) {
            const element = formInputs[g];
            newValues[g] = formInputs[g].value
            console.log(formInputs[g].value, formInputs[g].getAttribute('id'))
        }

        console.log("new values arr >>>", newValues)

        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];

            console.log(htmlVal.getElementById(input), newValues[i])

            htmlVal.getElementById(input).innerText = newValues[i];

            console.log(htmlVal.getElementById(input))
        }
        
        
        var serializer = new XMLSerializer()
        var htmlStr = serializer.serializeToString(htmlVal.getElementsByTagName('body')[0].firstElementChild);

        console.log("inputContainer >>> ", htmlStr)


        saveEditModalData(cell, htmlStr ,mdl); 
    }

    document.getElementById(inputs[0]).focus({focusVisible: true});
    console.log(inputs)
}

window.onload = initEditModal;
