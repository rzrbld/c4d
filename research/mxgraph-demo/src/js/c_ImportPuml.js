function cleanParam(str){
    return str.replaceAll('"','').replaceAll('&','and')
}

function c4pumlGetTemplated(str, svgDoc){
    c4StrArr = str.split('(')
    c4Name = c4StrArr[0].trim()
    c4Param = c4StrArr[1].replace(')', '').split(',')

    var c4TextParams = str.match(/".*?"/g);    
    
    console.log("C4PARAM >>> ",c4Name, c4Param, c4TextParams)

    // Person
    // System
    // Container
    // ContainerDb
    // ContainerQueue
    // Component
    // Person_Ext
    // System_Ext
    // Container_Ext
    // ContainerDb_Ext
    // ContainerQueue_Ext
    // Component_Ext
    // Rel
    // BiRel
    // System_Boundary
    // Container_Boundary

    if(c4Name.indexOf('Rel')>-1){
        c4Param = c4Param.slice(0,2)
    } else {
        c4Param = c4Param.slice(0,1)
    }

    for (let i = 0; i < c4Param.length; i++) {
        const element = c4Param[i];
        c4Param[i] = c4Param[i].trim()
    }

    c4Param = c4Param.concat(c4TextParams)

    console.log(c4Name, c4Param)


    // cluster = boundary
    // element = node
    // link = rel
    template = ""

    switch (c4Name) {
        case 'Person':
        case 'Person_Ext':
        case 'System':
        case 'System_Ext':
            var cid = c4Param[0]
            var Name = cleanParam(c4Param[1])
            var Desc = ""
            if(c4Param.length > 2){
                Desc = cleanParam(c4Param[2])
            }
            var template = c4ShapesObj[c4Name].shape
            template = template.replace('%_uid_%', cid)
            template = template.replace('%_Name_%', Name)
            template = template.replace('%_Desc_%', Desc)

            var elemSvg = svgDoc.getElementById('entity_'+cid)?.getElementsByTagName('rect')[0]

            var x = Number(elemSvg.getAttribute('x'))*1.15
            var y = Number(elemSvg.getAttribute('y'))*1.15

            template = template.replace('%_x_%', x)
            template = template.replace('%_y_%', y)
            // var w = elemSvg.getAttribute('w')
            // var h = elemSvg.getAttribute('h')

            break;

        
        case 'Container':
        case 'ContainerDb':
        case 'ContainerQueue':
        case 'Component':
        case 'Container_Ext':
        case 'ContainerDb_Ext':
        case 'ContainerQueue_Ext':
        case 'Component_Ext':
            var cid = c4Param[0]
            var Name = cleanParam(c4Param[1])
            var Tech = cleanParam(c4Param[2])
            var Desc = cleanParam(c4Param[3])
            var template = c4ShapesObj[c4Name].shape
            template = template.replace('%_uid_%', cid)
            template = template.replace('%_Name_%', Name)
            template = template.replace('%_Tech_%', Tech)
            template = template.replace('%_Desc_%', Desc)

            console.log('template 1>> ', cid, template)

            var x = 0
            var y = 0

            if(c4Name == "ContainerDb" || c4Name == "ContainerQueue" || c4Name == "ContainerDb_Ext" || c4Name == "ContainerQueue_Ext" ){
                var elemSvg = svgDoc.getElementById('entity_'+cid)?.getElementsByTagName('text')[0]
                x = (Number(elemSvg.getAttribute('x'))-55)*1.15
                y = (Number(elemSvg.getAttribute('y'))-55)*1.25

            }else{
                var elemSvg = svgDoc.getElementById('entity_'+cid)?.getElementsByTagName('rect')[0]
                x = Number(elemSvg.getAttribute('x'))*1.15
                y = Number(elemSvg.getAttribute('y'))*1.15
            }
            

            
            template = template.replace('%_x_%', x)
            template = template.replace('%_y_%', y)


        
            break;

        case 'Rel':
        case 'BiRel':
        case 'Rel_Neighbor':
        case 'Rel_U':
        case 'Rel_D':
        case 'Rel_L':
        case 'Rel_R':
        case 'Rel_Up':
        case 'Rel_Down':
        case 'Rel_Left':
        case 'Rel_Right':
        case 'BiRel_U':
        case 'BiRel_D':
        case 'BiRel_L':
        case 'BiRel_R':
        case 'BiRel_Up':
        case 'BiRel_Down':
        case 'BiRel_Left':
        case 'BiRel_Right':
        case 'Rel_Back_Neighbor':
        case 'Rel_Back':
            if(c4Name.indexOf('BiRel')>-1){
                c4Name = "BiRel"
            } else {
                if(c4Name.indexOf('Rel_Back')>-1){
                    c4Name = "Rel_Back"
                }else{
                    c4Name = "Rel"
                }
            }
            var uID = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12)).toString(36)
            console.log("REl Params", c4Param)
            var From = c4Param[0]
            var To = c4Param[1]
            var Name = ""
            var Tech = ""
            if(c4Param.length > 2){
                Name = cleanParam(c4Param[2])
            }
            if(c4Param.length > 3){
                Tech = "["+cleanParam(c4Param[3])+"]"
            }
            var template = c4ShapesObj[c4Name].shape
            template = template.replace('%_uid_%', uID)
            template = template.replace('%_source_%', From)
            template = template.replace('%_target_%', To)
            template = template.replace('%_Name_%', Name)
            template = template.replace('%_Tech_%', Tech)

            break;
        case 'Enterprise_Boundary':
        case 'System_Boundary':
        case 'Container_Boundary':
            var cid = c4Param[0]
            var Name = cleanParam(c4Param[1])
            var template = c4ShapesObj[c4Name].shape
            template = template.replace('%_uid_%', cid)
            template = template.replace('%_Name_%', Name)

            var elemSvg = svgDoc.getElementById('cluster_'+cid)?.getElementsByTagName('rect')[0]

            var x = Number(elemSvg.getAttribute('x'))*1.2
            var y = Number(elemSvg.getAttribute('y'))*1.2
            var w = Number(elemSvg.getAttribute('width'))*1.2
            var h = Number(elemSvg.getAttribute('height'))*1.2

            template = template.replace('%_x_%', x)
            template = template.replace('%_y_%', y)
            template = template.replace('%_w_%', w)
            template = template.replace('%_h_%', h)

            break;
    
        default:
            console.warn("Unsupported shape: ", c4Name, ". Results may vary")
            break;
    }

    return template;
}

function filterPumlStr(str){
    str = str.trim()
    const regex2 = new RegExp(/^[a-zA-Z].*\([a-zA-Z0-9].*\)/g);
    var vstr = ""

    isValid = regex2.test(str);

    return isValid
}


function pumlToXCell(svgStr,pumlStr){

c4keXMLModelHead = '<mxGraphModel %_Props_% >'
    
c4keXMLModelProps = 'dx="2158" dy="1382" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="%_w_%" pageHeight="%_h_%"'
c4keRoot =`    <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>`

c4keRootEnd = `    </root>
</mxGraphModel>`

c4ShapesObj = 
    {
        "Person":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Person&quot;&gt;&lt;div style=&quot;font-size: 16px;font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&lt;div id=&quot;C4Type&quot; class=&quot;C4Param&quot;&gt;[Person]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;%_Desc_%&lt;/div&gt;&lt;/div&gt;" style="editable=0;html=1;fontSize=11;dashed=0;whiteSpace=wrap;fillColor=#083F75;strokeColor=#06315C;fontColor=#ffffff;shape=mxgraph.c4.person2;align=center;metaEdit=0;points=[[0.5,0,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0]];resizable=0;" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="200" height="180" as="geometry"/></mxCell>'
        },
        "System":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_System&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&lt;div id=&quot;C4Type&quot; class=&quot;C4Param&quot;&gt;[Software System]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;%_Desc_%&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#1061B0;fontColor=#ffffff;align=center;arcSize=10;strokeColor=#0D5091;metaEdit=1;resizable=0;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120" as="geometry"/></mxCell>'
        },
        "Container": { shape:' <mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Container&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&lt;div id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;[%_Tech_%]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;%_Desc_%&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;whiteSpace=wrap;html=1;fontSize=11;labelBackgroundColor=none;fillColor=#23A2D9;fontColor=#ffffff;align=center;arcSize=10;strokeColor=#0E7DAD;metaEdit=1;resizable=0;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120"  as="geometry"/></mxCell>'
        },
        "ContainerDb":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_ContainerDb&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;Container name&lt;/div&gt;&lt;div id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;[Container:&amp;nbsp;e.g. Oracle Database 12]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of storage type container role/responsibility.&lt;/div&gt;&lt;/div&gt;" style="editable=0;shape=cylinder3;size=15;whiteSpace=wrap;html=1;boundedLbl=1;rounded=0;labelBackgroundColor=none;fillColor=#23A2D9;fontSize=12;fontColor=#ffffff;align=center;strokeColor=#0E7DAD;metaEdit=1;points=[[0.5,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.5,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];resizable=0;" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120"  as="geometry"/></mxCell>'
        },
        "ContainerQueue":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_ContainerQueue&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;Container name&lt;/div&gt;&lt;div id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;[Container: e.g. Apache Kafka, etc.]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of message bus type container role/responsibility.&lt;/div&gt;&lt;/div&gt;" style="editable=0;shape=cylinder3;size=15;direction=south;whiteSpace=wrap;html=1;boundedLbl=1;rounded=0;labelBackgroundColor=none;fillColor=#23A2D9;fontSize=12;fontColor=#ffffff;align=center;strokeColor=#0E7DAD;metaEdit=1;points=[[0.5,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.5,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];resizable=0;" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120"  as="geometry"/></mxCell>'
        },
        "Component":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Component&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;Component name&lt;/div&gt;&lt;div id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;[Component: e.g. Spring Service]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of component role/responsibility.&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#63BEF2;fontColor=#ffffff;align=center;arcSize=6;strokeColor=#2086C9;metaEdit=1;resizable=0;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120" as="geometry"/></mxCell>'
        },
        "Person_Ext":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Person_Ext&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;External person name&lt;/div&gt;&lt;div id=&quot;C4Type&quot; class=&quot;C4Param&quot;&gt;[Person]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of external person.&lt;/div&gt;&lt;/div&gt;" style="editable=0;html=1;fontSize=11;dashed=0;whiteSpace=wrap;fillColor=#6C6477;strokeColor=#4D4D4D;fontColor=#ffffff;shape=mxgraph.c4.person2;align=center;metaEdit=1;points=[[0.5,0,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0]];resizable=0;" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="200" height="180"   as="geometry"/></mxCell>'
        },
        "System_Ext":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_System_Ext&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;External system name&lt;/div&gt;&lt;div id=&quot;C4Type&quot; class=&quot;C4Param&quot;&gt;[Software System]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of external software system.&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=#8C8496;fontColor=#ffffff;align=center;arcSize=10;strokeColor=#736782;metaEdit=1;resizable=0;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120"   as="geometry"/></mxCell>'
        },
        "Container_Ext":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Container_Ext&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;External container name&lt;/div&gt;&lt;div id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;[Container: e.g. SpringBoot, ElasticSearch, etc.]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of external container role/responsibility.&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;whiteSpace=wrap;html=1;fontSize=11;labelBackgroundColor=none;fillColor=rgb(164&#9;164&#9;164&#9;);fontColor=#ffffff;align=center;arcSize=10;strokeColor=rgb(135&#9;135&#9;135&#9;);metaEdit=1;resizable=0;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120"  as="geometry"/></mxCell>'
        },
        "ContainerDb_Ext":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_ContainerDb_Ext&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;External container name&lt;/div&gt;&lt;div id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;[Container:&amp;nbsp;e.g. Oracle Database 12]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of external storage type container role/responsibility.&lt;/div&gt;&lt;/div&gt;" style="editable=0;shape=cylinder3;size=15;whiteSpace=wrap;html=1;boundedLbl=1;rounded=0;labelBackgroundColor=none;fillColor=rgb(164&#9;164&#9;164&#9;);fontSize=12;fontColor=#ffffff;align=center;strokeColor=rgb(135&#9;135&#9;135&#9;);metaEdit=1;points=[[0.5,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.5,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];resizable=0;" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120"  as="geometry"/></mxCell>'
        },
        "ContainerQueue_Ext":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_ContainerQueue_Ext&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;External container name&lt;/div&gt;&lt;div id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;[Container: e.g. Apache Kafka, etc.]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of external message bus type container role/responsibility.&lt;/div&gt;&lt;/div&gt;" style="editable=0;shape=cylinder3;size=15;direction=south;whiteSpace=wrap;html=1;boundedLbl=1;rounded=0;labelBackgroundColor=none;fillColor=rgb(164&#9;164&#9;164&#9;);fontSize=12;fontColor=#ffffff;align=center;strokeColor=rgb(135&#9;135&#9;135&#9;);metaEdit=1;points=[[0.5,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.5,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];resizable=0;" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120"  as="geometry"/></mxCell>'
        },
        "Component_Ext":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Component_Ext&quot;&gt;&lt;div style=&quot;font-size: 16px; font-weight: bold;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;External component name&lt;/div&gt;&lt;div id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;[Component: e.g. Spring Service]&lt;/div&gt;&lt;br/&gt;&lt;div style=&quot;font-size: 11px; color: #cccccc;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;Description of external component role/responsibility.&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;whiteSpace=wrap;html=1;labelBackgroundColor=none;fillColor=rgb(193&#9;193&#9;193&#9;);fontColor=#ffffff;align=center;arcSize=6;strokeColor=rgb(164&#9;164&#9;164&#9;);metaEdit=1;resizable=0;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="240" height="120"  as="geometry"/></mxCell>'
        },
        "Rel":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Rel&quot;&gt;&#10;&#9;&#9;&#9;&lt;div style=&quot;font-size: 12px; text-align: center; font-weight: bold;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&#10;&#9;&#9;&#9;&lt;div style=&quot;text-align: center;&quot; id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;%_Tech_%&lt;/div&gt;&#10;&#9;&#9;&#9;&lt;/div&gt;" style="editable=0;endArrow=blockThin;html=1;fontSize=10;labelBackgroundColor=transparent;fontColor=#404040;strokeWidth=1;endFill=1;strokeColor=#828282;elbow=vertical;metaEdit=1;endSize=14;startSize=14;jumpStyle=arc;jumpSize=16;rounded=0;edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="%_source_%" target="%_target_%"><mxGeometry width="240" relative="1" as="geometry" /></mxCell>'
        },
        "BiRel":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_BiRel&quot;&gt;&#10;&#9;&#9;&#9;&lt;div style=&quot;font-size: 12px; text-align: center; font-weight: bold;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&#10;&#9;&#9;&#9;&lt;div style=&quot;text-align: center;&quot; id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;%_Tech_%&lt;/div&gt;&#10;&#9;&#9;&#9;&lt;/div&gt;" style="editable=0;startArrow=blockThin;endArrow=blockThin;html=1;fontSize=10;labelBackgroundColor=transparent;fontColor=#404040;strokeWidth=1;endFill=1;strokeColor=#828282;elbow=vertical;metaEdit=1;endSize=14;startSize=14;jumpStyle=arc;jumpSize=16;rounded=0;edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="%_source_%" target="%_target_%"><mxGeometry width="240" relative="1" as="geometry"/></mxCell>'
        },
        "Rel_Back":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Rel_Back&quot;&gt;&#xa;			&lt;div style=&quot;font-size: 12px; text-align: center; font-weight: bold;&quot; id=&quot;C4Description&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&#xa;			&lt;div style=&quot;text-align: center;&quot; id=&quot;C4Technology&quot; class=&quot;C4Param&quot;&gt;%_Tech_%&lt;/div&gt;&#xa;			&lt;/div&gt;" style="editable=0;startArrow=blockThin;endArrow=none;html=1;fontSize=10;labelBackgroundColor=transparent;fontColor=#404040;strokeWidth=1;endFill=1;strokeColor=#828282;elbow=vertical;metaEdit=1;endSize=14;startSize=14;jumpStyle=arc;jumpSize=16;rounded=0;edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="%_source_%" target="%_target_%"><mxGeometry width="240" relative="1" as="geometry"/></mxCell>'
        },
        "Enterprise_Boundary":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Enterprise_Boundary&quot;&gt;&lt;div style=&quot;text-align: left; font-weight: bold; font-size: 17px;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&lt;div style=&quot;text-align: left; font-size: 12px;&quot; id=&quot;C4Application&quot; class=&quot;C4Param&quot;&gt;[Enterprise]&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;fontSize=11;whiteSpace=wrap;html=1;dashed=1;arcSize=20;fillColor=none;strokeColor=#666666;fontColor=#333333;labelBackgroundColor=none;align=left;verticalAlign=bottom;labelBorderColor=none;spacingTop=0;spacing=10;dashPattern=8 4;metaEdit=1;rotatable=0;perimeter=rectanglePerimeter;noLabel=0;labelPadding=0;allowArrows=0;connectable=0;expand=0;recursiveResize=0;pointerEvents=0;absoluteArcSize=1;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="%_w_%" height="%_h_%" as="geometry" /></mxCell>'
        },
        "System_Boundary":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_System_Boundary&quot;&gt;&lt;div style=&quot;text-align: left; font-weight: bold; font-size: 17px;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&lt;div style=&quot;text-align: left; font-size: 12px;&quot; id=&quot;C4Application&quot; class=&quot;C4Param&quot;&gt;[Software System]&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;fontSize=11;whiteSpace=wrap;html=1;dashed=1;arcSize=20;fillColor=none;strokeColor=#666666;fontColor=#333333;labelBackgroundColor=none;align=left;verticalAlign=bottom;labelBorderColor=none;spacingTop=0;spacing=10;dashPattern=8 4;metaEdit=1;rotatable=0;perimeter=rectanglePerimeter;noLabel=0;labelPadding=0;allowArrows=0;connectable=0;expand=0;recursiveResize=0;pointerEvents=0;absoluteArcSize=1;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="%_w_%" height="%_h_%"   as="geometry"/></mxCell>'
        },
        "Container_Boundary":{shape: '<mxCell id="%_uid_%" value="&lt;div id=&quot;C4_Container_Boundary&quot;&gt;&lt;div style=&quot;text-align: left; font-weight: bold; font-size: 17px;&quot; id=&quot;C4Name&quot; class=&quot;C4Param&quot;&gt;%_Name_%&lt;/div&gt;&lt;div style=&quot;text-align: left; font-size: 12px;&quot; id=&quot;C4Application&quot; class=&quot;C4Param&quot;&gt;[Container]&lt;/div&gt;&lt;/div&gt;" style="editable=0;rounded=1;fontSize=11;whiteSpace=wrap;html=1;dashed=1;arcSize=20;fillColor=none;strokeColor=#666666;fontColor=#333333;labelBackgroundColor=none;align=left;verticalAlign=bottom;labelBorderColor=none;spacingTop=0;spacing=10;dashPattern=8 4;metaEdit=1;rotatable=0;perimeter=rectanglePerimeter;noLabel=0;labelPadding=0;allowArrows=0;connectable=0;expand=0;recursiveResize=0;pointerEvents=0;absoluteArcSize=1;points=[[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0.25,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0],[0,0.25,0]];" vertex="1" parent="1"><mxGeometry x="%_x_%" y="%_y_%" width="%_w_%" height="%_h_%"  as="geometry"/></mxCell>'}
    }

var parser = new DOMParser();
var svgDoc = parser.parseFromString(svgStr,"text/xml");
var x = svgDoc.getElementsByTagName("g")
console.log('X >>>', x)

var PumlArrRaw = pumlStr.split("\n")
var PumlArrCln = []

for (let i = 0; i < PumlArrRaw.length; i++) {
    const pstr = PumlArrRaw[i];
    // console.log("PARSER>>>>",pstr, filterPumlStr(pstr))
    if(filterPumlStr(pstr)){
        PumlArrCln.push(pstr)
    }
}

// console.log("FINAL ARRAY >>>>", PumlArrCln)

tstrBody = ""

for (let n = 0; n < PumlArrCln.length; n++) {
    const str = PumlArrCln[n];

    tstrBody += c4pumlGetTemplated(str, svgDoc)
}

var svgDocProps = svgDoc.getElementsByTagName('svg')[0]
var svgW = svgDocProps.getAttribute("width").replace("px","")
var svgH = svgDocProps.getAttribute("height").replace("px","")

c4keXMLModelProps = c4keXMLModelProps.replace('%_w_%',svgW)
c4keXMLModelProps = c4keXMLModelProps.replace('%_h_%',svgH)
c4keXMLModelHead = c4keXMLModelHead.replace('%_Props_%', c4keXMLModelProps)
var finalXMLStr = c4keXMLModelHead + c4keRoot + tstrBody + c4keRootEnd

console.log(PumlArrCln)

return finalXMLStr

}