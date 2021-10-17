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
// var scriptsDir = path.join(__dirname,'scripts');
var pumlServerURL = 'http://localhost:8088/svg/';
var c4CollectionURL = 'http://localhost:3334/api/v1/nodes';


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

searchCol.addEventListener('keyup', () => searchNode(searchCol.value))

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
myPreferences.c4CollectionURL = 'http://localhost:3334/api/v1/nodes';

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
    myPreferences.c4CollectionURL = 'http://localhost:3334/api/v1/nodes';
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
  if( myPreferences.c4CollectionURL != "" || typeof  myPreferences.c4CollectionURL != "undefined"){
    c4CollectionURL = myPreferences.c4CollectionURL;
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

// function deduplicateResults(rawResults){
//     rawResults = rawResults.filter((elem, index, self) => self.findIndex(
//         (t) => {return (t.name === elem.name && t.tags === elem.tags)}) === index)
//     return rawResults;
// }

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

function searchNode(toSearch){
    if(searchCol.value.length < 3){
        return;
    }
    console.log("ONCHANGE!!!");
    var qString = { qstring: toSearch };
    request({ 
        followAllRedirects: true,
        headers: {
        'X-Requested-With': 'XMLHttpRequest' },
        method: 'GET',
        url: c4CollectionURL, qs: qString}, callback);

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var resBody = JSON.parse(body);
            searchColResults.innerHTML=""
            console.log('Success: \n',resBody);
            if(resBody !== null && resBody.length >0){
                for (let i = 0; i < resBody.length; i++) {
                    var elemType = resBody[i].Labels[0];
                    var elemName = resBody[i].Props.label;
                    var elemAlias = resBody[i].Props.alias;
                    var elemDescr = resBody[i].Props.descr;


                    // <button type="button" class="list-group-item list-group-item-action zeropm" aria-current="true">
					// 				<div class="me-auto">
					// 				   <div class="card text-dark bg-warning me-auto">
					// 					   <div class="card-header">Header</div>
					// 					   <div class="card-body">
					// 						 <h5 class="card-title">Warning card title</h5>
					// 						 <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
					// 					   </div>
					// 					 </div>
					// 			</button>
                    
                    var entityString = JSON.stringify(resBody[i]);
                    
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

                    // butDiv.append(butCard)

                    cardBody.append(cardBodyTitle)
                    cardBody.append(cardBodyText)

                    butCard.append(cardHead)
                    butCard.append(cardBody)

                    butDiv.append(butCard)
                    button.append(butDiv)


                    // var butDivDiv = document.createElement('div')
                    // butDivDiv.classList.add('fw-bold')
                    // butDivDiv.append(elemName + ' ('+ elemAlias + ')')

                    // var butSpan = document.createElement('span')
                    // butSpan.classList.add('badge')
                    // butSpan.classList.add('bg-primary')
                    // butSpan.classList.add('rounded-pill')
                    // butSpan.append(elemType)


                    // butDiv.append(butDivDiv)
                    // butDiv.append(elemDescr)
                    // button.append(butDiv)
                    // button.append(butSpan)
                    
                    searchColResults.append(button)

                    updateEventlistner(elemAlias)
                }
            } else {
                searchColResults.append("No results found")
            }

        } else {
            console.log("Error: \n",body);
        }
        return body
    };
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
        buildPumlElement(this.getAttribute('aria-data'))
    })

}

/* -- draw element */

function buildPumlElement(objString){
    var obj = JSON.parse(objString)
    console.log("OBJECT >>>> ", obj, obj.Props)
    var elemType = obj.Labels[0]
    var elemAlias = obj.Props.alias
    var elemLabel = obj.Props.label
    var elemTechn = obj.Props.techn
    var elemDescr = obj.Props.descr

    var elemArr = []
    elemArr = pshToArr(elemArr,elemAlias)
    elemArr = pshToArr(elemArr,elemLabel)
    elemArr = pshToArr(elemArr,elemTechn)
    elemArr = pshToArr(elemArr,elemDescr)
    console.log("Array >>>>", elemArr)


    var pumlString = elemType + "(" + elemArr.join() + ")"
    // window.editor.trigger('keyboard', 'type', {text: ""+pumlString});
    var selection = window.editor.getSelection()
    window.editor.executeEdits('', [{ range: selection, text: pumlString.toString() }])
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
