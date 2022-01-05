// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);
var searchResults = document.getElementById("search-results");

// Main function that gets executed once the webview DOM loads
function main() {
  const searchField = document.getElementById("searchField");
  searchField.addEventListener("keyup", handleSearchChange);
  setVSCodeMessageListener();
}

// Callback function that is executed when the howdy button is clicked
function handleSearchChange() {
  const searchValue = document.getElementById("searchField").value;
  // Some quick background:
  // 
  // Webviews are sandboxed environments where abritrary HTML, CSS, and 
  // JavaScript can be executed and rendered (i.e. it's basically an iframe).
  // 
  // Because of this sandboxed nature, VS Code uses a mechanism of message 
  // passing to get data from the extension context (i.e. src/extension.ts) 
  // to the webview context (this file), all while maintaining security.
  // 
  // vscode.postMessage() is the API that can be used to pass data from
  // the webview context back to the extension context––you can think of 
  // this like sending data from the frontend to the backend of the extension.
  // 
  // Note: If you instead want to send data from the extension context to the 
  // webview context (i.e. backend to frontend), you can find documentation for
  // that here:
  // 
  // https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview
  //
  // The main thing to note is that postMessage() takes an object as a parameter.
  // This means arbitrary data (key-value pairs) can be added to the object
  // and then accessed when the message is recieved in the extension context.
  //
  // For example, the below object could also look like this:
  //
  // {
  //  command: "hello",
  //  text: "Hey there partner! 🤠",
  //  random: ["arbitrary", "data"],
  // }
  vscode.postMessage({
    command: "search",
    payload: searchValue
  });
}

// Sets up an event listener to listen for messages passed from the extension context
// and executes code based on the message that is recieved
function setResponseBadge(text){
  document.getElementById("resultTag").innerHTML=text+" results found";
}


function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {
    const command = event.data.command;
    const resultsPayload = event.data.payload;

    switch (command) {
      case "results":
        console.log("results", resultsPayload);
        renderResults(resultsPayload);
        
        break;
      case "context-results":
        console.log("context-results", resultsPayload);
        // renderResults(resultsPayload);
        prepareOriginResults(resultsPayload);
        break;
    }
  });
}

function prepareOriginResults(payload){
  var ddNode = payload["_node"];
  var ddNodeTo = payload["_nodeto"];
  var ddRel = payload["_rel"];


  var allNodes = ddNode.concat(ddNodeTo);

  if(ddNode !== null && ddNode.length >0){
    ddNode = deduplicateNodeResults(allNodes);
  }

  if(ddRel !== null && ddRel.length >0){
    ddRel = deduplicateRelResults(ddRel);

    var boundObj = mergeBoundaries(ddRel, ddNode);

    var dataObj = {};
    // dataObj.node = ddNode;
    dataObj.node = boundObj.nodes;
    // dataObj.nodeto = ddNodeTo;
    dataObj.rel = boundObj.rels;
    dataObj.boundNodes = boundObj.boundary;

    // console.log('Deduped: \n',ddNode, ddNodeTo, ddRel);
    console.log('Deduped: \n',dataObj);

    var entityString = JSON.stringify(dataObj);
    pasteToEditor(entityString);


    if(ddNode === null && ddNode.length < 1){
        searchColResults.append("No results found");
    }

  }
}


function mergeBoundaries(rels, nodes){
  let boundRel = rels.filter(obj => {
      return obj.Type === "BOUNDARY";
  });

  console.log("boundRels>>>>>>>", boundRel, nodes.length);
  
  var srdObj = {};

  for (var i=0; i<boundRel.length; i++){

      var bRel = boundRel[i];
      // remove Type=BOUNDARY rels
      rels = rels.filter(function(vRelStr, index, arr){ 
          var relStr = JSON.stringify(bRel);
          var vvRelStr = JSON.stringify(vRelStr);
          console.log("Is the same rel", relStr, vvRelStr);
          
          if(relStr!==vvRelStr){
              return bRel;
          }
      });

      // change type to %_Boundary

      var boundaryNodeIndex = nodes.findIndex((t) => {
          return t.Id === bRel.EndId && t.Props.alias === bRel.Props.to;
      });

      console.log("NODE TO RENAME Position>>> ", boundaryNodeIndex);
      if(typeof nodes[boundaryNodeIndex] !== "undefined"){
          if(nodes[boundaryNodeIndex].Labels[0].indexOf("_Boundary")<0){
              nodes[boundaryNodeIndex].Labels[0]=nodes[boundaryNodeIndex].Labels[0]+"_Boundary";
          }
      }
      
      console.log("RelBoundary3 >>>. ",bRel,bRel.EndId, Array.isArray(srdObj[bRel.EndId]));
  
      if(!Array.isArray(srdObj[bRel.EndId])) {
          srdObj[bRel.EndId.toString()] = [];
      }


      var resNode = nodes.filter(obj => {
          return obj.Id === bRel.StartId && obj.Props.alias === bRel.Props.from;
      });

      srdObj[bRel.EndId.toString()].push(resNode);

      nodes = nodes.filter(function(value, index, arr){ 
          var nodeStr = JSON.stringify(resNode[0]);
          var valueStr = JSON.stringify(value);
          console.log("Is the same Node", resNode[0], value, (nodeStr === valueStr));
          
          if(nodeStr!==valueStr){
              return resNode;
          }
      });

  }

  console.log("boundRelsEXIT>>>>>>>", srdObj, nodes.length);
  var retObj = {
      "boundary":srdObj,
      "nodes": nodes,
      "rels": rels,
  };

  return retObj;

}


function deduplicateNodeResults(rawResults){
  rawResults = rawResults.filter((elem, index, self) => self.findIndex(
      (t) => {return (t.Id === elem.Id && t.Label === elem.Label);}) === index);
  return rawResults;
}

function deduplicateRelResults(rawResults){
  rawResults = rawResults.filter((elem, index, self) => self.findIndex(
      (t) => {return (t.Id === elem.Id && t.Type === elem.Type);}) === index);
  return rawResults;
}

function renderResults(payload){
  if(payload._node === null){
    console.log("result Node is null");
    setResponseBadge("no");
    clearSearchResults();
  }else{
    clearSearchResults();
    setResponseBadge(payload._node.length+"");
    for (let i = 0; i < payload._node.length; i++) {
      var elemType = payload._node[i].Labels[0];
      var elemName = payload._node[i].Props.label;
      var elemAlias = payload._node[i].Props.alias;
      var elemDescr = payload._node[i].Props.descr;
      
      var entityString = JSON.stringify(payload._node[i]);
      
      newUpdateResults(entityString, elemAlias, elemType, elemName, elemDescr);
      updateEventlistner(elemAlias);
    }
  }
}

function clearSearchResults(){
  searchResults.innerHTML="";
}

function rmComma(string){
  string = string.substring(1);
  string = string.slice(0, -1);
  return string;
}


function buildPumlElement(obj, type){
  var elemArr = [];

  if(type === "Node"){
      var pumlString = "";
      console.log("OBJECT >>>> ", obj, obj.Props);
      var elemType = obj.Labels[0];
      var elemAlias = obj.Props.alias;
      var elemLabel = obj.Props.label;
      var elemTechn = obj.Props.techn;
      var elemDescr = obj.Props.descr;
  
      // var elemArr = []
      elemArr = pshToArr(elemArr,elemAlias);
      elemArr = pshToArr(elemArr,elemLabel);
      elemArr = pshToArr(elemArr,elemTechn);
      elemArr = pshToArr(elemArr,elemDescr);
      console.log("Array >>>>", elemArr);

      pumlString = elemType + "(" + elemArr.join() + ")";
  }else{
      
      var pumlString = "";
      console.log("REL >>>> ", obj, obj.Props);
      var elemType = obj.Type;

      elemArr = pshToArr(elemArr,obj.Props.from);
      elemArr = pshToArr(elemArr,obj.Props.to);
      elemArr = pshToArr(elemArr,obj.Props.label);

      if(obj.Props.techn !== "Undefined" && typeof obj.Props.techn !== "undefined"){
          elemArr = pshToArr(elemArr,obj.Props.techn);
      }

      if(obj.Props.descr !== "Undefined" && typeof obj.Props.descr !== "undefined"){
          elemArr = pshToArr(elemArr,obj.Props.descr);
      }
      
      console.log("Array >>>>", elemArr);
      pumlString = elemType + "(" + elemArr.join() + ")";
  }

  return pumlString.toString();
}

function pshToArr(arr,objProp){
  console.log("Prop >>>>", objProp);
  if(objProp !== undefined){
      if (objProp === ""){
          objProp='""';
      }
      arr.push(objProp);
      console.log("Prop ARR >>>>", arr, objProp);
      return arr;
  }
  return arr;
}

function proceedMultipleElements(objString){
  var finalString = "";
  var obj = JSON.parse(objString);
  
  console.log("Entry", obj, obj.node);
  if (typeof obj.node === "undefined"){
      console.log("Single");
      finalString = buildPumlElement(obj, "Node");
      return finalString;
  } else {
      console.log("Multi", obj.node.length);
      finalString = "' Nodes \n";
      var elemString = "";

      for (let i = 0; i < obj.node.length; i++) {
          const elem = obj.node[i];
          console.log("NodeTo >>>>>>>", elem);
          elemString = buildPumlElement(elem, "Node");
          if(Array.isArray(obj.boundNodes[elem.Id.toString()])){
              //this is boundary element
              elemString = elemString + "{\n";

              var bArr = obj.boundNodes[elem.Id.toString()];
              console.log("BOUNDED ELEMENT >>>",bArr[0], "Parent", elem);
              for (let c = 0; c < bArr.length; c++) {
                  var bnodes = bArr[c];
                  elemString = elemString + "\t" + buildPumlElement(bnodes[0], "Node") + "\n";
              }

              elemString = elemString + "}";
          }
          finalString = finalString + elemString+"\n";
      }

      finalString = finalString + "\n\n' Rels \n";
      for (let i = 0; i < obj.rel.length; i++) {
          const elem = obj.rel[i];
          console.log("REL >>>>>>>", elem);
          elemString = buildPumlElement(elem, "Rel");
          finalString = finalString + elemString+"\n";
      }  
      
      return finalString; 
  } 
}

function pasteToEditor(data){
  let finalElem = proceedMultipleElements(data);
  console.log("Oigin paste to editor: ",finalElem);
  vscode.postMessage({
    command: "paste",
    payload: finalElem
  });
}

function updateEventlistner(elemAliasId){
  var elemId = document.getElementById(elemAliasId);
  if(elemId){
    elemId.addEventListener('click',function(){
        console.log("Clicked >>>>>", this.getAttribute('aria-data'));
        let elemData = this.getAttribute('aria-data');
        pasteToEditor(elemData);
    });
  }

  var originId = document.getElementById(elemAliasId+"_origin");
  if(originId){
    originId.addEventListener('click',function(){
        console.log("Clicked >>>>>", this.getAttribute('aria-data'));
        let elemData = this.getAttribute('aria-data');
        vscode.postMessage({
          command: "searchOrigin",
          payload: elemData
        });
    });
  }

  var neighborId = document.getElementById(elemAliasId+"_neighbor");
  if(neighborId){
    neighborId.addEventListener('click',function(){
        console.log("Clicked >>>>>", this.getAttribute('aria-data'));
        let elemData = this.getAttribute('aria-data');
        vscode.postMessage({
          command: "searchNeighbor",
          payload: elemData
        });
    });
  }  
}

function newUpdateResults(entityString, elemAlias, elemType, elemName, elemDescr){

  var card = document.createElement('section');
  card.classList.add("results-container");

  var butCard = document.createElement('div');

  var cardTags = document.createElement('div');
  var tagAlias = document.createElement('vscode-tag');
  var tagType  = document.createElement('vscode-tag');
  tagAlias.append("Alias: "+elemAlias);
  tagType.append("Type: "+elemType); 
  cardTags.append(tagType);
  cardTags.append(tagAlias);

  var nodeButton = document.createElement('vscode-button');
  nodeButton.append("Node");
  nodeButton.setAttribute('id',elemAlias);
  nodeButton.setAttribute('aria-data',entityString);

  var originButton = document.createElement('vscode-button');
  originButton.append("Origin");
  originButton.setAttribute('id',elemAlias+"_origin");
  var originVal = JSON.parse(entityString);
  if(typeof(originVal.Props.origin) === "undefined"){
    originButton.setAttribute('disabled','disabled');
  }else{
    originButton.setAttribute('aria-data',originVal.Props.origin);
  }

  var neighborButton = document.createElement('vscode-button');
  neighborButton.append("Neighbor");
  neighborButton.setAttribute('id',elemAlias+"_neighbor");
  var entityObj = JSON.parse(entityString);
  var neighborStr = JSON.stringify({"Id":entityObj.Id,"alias":elemAlias,"type":elemType});
  neighborButton.setAttribute('aria-data',neighborStr);

  var cardBody = document.createElement('div');
  cardBody.classList.add("card-body");

  var cardBodyTitle = document.createElement('h3');
  cardBodyTitle.classList.add('card-title');
  cardBodyTitle.append(rmComma(elemName));

  var cardBodyText = document.createElement('p');
  cardBodyText.classList.add('card-text');
  cardBodyText.append(rmComma(elemDescr));

  cardBody.append(cardBodyTitle);
  cardBody.append(cardBodyText);

  butCard.append(cardBody);
  butCard.append(cardTags);
  var divider = document.createElement('vscode-divider');
  butCard.append(divider);
  butCard.append(nodeButton);
  butCard.append(originButton);
  butCard.append(neighborButton);
  

  card.append(butCard);

  searchResults.append(card);
  var butBr = document.createElement('br');
  searchResults.append(butBr);

}