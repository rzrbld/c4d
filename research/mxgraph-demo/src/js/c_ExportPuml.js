var alreadyBoundChecked = []


function dynamicSort(property, isReverse) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        if(isReverse){
            var result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
        }else{
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        }
        return result * sortOrder;
    }
}

function getPumlStringByType(nodes, xCellStyle, checkBounadary) {
    var c4Doc = ""
    for (let index = 0; index < nodes.length; index++) {
        // console.log(nodes, nodes[index])
        const node = nodes[index];
        // if(nodes[index].hasOwnProperty('id')){
            var nID = nodes[index].id
        // } 

        console.log("NNNNNNID >>> ", nID, alreadyBoundChecked)
        var nValue = nodes[index].getAttribute('value')
        
        var temp = document.createElement('div');
        temp.innerHTML = nValue;


        // console.log("TEMP >>>>", temp, xmlDoc)

        var Shape = temp.getElementsByTagName('div')[0].getAttribute('id')

        var c4Params = temp.firstChild.getElementsByClassName('C4Param')

        // console.log("C4Params >>> ", c4Params)

        var inputs = []
        var values = []

        var innerForm = ""

        // push all params names and values to array
        for (let i = 0; i < c4Params.length; i++) {
            const param = c4Params[i];

            inputs.push(c4Params[i].getAttribute('id'))
            values.push(c4Params[i].innerHTML)
        }

        var ComponentName = Shape.split('C4_').join("")
        var str = ""

        //system/system_ext quirk
        switch (ComponentName) {
            case "Rel":
            case "BiRel":
                /* strict mode comment this if you need "just draw it already" */
                // if(checkBounadary){
                //     if(xCellStyle.boundaries.objects.includes(xCellStyle.edges.params[nID].source)){
                //         console.log("REl in boundry")
                //         // xCellStyle.boundaries.edges.push(nID)
                //         if(typeof(xCellStyle.boundaries.edgeswn[xCellStyle.edges.params[nID].source])==='undefined'){
                //             xCellStyle.boundaries.edgeswn[xCellStyle.edges.params[nID].source] = []
                //         }
                //         xCellStyle.boundaries.edgeswn[xCellStyle.edges.params[nID].source].push(nID)
                //     } else {
                //         str += ComponentName+"("+xCellStyle.edges.params[nID].source+","+xCellStyle.edges.params[nID].target+","
                //     }
                // } else {
                //     str += ComponentName+"("+xCellStyle.edges.params[nID].source+","+xCellStyle.edges.params[nID].target+","
                // }
                str += ComponentName+"("+xCellStyle.edges.params[nID].source+","+xCellStyle.edges.params[nID].target+","
                /* uncomment string above, end if comment strict mode comment this if you need "just draw it already" */
                break;
            case "System":
            case "System_Ext":
            case "Person":
            case "Person_Ext":
                if(c4Params.length == 3){
                    values.splice(1, 1); //pop out second value 
                }
            case "Container_Boundary":         
            case "System_Boundary":  

            default:
                if(checkBounadary){
                    if(xCellStyle.boundaries.objects.includes(nID)){
                        console.log("Obj in boundry")
                    } else {
                        str += ComponentName+"("+nID+","
                    }
                } else {
                    str += ComponentName+"("+nID+","
                }
                break;
        }

        if(str != ""){
            for (let i = 0; i < values.length; i++) {
                const val = values[i];
                str += '"'+val.split('[').join('').split(']').join('')+'"'
                if(values.length - i == 1){
                    str += ""
                } else {
                    str += ","
                }
            }

            str += ")"
        }

        if(!checkBounadary){ 
            var NodesStr = ""
            var EdgesStr = ""
            var BoundStr = ""
            switch (ComponentName) {
                case "Container_Boundary":         
                case "System_Boundary":  
                    str += "{\n"
                    console.log("inBoundary >>", xCellStyle.boundaries.objectswb[nID])
                    console.log("BoundaryinBoundary >>", xCellStyle.boundaries.boundarieswb[nID])

                    if(xCellStyle.boundaries.boundarieswb[nID].length > 0){

                        // alreadyBoundChecked.includes()
                        for (let b = 0; b < xCellStyle.boundaries.boundarieswb[nID].length; b++) {
                            const belem = xCellStyle.boundaries.boundarieswb[nID][b];
                            
                            if(alreadyBoundChecked.includes(belem) == false){
                                BoundStr += "\t"+getPumlStringByType([xCellStyle.boundaries.raw[xCellStyle.boundaries.params[belem].rawposition]], xCellStyle, false)
                                console.log("BOUNDED STR >>> ", BoundStr)
                                alreadyBoundChecked.push(belem)
                            }
                        }
                    }

                    // if(alreadyBoundChecked.includes(nID) == "false"){
                        var bNodes = xCellStyle.boundaries.objectswb[nID]
                        console.log("CHECK NODES >>> ", bNodes)
                        for (let n = 0; n < bNodes.length; n++) {
                            const nelem = bNodes[n];
                            // console.log("NODE >>>", nelem, xCellStyle.nodes.raw[xCellStyle.nodes.params[nelem].rawposition])
                            NodesStr += "\t"+getPumlStringByType([xCellStyle.nodes.raw[xCellStyle.nodes.params[nelem].rawposition]], xCellStyle, false)
                            
                            console.log(">>>", xCellStyle)
                            if(nelem in xCellStyle.boundaries.edgeswn && typeof(xCellStyle.boundaries.edgeswn[nelem])==="object"){
                                for (let e = 0; e < xCellStyle.boundaries.edgeswn[nelem].length; e++) {
                                    const edge = xCellStyle.boundaries.edgeswn[nelem][e];
                                    EdgesStr += "\t"+getPumlStringByType([xCellStyle.edges.raw[xCellStyle.edges.params[edge].rawposition]], xCellStyle, false)

                                
                                }
                            }
                        // }
                    }
                        
                str += NodesStr
                
                console.log("alreadyBoundChecked.includes(nID) >>>", nID,alreadyBoundChecked.includes(nID))
                str += BoundStr
                str += EdgesStr
                str += `}`
  
            }
        }

        if(str != "" && alreadyBoundChecked.includes(nID) == false){
            c4Doc += str+"\n";
        }

    }
    return c4Doc;
}

function isObjectInBoundry(bx, bw, by, bh, ox, ow, oy, oh){

    var inBoundary = false
    var xresult = false
    var yresult = false

    console.log("dimensions: ",bx, bw, by, bw, ox, ow, oy, oh)

    if(bx < ox && ox < bx+bw && bx < ox+ow && ox+ow < bx+bw){
        xresult = true
    }

    if(by < oy && oy < by+bh && by < oy+oh && oy+oh < by+bh){
        yresult = true
    }

    if(xresult && yresult){
        inBoundary = true
        console.log('✅ num is between the two numbers');
    }

    return inBoundary;
}

function xCellToPuml(mxGraphStr){

// initalize parsers and serializers
var parser = new DOMParser();
var serializer = new XMLSerializer();

// get text from c4ke and make it xml again
var xmlDoc = parser.parseFromString(mxGraphStr,"text/xml");

// get all cells from xml
var x = xmlDoc.getElementsByTagName("mxCell")

// initialize parser object
var xCellStyle = {
    edges: {
        params: {},
        raw: []
    },
    nodes: {
        params: {},
        raw: []
    },
    boundaries: {
        params: {},
        raw: [],
        objects: [], //all
        edges: [], //all
        boundaries: [], //all
        objectswb: {}, //w bndary key 
        edgeswn: {}, //w bndary key 
        boundarieswb: {} //w bndary key 
    }
}

// populate parser object with edges, nodes and boundaries
for (i = 0; i < x.length; i++) {
    if(x[i].getAttribute('edge')=="1"){
        xCellStyle['edges']['raw'].push(x[i])
        var rawPosition = xCellStyle['edges']['raw'].length -1
        xCellStyle['edges']['params'][x[i].getAttribute('id')] = {source: x[i].getAttribute('source'),
                                                        target:x[i].getAttribute('target'),
                                                        rawposition: rawPosition
                                                        }
        
    } else {
        if(x[i].getAttribute('id').length > 3){
            var temp1 = document.createElement('div');
            nValue = x[i].getAttribute('value')
            temp1.innerHTML = nValue;
            var Shape = temp1.getElementsByTagName('div')[0].getAttribute('id')
            var root = xCellStyle['nodes']
            if(Shape.indexOf("_Boundary") > -1){
                root = xCellStyle['boundaries']
                xCellStyle['boundaries']['boundaries'].push(x[i].getAttribute('id'))
            }
            
            root['raw'].push(x[i])
            var rawPosition = root['raw'].length -1

            root['params'][x[i].getAttribute('id')] = {x: x[i].getElementsByTagName('mxGeometry')[0].getAttribute('x'),
                                                                    y: x[i].getElementsByTagName('mxGeometry')[0].getAttribute('y'),
                                                                    width: x[i].getElementsByTagName('mxGeometry')[0].getAttribute('width'),
                                                                    height: x[i].getElementsByTagName('mxGeometry')[0].getAttribute('height'),
                                                                    rawposition: rawPosition,
                                                                    area: (Number(x[i].getElementsByTagName('mxGeometry')[0].getAttribute('width')) * Number(x[i].getElementsByTagName('mxGeometry')[0].getAttribute('height')))
                                                                    }
        }
    }
}




// xCellStyle.boundaries.params
var arrayOfBoundProps = []
var bIDs = xCellStyle.boundaries.boundaries

for (let ib = 0; ib < bIDs.length; ib++) {
    const bID = xCellStyle.boundaries.boundaries[ib];
    console.log(xCellStyle.boundaries.boundaries[ib])
    xCellStyle.boundaries.params[bID].bid=bID
    arrayOfBoundProps.push(xCellStyle.boundaries.params[bID])
}


arrayOfBoundProps.sort(dynamicSort("area", false))
console.log("SORTED >>>", arrayOfBoundProps);
alreadyBounded = []

for (let b = 0; b < arrayOfBoundProps.length; b++) {
    const bID = arrayOfBoundProps[b].bid;

    var bx = Number(xCellStyle.boundaries.params[bID].x)
    var by = Number(xCellStyle.boundaries.params[bID].y)
    var bw = Number(xCellStyle.boundaries.params[bID].width)    
    var bh = Number(xCellStyle.boundaries.params[bID].height)    

    for (let b2 = 0; b2 < xCellStyle.boundaries.raw.length; b2++) {
        const bID2 = xCellStyle.boundaries.raw[b2].getAttribute('id');
        var ox = Number(xCellStyle.boundaries.params[bID2].x)   
        var oy = Number(xCellStyle.boundaries.params[bID2].y)     
        var ow = Number(xCellStyle.boundaries.params[bID2].width)   
        var oh = Number(xCellStyle.boundaries.params[bID2].height)

        console.log("Boundry in Boundry >>>", bID2, bID)

        if(typeof( xCellStyle.boundaries.boundarieswb[bID]) === 'undefined'){
            xCellStyle.boundaries.boundarieswb[bID] = []
        }

        if(bID2 != bID){
            if(isObjectInBoundry(bx, bw, by, bh, ox, ow, oy, oh)){
                

                xCellStyle.boundaries.boundarieswb[bID].push(bID2)
            }
        }
        
    }


    for (let o = 0; o < xCellStyle.nodes.raw.length; o++) {
        const oID = xCellStyle.nodes.raw[o].getAttribute('id');
        var ox = Number(xCellStyle.nodes.params[oID].x)
        var oy = Number(xCellStyle.nodes.params[oID].y)    
        var ow = Number(xCellStyle.nodes.params[oID].width)   
        var oh = Number(xCellStyle.nodes.params[oID].height)   

        if(typeof( xCellStyle.boundaries.objectswb[bID]) === 'undefined'){
            xCellStyle.boundaries.objectswb[bID] = []
        }

        if(alreadyBounded.includes(oID) == false){
            if(isObjectInBoundry(bx, bw, by, bh, ox, ow, oy, oh)){
                xCellStyle.boundaries.objects.push(oID)
                alreadyBounded.push(oID)

                xCellStyle.boundaries.objectswb[bID].push(oID)
            }
        }

        console.log("✅     Node: ",oID," is indide of boundry:", bID, " >>> ", isObjectInBoundry(bx, bw, by, bh, ox, ow, oy, oh),
            bx, bw, by, bh, ox, ow, oy, oh
        )
    }

}

console.log(">>>>", xCellStyle)

// var bTestArr = []



// console.log("bTestArr >>>>> ", bTestArr)





var DocRootNodes = getPumlStringByType(xCellStyle.nodes.raw, xCellStyle, true)
var DocRootEdges = getPumlStringByType(xCellStyle.edges.raw, xCellStyle, true)

arrayOfBoundProps.sort(dynamicSort("area", true))
var arrDocRootBoundaries = []
for (let aB = 0; aB < arrayOfBoundProps.length; aB++) {
    const bound = arrayOfBoundProps[aB].bid;
    arrDocRootBoundaries.push(getPumlStringByType([xCellStyle.boundaries.raw[xCellStyle.boundaries.params[bound].rawposition]], xCellStyle, false))
    
}

console.log("DOOOOCS >>> ",arrDocRootBoundaries)
var DocRootBoundaries = arrDocRootBoundaries.join("\n")

// create final document
var c4Doc = `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml
' uncomment the following line and comment the first to use locally
' !include C4_Component.puml

LAYOUT_WITH_LEGEND()

`
c4Doc += DocRootNodes + "\n"
c4Doc += DocRootBoundaries + "\n"
c4Doc += DocRootEdges + "\n"

c4Doc += `
@enduml`

console.log(c4Doc)

return c4Doc;

}