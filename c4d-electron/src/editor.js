var ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;

var autocomplete = require('autocompleter');
var fs = require('fs');
// var altIcon = require('./altIcon.js');
const path = require('path');
const amdLoader = require('./node_modules/monaco-editor/min/vs/loader.js');
const amdRequire = amdLoader.require;
const amdDefine = amdLoader.require.define;
const request = require('request');
const marked = require('marked');
const hljs = require('highlight.js');
const etree = require('electron-tree-view');
var plantumlEncoder = require('plantuml-encoder')
var Split = require('split.js')
const { v4: uuidv4 } = require('uuid');
// var scriptsDir = path.join(__dirname,'scripts');
var pumlServerURL = 'http://localhost:8088/svg/';
var c4CollectionURL = 'http://localhost:3334/api/v1/nodes';
var c4CollectionURLBase = 'http://localhost:3334/api/v1';


const store = require('electron-settings');
const dirTree = require("directory-tree");

var searchField = document.getElementById("searchfield");
var searchCol = document.getElementById("search-col");
var searchColResults = document.getElementById("search-col-results");
var searchContainer = document.getElementById('input');
var hoverDiv = document.getElementById('hover');
var previewContainer = document.getElementById('preview');
var fileView = document.getElementById('file-view');
var previewContainerZout = document.getElementById('svg-zoom-out');
var previewContainerZin = document.getElementById('svg-zoom-in');
var previewReload = document.getElementById('preview-reload');
var openFolderBtn = document.getElementById('open-folder-btn');
var refreshTimeoutBar = document.getElementById('refresh-timeout-bar');
var newFileBtn = document.getElementById('new-file');
var newProjectBtn = document.getElementById('create-new-project');
var newProjectName = document.getElementById('np-name');
var newProjectMDFlag = document.getElementById('np-md-flag');
var newProjectPUMLFlag = document.getElementById('np-puml-flag');

// var newADRModal = document.getElementById('myModal')
// var newADRBtn = document.getElementById('new-project-btn')

// newADRModal.addEventListener('shown.bs.modal', function () {
//   newADRBtn.focus()
// })

searchCol.addEventListener('keyup', () => searchRouter(searchCol.value))

var previewZoomVal = 1
var previewFileExt = ".puml"
var currentFilePath = ""
var previewTreshhold = 2000

var previewInterval = setTimeout(getPreview, previewTreshhold);
var previewBarInterval = setInterval(updateTimeoutBar, 1000);


Split(['#left-col', '#center-col', '#right-col'], {
    sizes: [20,40,40],
    minSize: 150,
    gutterSize: 4,
    cursor: 'col-resize'
})

newFileBtn.addEventListener('click',function(){
    clearEditor();
})

newProjectBtn.addEventListener('click',function(){
    createProject(newProjectName,newProjectMDFlag, newProjectPUMLFlag);
})

openFolderBtn.addEventListener('click',function(){
    console.log("open clicked");
    ipc.send('open-folder-dialog');
})

previewContainerZout.addEventListener('click',function(){
    console.log("out clicked");
    svgZoom('out')
})

previewContainerZin.addEventListener('click',function(){
    console.log("in clicked");
    svgZoom('in')
})

previewReload.addEventListener('click',function(){
    console.log("reload clicked");
    getPreview()
})


// window.prefs = {}
var myPreferences = {}
myPreferences.workDir = "none";
myPreferences.pumlServerURL = 'http://localhost:8088/svg/';
myPreferences.c4CollectionURLBase = 'http://localhost:3334/api/v1';

window.tree = {}

/* -- fucntions */

function createProject(pName,mdFlag, pumlFlag){
    console.log("Create Project >>>>> ",typeof pName.value,pName.value,mdFlag.checked, pumlFlag.checked);
    if(pName.value != "" && pName.value != null && typeof pName.value != "undefined"){
        var myPreferences = store.getSync('preferences');
        var dir = path.join(myPreferences.workDir,pName.value);

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        var mdFile = path.join(dir,'MADR.md');
        var pumlFile = path.join(dir,'ADR.puml');

        if(pumlFlag.checked){
            fs.writeFileSync(pumlFile, 'Bob -> Alice : Hi!');
        }
        if(mdFlag.checked){
            fs.writeFileSync(mdFile, '# ADR template');
        }
        infoTitle("New folder created successfully");
        updateTree(dir);
    }else {
        errorTitle("Error while creating a new project")
    }
    
}

function setPrefs(prefsObj){
  store.setSync('preferences',prefsObj);
  return true;
}

function editPrefs(){
    var prefFile = store.file()
    currentFilePath = prefFile
    previewFileExt = ".json"
    openFile(prefFile)
}

function getPrefs(){
  myPreferences = store.getSync('preferences');
  if(myPreferences == "" || typeof myPreferences == "undefined"){
    myPreferences = {}
    myPreferences.workDir = "none";
    myPreferences.pumlServerURL = 'http://localhost:8088/svg/';
    myPreferences.c4CollectionURLBase = 'http://localhost:3334/api/v1';
    setPrefs(myPreferences);
  }
  if(myPreferences.workDir != "none"  || typeof myPreferences.workDir != "undefined"){
      console.log("FOLDER >>>>>", myPreferences.workDir);
      openFolder(myPreferences.workDir)
    //   chooseFolder(myPreferences.workDir);
  }
  console.log("TYPEOF >>>>", typeof  myPreferences.pumlServerURL);
  if( myPreferences.pumlServerURL != "" || typeof  myPreferences.pumlServerURL != "undefined"){
    pumlServerURL = myPreferences.pumlServerURL;
  } 
  if( myPreferences.c4CollectionURLBase != "" || typeof  myPreferences.c4CollectionURLBase != "undefined"){
    c4CollectionURLBase = myPreferences.c4CollectionURLBase;
  }
  console.log("getPrefs >>>>", myPreferences, store.file());
  return myPreferences;
}

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

function svgZoom(action){
    
    var step = 0.25

    switch (action) {
        case 'in':
            previewZoomVal = previewZoomVal+step
            if(previewZoomVal >= (step*2)){
                previewContainerZout.removeAttribute('disabled')
            }
            break;

        case 'out':
            previewZoomVal = previewZoomVal-step
            if(previewZoomVal <= step){
                previewZoomVal = step
                previewContainerZout.setAttribute('disabled','disabled')
            }

            break;
    }
    
    var svgElem = previewContainer.firstElementChild
    svgElem.style.setProperty('zoom',previewZoomVal)
}

// function getScriptsList(){

//     var embedScripts = getScripts(scriptsDir); 
//     var externalScripts = [];
//     var completeListScripts = [];
//     window.prefs = getPrefs();

//     console.log("Embed scripts >>> ",embedScripts);

//     if(window.prefs.workDir != "none" && typeof window.prefs.workDir != "undefined"){
//         var dir = window.prefs.workDir;
//         var externalScripts = getScripts(dir); 
//         console.log("External scripts >>> ",externalScripts);
//     }

//     completeListScripts = embedScripts.concat(externalScripts)
//     return completeListScripts;
// }

// function getScripts(dir){
//     var allScripts = []
//     var files = fs.readdirSync(dir);

//     for (let i = 0; i < files.length; i++) {
//         var file = files[i]
//         var pathToFile = path.join(dir,file);
//         if(!fs.lstatSync(pathToFile).isDirectory()){
//             var contents = fs.readFileSync(pathToFile, 'utf8');

//             if(file.indexOf('.js') >= 0 ){
//                 var infoStr = contents.substring(
//                     contents.indexOf("/**") + 3,
//                     contents.indexOf("**/")
//                 );
//                 var infoObj = JSON.parse(infoStr);

//                 infoObj.fileName = file;
//                 infoObj.altIcon = altIcon.iconReplace(infoObj.icon);
//                 if(dir != scriptsDir) {
//                     infoObj.isExt = true;
//                 }else{
//                     infoObj.isExt = false;
//                 }
//                 allScripts.push(infoObj)
//             }
//         }
//     }

//     return allScripts;
// }

function deduplicateNodeResults(rawResults){
    rawResults = rawResults.filter((elem, index, self) => self.findIndex(
        (t) => {return (t.Id === elem.Id && t.Label === elem.Label)}) === index)
    return rawResults;
}

function deduplicateRelResults(rawResults){
    rawResults = rawResults.filter((elem, index, self) => self.findIndex(
        (t) => {return (t.Id === elem.Id && t.Type === elem.Type)}) === index)
    return rawResults;
}

function mergeBoundaries(Rels, Nodes){
    let boundRel = Rels.filter(obj => {
        return obj.Type === "BOUNDARY"
    })

    console.log("boundRels>>>>>>>", boundRel, Nodes.length)
    
    var srdObj = {}

    for (var i=0; i<boundRel.length; i++){

        var bRel = boundRel[i];
        // remove Type=BOUNDARY rels
        Rels = Rels.filter(function(vRelStr, index, arr){ 
            var relStr = JSON.stringify(bRel);
            var vvRelStr = JSON.stringify(vRelStr);
            console.log("Is the same rel", relStr, vvRelStr);
            
            if(relStr!==vvRelStr){
                return bRel
            }
        });

        // change type to %_Boundary
        // var boundaryNode = Nodes.filter((obj, index, self) => {

        //     return obj.Id === bRel.EndId && obj.Props.alias == bRel.Props.to
        // })

        // boundaryNode[0].Labels[0] = boundaryNode[0].Labels[0] + "_Boundary";
    
       

        var boundaryNodeIndex = Nodes.findIndex((t) => {
            return t.Id === bRel.EndId && t.Props.alias == bRel.Props.to
        })

        console.log("NODE TO RENAME Position>>> ", boundaryNodeIndex)
        if(typeof Nodes[boundaryNodeIndex] != "undefined"){
            if(Nodes[boundaryNodeIndex].Labels[0].indexOf("_Boundary")<0){
                Nodes[boundaryNodeIndex].Labels[0]=Nodes[boundaryNodeIndex].Labels[0]+"_Boundary";
            }
        }


        // Nodes = Nodes.filter((obj, index, self) => self.findIndex(
        //     (t) => { obj.Labels[0] = obj.Labels[0]+"_Boundary"; return (obj.Id === bRel.EndId && obj.Props.alias == bRel.Props.to)}) === index)

        
        console.log("RelBoundary3 >>>. ",bRel,bRel.EndId, Array.isArray(srdObj[bRel.EndId]))
    
        if(!Array.isArray(srdObj[bRel.EndId])) {
            srdObj[bRel.EndId.toString()] = []
        }


        var resNode = Nodes.filter(obj => {
            return obj.Id === bRel.StartId && obj.Props.alias == bRel.Props.from
        })

        srdObj[bRel.EndId.toString()].push(resNode)

        Nodes = Nodes.filter(function(value, index, arr){ 
            var nodeStr = JSON.stringify(resNode[0]);
            var valueStr = JSON.stringify(value);
            console.log("Is the same Node", resNode[0], value, (nodeStr==valueStr));
            
            if(nodeStr!==valueStr){
                return resNode
            }
        });

    }

    console.log("boundRelsEXIT>>>>>>>", srdObj, Nodes.length)
    var retObj = {
        "Boundary":srdObj,
        "Nodes": Nodes,
        "Rels": Rels,
    }

    return retObj;

}

function restoreTitle(){
    document.getElementById('pasteInfo').style.background='rgb(41, 41, 41)'
    document.getElementById('pasteInfo').textContent="Press Alt+H to get started"
}
function infoTitle(text){
    document.getElementById('pasteInfo').style.background='rgb(41,107,177)'
    document.getElementById('pasteInfo').textContent=text
}
function errorTitle(text){
    document.getElementById('pasteInfo').style.background='#bc6c25'
    document.getElementById('pasteInfo').textContent=text
}

// function executeSnippet(snippet){
//     restoreTitle();
//     var selectedStr = window.editor.getModel().getValueInRange(window.editor.getSelection())
//     var wholeValue = window.editor.getValue()
//     var selected = true;
//     if(selectedStr == ""){
//         selectedStr = wholeValue;
//         selected = false;
//     }
//     var snippetPath = "";
//     if(snippet.isExt){
//         var prefs = getPrefs();
//         snippetPath = path.join(prefs.workDir,snippet.fileName);
//     }else{
//         snippetPath = path.join(scriptsDir,snippet.fileName);
//     }

//     var input = {};
//     input.text = selectedStr;
//     input.fullText = wholeValue;
//     input.postInfo = function (text){
//         infoTitle(text)
//     }
//     input.postError = function(text){
//         errorTitle(text)
//     }

//     var snippet = require(snippetPath).main;
//     var result = snippet(input);

//     if(typeof result != "undefined"){
//         if(selected == true){
//             var selection = window.editor.getSelection()
//             window.editor.executeEdits('', [{ range: selection, text: result.toString() }])
//         }else{
//             window.editor.getModel().setValue(result.toString())
//         }
//     }
// }





// function searchSnippet(toSearch){
//     var results = [];
//     var objects = window.scriptList;
//     var key;
//     for(var i=0; i<objects.length; i++) {
//         for(key in objects[i]) {
//             var _temp_str = (objects[i][key]).toString().toLowerCase();
//             if(_temp_str.indexOf(toSearch)!=-1) {
//                 results.push(objects[i]);
//             }
//         }
//     }

//     var dedupResults = deduplicateResults(results)
//     return dedupResults;
// }

function searchRouter(toSearch){
    var qTypeArr = toSearch.split(':');
    if (qTypeArr.length <= 1){
        searchNode(toSearch);
    }else{
        switch (qTypeArr[0]) {
            case 'git':
                searchGitAttr(qTypeArr[1]);
                break;
        
            default:
                searchNode(toSearch);
                break;
        }
    }
}

function searchGitAttr(toSearch){
    if(toSearch.length < 3){
        return;
    }
    var srvUrl = c4CollectionURLBase+'/repo'
    console.log("GIT-ONCHANGE!!!", srvUrl);
    var qString = { qstring: toSearch };
    request({ 
        followAllRedirects: true,
        headers: {
        'X-Requested-With': 'XMLHttpRequest' },
        method: 'GET',
        url: srvUrl, qs: qString}, callback);
    
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var resBody = JSON.parse(body);
                searchColResults.innerHTML=""
                console.log('Success: \n',resBody);
                
                var ddNode = resBody["_node"]
                var ddNodeTo = resBody["_nodeto"]
                var ddRel = resBody["_rel"]

                var allNodes = ddNode.concat(ddNodeTo)


                if(ddNode !== null && ddNode.length >0){
                    ddNode = deduplicateNodeResults(allNodes)
                }
                // if(ddNodeTo !== null && ddNodeTo.length >0){
                //     ddNodeTo = deduplicateNodeResults(resBody["_nodeto"])
                // }
                if(ddRel !== null && ddRel.length >0){
                    ddRel = deduplicateRelResults(resBody["_rel"])
                }

                var boundObj = mergeBoundaries(ddRel, ddNode)
                

                var dataObj = {}
                // dataObj.node = ddNode;
                dataObj.node = boundObj.Nodes;
                // dataObj.nodeto = ddNodeTo;
                dataObj.rel = boundObj.Rels;
                dataObj.boundNodes = boundObj.Boundary;

                // console.log('Deduped: \n',ddNode, ddNodeTo, ddRel);
                console.log('Deduped: \n',dataObj);

                var entityString = JSON.stringify(dataObj);
                var uid = uuidv4()
                updateResults(entityString, "git"+uid, "repository", resBody["_node"][0].Props.git, "")
                updateEventlistner("git"+uid)

                if(ddNode === null && ddNode.length < 1){
                    searchColResults.append("No results found")
                }
    
            } else {
                console.log("Error1: \n",body, response);
            }
            return body
        };

}

function searchNode(toSearch){
    if(toSearch.length < 3){
        return;
    }
    var srvUrl = c4CollectionURLBase+'/nodes'
    console.log("ONCHANGE!!!", srvUrl);
    var qString = { qstring: toSearch };
    request({ 
        followAllRedirects: true,
        headers: {
        'X-Requested-With': 'XMLHttpRequest' },
        method: 'GET',
        url: srvUrl, qs: qString}, callback);

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var resBody = JSON.parse(body);
            searchColResults.innerHTML=""
            console.log('Success: \n',resBody);
            // if(resBody !== null || typeof resBody['_node'] != "undefined" && (resBody['_node'].hasOwnProperty('length') && resBody['_node'].length >0)){
            if(resBody !== null && typeof resBody['_node'] != "undefined" && resBody['_node']!=null){
                resBody = resBody['_node']
                for (let i = 0; i < resBody.length; i++) {
                    var elemType = resBody[i].Labels[0];
                    var elemName = resBody[i].Props.label;
                    var elemAlias = resBody[i].Props.alias;
                    var elemDescr = resBody[i].Props.descr;
                    
                    var entityString = JSON.stringify(resBody[i]);
                    
                    updateResults(entityString, elemAlias, elemType, elemName, elemDescr)

                    updateEventlistner(elemAlias)
                }
            } else {
                searchColResults.append("No results found")
            }

        } else {
            console.log("Error2: \n",body, response);
        }
        return body
    };
}

function updateResults(entityString, elemAlias, elemType, elemName, elemDescr){
    var button = document.createElement('button')
    button.setAttribute('type','button');
    button.setAttribute('aria-data',entityString)
    button.setAttribute('aria-current','true')
    button.classList.add("list-group-item")
    button.classList.add("list-group-item-action")
    button.classList.add("zeropm")
    button.setAttribute('id',elemAlias)


    var butDiv = document.createElement('div')
    butDiv.classList.add('me-auto')

    var butCard = document.createElement('div')
    butCard.classList.add('card')
    butCard.classList.add('text-dark')
    butCard.classList.add('bg-warning')
    butCard.classList.add('me-auto')

    var cardHead = document.createElement('div')
    cardHead.classList.add('card-header')
    cardHead.append(elemType + ' ['+ elemAlias + ']')

    var cardBody = document.createElement('div')
    cardBody.classList.add("card-body")

    var cardBodyTitle = document.createElement('h5')
    cardBodyTitle.classList.add('card-title')
    cardBodyTitle.append(elemName)

    var cardBodyText = document.createElement('p')
    cardBodyText.classList.add('card-text')
    cardBodyText.append(elemDescr)

    cardBody.append(cardBodyTitle)
    cardBody.append(cardBodyText)

    butCard.append(cardHead)
    butCard.append(cardBody)

    butDiv.append(butCard)
    button.append(butDiv)

    searchColResults.append(button)

}

function showInput(){
    searchContainer.style.display="block";
    hoverDiv.style.display="block";
    searchField.focus();
}

function hideInput(){
    searchContainer.style.display="none";
    hoverDiv.style.display="none";
    searchField.value = "";
}

function chooseFolder(dir){
    console.log("ORIGINAL PREFS >>>", window.prefs)
    myPreferences['workDir'] = dir.filePaths[0].toString()
    console.log("CHANGED PREFS >>>", window.prefs)
    setPrefs(myPreferences)
    // console.log("Get Prefs >>", getPrefs());
}

function saveFile(){
    var data = window.editor.getValue()
    if(currentFilePath != ""){
        fs.writeFileSync(currentFilePath, data);
    }else{
        ipc.send('open-save-as-dialog');
    }
}
function saveFileAs(fpath){
    currentFilePath = fpath;
    var data = window.editor.getValue()
    fs.writeFileSync(fpath, data);
    // openFolder(path.dirname(fpath))
    updateTree(path.dirname(fpath))
}

function updateTree(dir){
    console.log("update triggered!!!", dir, tree);
    const root = dirTree(dir);
    console.log("TREE", root);

    window.tree.loop.update({ root })
}


function initTreeView(root){
    window.tree = etree({
        root,
        container: document.getElementById('file-view'),
        children: c => c.children,
        label: c => c.name
    })
      
    window.tree.on('selected', item => {
        console.log('item selected',item)

        if(item.children === undefined){
            var fileExt = path.extname(item.path).toLowerCase()
            console.log("File Ext>>>", fileExt);
            previewFileExt = fileExt
            currentFilePath = item.path

            openFile(item.path)
        }

    })
}

function openFile(filePath){
    try {
        console.log("PATH >>>>", filePath);
        const data = fs.readFileSync(filePath, 'utf8')
        var ext = path.extname(filePath).toLowerCase()
        console.log("fileExt >>>", ext);
        if(ext == ".json"){
            var oJson = JSON.parse(data);  
            var bJson = JSON.stringify(oJson, null, "\t");
            window.editor.getModel().setValue(bJson)

        } else {
            window.editor.getModel().setValue(data.toString())
        }
        
    } catch (err) {
        console.error(err)
    }
}

function openFolder(dir){
    console.log("OpenFolder triggered!!!", dir);
    const root = dirTree(dir);
    console.log("TREE", root);
    fileView.innerHTML=""

    initTreeView(root);
}

/* -- event listeners */

hoverDiv.addEventListener('click', function(){
    hideInput();
})

function updateEventlistner(elemAliasId){
    var elemId = document.getElementById(elemAliasId);
    elemId.addEventListener('click',function(){
        console.log("Clicked >>>>>", this.getAttribute('aria-data'))
        proceedMultipleElements(this.getAttribute('aria-data'))
    })

}

/* -- draw element */

function proceedMultipleElements(objString){
    var finalString = "";
    var obj = JSON.parse(objString)
    console.log("Entry", obj, obj.node);
    if (typeof obj.node == "undefined"){
        console.log("Single");
        finalString = buildPumlElement(obj, "Node");
        addToEditor(finalString)
    } else {
        console.log("Multi", obj.node.length);
        finalString = "' Nodes \n";

        for (let i = 0; i < obj.node.length; i++) {
            const elem = obj.node[i];
            console.log("NodeTo >>>>>>>", elem)
            elemString = buildPumlElement(elem, "Node");
            if(Array.isArray(obj.boundNodes[elem.Id.toString()])){
                //this is boundary element
                elemString = elemString + "{\n";

                var bArr = obj.boundNodes[elem.Id.toString()]
                console.log("BOUNDED ELEMENT >>>",bArr[0], "Parent", elem);
                for (let c = 0; c < bArr.length; c++) {
                    var bnodes = bArr[c];
                    elemString = elemString + "\t" + buildPumlElement(bnodes[0], "Node") + "\n";
                }

                elemString = elemString + "}";
            }
            finalString = finalString + elemString+"\n";
            addToEditor(finalString)
        }

        finalString = finalString + "\n\n' Rels \n";
        for (let i = 0; i < obj.rel.length; i++) {
            const elem = obj.rel[i];
            console.log("REL >>>>>>>", elem)
            elemString = buildPumlElement(elem, "Rel");
            finalString = finalString + elemString+"\n";
            addToEditor(finalString)
        }

        
    }

    
}

function addToEditor(finalString){
    console.log("FINAL STRING >>>>>>>>>", finalString);
    var selection = window.editor.getSelection()
    window.editor.executeEdits('', [{ range: selection, text: finalString.toString() }])
}

function buildPumlElement(obj, type){
    var elemArr = []

    if(type == "Node"){
        var pumlString = ""
        console.log("OBJECT >>>> ", obj, obj.Props)
        var elemType = obj.Labels[0]
        var elemAlias = obj.Props.alias
        var elemLabel = obj.Props.label
        var elemTechn = obj.Props.techn
        var elemDescr = obj.Props.descr
    
        // var elemArr = []
        elemArr = pshToArr(elemArr,elemAlias)
        elemArr = pshToArr(elemArr,elemLabel)
        elemArr = pshToArr(elemArr,elemTechn)
        elemArr = pshToArr(elemArr,elemDescr)
        console.log("Array >>>>", elemArr)

        pumlString = elemType + "(" + elemArr.join() + ")"
    }else{
        
        var pumlString = ""
        console.log("REL >>>> ", obj, obj.Props)
        var elemType = obj.Type
 
        elemArr = pshToArr(elemArr,obj.Props.from)
        elemArr = pshToArr(elemArr,obj.Props.to)
        elemArr = pshToArr(elemArr,obj.Props.label)

        if(obj.Props.techn != "Undefined" && typeof obj.Props.techn != "undefined"){
            elemArr = pshToArr(elemArr,obj.Props.techn)
        }

        if(obj.Props.descr != "Undefined" && typeof obj.Props.descr != "undefined"){
            elemArr = pshToArr(elemArr,obj.Props.descr)
        }
        
        console.log("Array >>>>", elemArr)
        pumlString = elemType + "(" + elemArr.join() + ")"
    }
    
    // switch (type) {
    //     case "Nodes":
            
    //         // break;

    //     case "Rel":
    //         // Rel_Back(email_system, backend_api, "Sends e-mails using", "sync, SMTP")
            
            
    //         // break;
    // }
    // var obj = JSON.parse(objString)
    return pumlString.toString();
    
    
   

    
}

function pshToArr(arr,objProp){
    console.log("Prop >>>>", objProp)
    if(objProp !== undefined){
        if (objProp == ""){
            objProp='""'
        }
        arr.push(objProp)
        console.log("Prop ARR >>>>", arr, objProp)
        return arr
    }
    return arr
}

/* -- monaco init */

amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, 'node_modules/monaco-editor/min'))
});

// workaround monaco-css not understanding the environment
self.module = undefined;

amdRequire(['vs/editor/editor.main'], function () {
    window.editor = monaco.editor.create(document.getElementById('container'), {
        theme: 'vs-dark',
        language: "dart",
        automaticLayout: true,
        tabIndex: -1,
        fontSize: "15.5rem",
        minimap: {
            enabled: false
        },
        scrollbar: {
            verticalScrollbarSize: 5
        },
        value: "@startuml Basic Sample \n!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml\n\nPerson(admin, \"Administrator\")\nSystem_Boundary(c1, \"Sample System\") {\n    Container(web_app, \"Web Application\", \"C#, ASP.NET Core 2.1 MVC\", \"Allows users to compare multiple Twitter timelines\")\n}\n\nSystem(twitter, \"Twitter\")\nRel(admin, web_app, \"Uses\",\ \"HTTPS\")\nRel(web_app, twitter, \"Gets tweets from\", \"HTTPS\")\n@enduml",
        suggest: {
            showClasses: false,
            showColors: false,
            showConstants: false,
            showConstructors: false,
            showEnumMembers: false,
            showEnums: false,
            showEvents: false,
            showFields: false,
            showFiles: false,
            showFolders: false,
            showFunctions: false,
            showIcons: false,
            showInterfaces: false,
            showIssues: false,
            showKeywords: false,
            showMethods: false,
            showModules: false,
            showOperators: false,
            showProperties: false,
            showReferences: false,
            showSnippets: false,
            showStructs: false,
            showTypeParameters: false,
            showUnits: false,
            showUsers: false,
            showValues: false,
            showVariables: false,
            showWords: false
        }
    });

    window.editor.getModel().onDidChangeContent((event) => {
        previewTreshhold = 2000
        resetBarAndTimer();
        previewBarInterval = setInterval(updateTimeoutBar, 50);
        previewInterval = setTimeout(getPreview, previewTreshhold);

        
        updateTimeoutBar();
    });
});

function updateTimeoutBar(){
    var currBarValue = Number((refreshTimeoutBar.style.width).split('%').join(""))
    if (currBarValue > 2) {
        refreshTimeoutBar.style.width = (currBarValue-3)+"%"
    }
}

function resetBarAndTimer(){
    clearInterval(previewInterval);
    clearInterval(previewBarInterval);
    refreshTimeoutBar.style.width = "100%"
}

function getPreview(){
    previewZoomVal = 1
    resetBarAndTimer();
    switch (previewFileExt) {
        case '.puml':
            previewContainerZout.removeAttribute('disabled')
            previewContainerZin.removeAttribute('disabled')
            redrawPuml();
            break;
        case '.md':
            previewContainerZout.setAttribute('disabled','disabled')
            previewContainerZin.setAttribute('disabled','disabled')
            redrawMarkdown();
            break;
        default:
            stubPreview();
            break;
    }
}

function stubPreview(){
    previewContainer.innerHTML='<span><i class="far fa-eye-slash fa-5x"></i><span><br/>Preview is disabled for this type of file'
}

function redrawMarkdown(){
    previewContainer.classList.remove("previewAlign")
    var wholeValue = window.editor.getValue()
    marked.setOptions({
        gfm: true,
        highlight: function(code, lang) {
            console.log("HIGHLIGHT callin");
            return hljs.highlightAuto(code).value;
        }
    });

    previewContainer.innerHTML='<div class="md-preview"><pre class="v100-vertical">'+marked(wholeValue)+"</pre></div>";
    console.log("MARKED>>>", marked(wholeValue));
}

function redrawPuml(){
    previewContainer.classList.add("previewAlign")
    previewContainer.innerHTML="Preview in progress. Please wait ..."
    var wholeValue = window.editor.getValue()
    console.log("cahnged!!", wholeValue);
    var encoded = plantumlEncoder.encode(wholeValue)
    console.log(encoded) // SrJGjLDmibBmICt9oGS0
    
    var url = pumlServerURL + '' + encoded

    request({ 
            body: wholeValue, 
            followAllRedirects: true,
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest' },
            method: 'GET',
            url: url}, callback);

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('Success: \n', body);
            previewContainer.innerHTML=body
        } else {
            console.log("Error: \n");
            previewContainer.innerHTML=body
        }
    };
}

/* -- ipc */

ipc.on('key', (event, message) => {
    console.log(message)
    switch (message["cmd"]) {
        case 'file-save':
            saveFile();
            break; 
        
        case 'edit-prefs':
            editPrefs();
            break;

        case 'file-save-as':
            var fileStr = message["dir"].filePath.toString()
            saveFileAs(fileStr);
            console.log("SAVE AS NGAGED!!");
            break;

        case 'dir-open':
            var dirStr = message["dir"].filePaths[0].toString()
            openFolder(dirStr);
            chooseFolder(message["dir"]);
            break;

        case 'show-input':
            showInput();
            break;

        case 'ready':
            // restoreTitle();
            window.prefs  = getPrefs();
            console.log("PREFS ON START >>>", window.prefs);
            break;

        case 'hide-input':
            hideInput();
            break;
            // window.editor.updateOptions({readOnly: true});
        case 'clear':
            clearEditor();
            break;

        case 'select-working-dir':
            chooseFolder(message["dir"]);
            break;

        default:
            console.log("Floodgates open");
            break;
    }
})

function clearEditor(){
    window.editor.getModel().setValue("");
    currentFilePath = ""
}

/* -- autocomplete init */

// autocomplete({
//     input: searchCol,
//     className: "autocomplete-container",
//     render: function(item, currentValue) {
//         var divContainer = document.createElement("div");
//         divContainer.classList.add('suggest-item');
//         var iconContainer = document.createElement("div");
//         iconContainer.classList.add('child');
//         var icon = document.createElement("i");
//         icon.classList.add(item.altIcon.type);
//         var iconName = "fa-"+item.altIcon.name
//         icon.classList.add(iconName);
//         icon.classList.add('fa-lg');
//         icon.classList.add('suggest-icon');
//         iconContainer.appendChild(icon);
//         var textContainer = document.createElement("div");
//         textContainer.classList.add('child');
//         var title = document.createElement("div");
//         title.textContent = item.name
//         title.classList.add('suggest-title');
//         textContainer.appendChild(title);
//         var description = document.createElement("div");
//         description.textContent = item.description
//         description.classList.add('suggest-description');
//         textContainer.appendChild(description);
//         divContainer.appendChild(iconContainer);
//         divContainer.appendChild(textContainer);
//         return divContainer;
//     },
//     fetch: function(text, update) {
//         text = text.toLowerCase();
//         var suggestions = searchNode(text)
//         update(suggestions);
//     },
//     onSelect: function(item) {
//         input.value = item.name;
//         executeSnippet(item);
//         hideInput();
//         // window.editor.updateOptions({readOnly: false});
//     }
// });

// autocomplete({
//     input: searchField,
//     className: "autocomplete-container",
//     render: function(item, currentValue) {
//         var divContainer = document.createElement("div");
//         divContainer.classList.add('suggest-item');
//         var iconContainer = document.createElement("div");
//         iconContainer.classList.add('child');
//         var icon = document.createElement("i");
//         icon.classList.add(item.altIcon.type);
//         var iconName = "fa-"+item.altIcon.name
//         icon.classList.add(iconName);
//         icon.classList.add('fa-lg');
//         icon.classList.add('suggest-icon');
//         iconContainer.appendChild(icon);
//         var textContainer = document.createElement("div");
//         textContainer.classList.add('child');
//         var title = document.createElement("div");
//         title.textContent = item.name
//         title.classList.add('suggest-title');
//         textContainer.appendChild(title);
//         var description = document.createElement("div");
//         description.textContent = item.description
//         description.classList.add('suggest-description');
//         textContainer.appendChild(description);
//         divContainer.appendChild(iconContainer);
//         divContainer.appendChild(textContainer);
//         return divContainer;
//     },
//     fetch: function(text, update) {
//         text = text.toLowerCase();
//         var suggestions = searchSnippet(text)
//         update(suggestions);
//     },
//     onSelect: function(item) {
//         input.value = item.name;
//         executeSnippet(item);
//         hideInput();
//         // window.editor.updateOptions({readOnly: false});
//     }
// });
