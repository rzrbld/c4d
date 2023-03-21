const trapFocus = (element, prevFocusableElement = document.activeElement) => {
    const focusableEls = Array.from(
      element.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), input[type="submit"]:not([disabled]), select:not([disabled])'
      )
    );
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];
    let currentFocus = null;

    firstFocusableEl.focus();
    currentFocus = firstFocusableEl;

    const handleFocus = e => {
      e.preventDefault();
      // if the focused element "lives" in your modal container then just focus it
      if (focusableEls.includes(e.target)) {
        currentFocus = e.target;
      } else {
        // you're out of the container
        // if previously the focused element was the first element then focus the last 
        // element - means you were using the shift key
        if (currentFocus === firstFocusableEl) {
          lastFocusableEl.focus();
        } else {
          // you previously were focused on the last element so just focus the first one
          firstFocusableEl.focus();
        }
        // update the current focus var
        currentFocus = document.activeElement;
      }
    };

    document.addEventListener("focus", handleFocus, true);

    return {
      onClose: () => {
        document.removeEventListener("focus", handleFocus, true);
        prevFocusableElement.focus();
      }
    };
  };

const toggleModal = ((e) => {
  const modal = document.getElementById("EditModal");
  if (modal.style.display === "none") {
    modal.style.display = "block";
    trapped = trapFocus(modal);
  } else {
    modal.style.display = "none";
    trapped.onClose();
  } 
})

function initEditModal(){
    // Get the modal
    var EditModal = document.getElementById("EditModal");

    // Get the <span> element that closes the modal
    var closeEditModalContainer = document.getElementById("closeEditModal");

    // When the user clicks on <span> (x), close the modal
    closeEditModalContainer.onclick = function() {
        toggleModal()
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == EditModal) {
            toggleModal()
        }
    }
}

function saveEditModalData(cell, newdata ,mdl){
    console.log("save triggered >>> ", cell, newdata ,mdl)
    Graph.prototype.updateCell(cell, newdata, mdl);
    toggleModal()
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
