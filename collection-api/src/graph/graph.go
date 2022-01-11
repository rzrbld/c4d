package graph

import (
	"strings"

	"github.com/mitchellh/mapstructure"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j/dbtype"
	cnf "github.com/rzrbld/collection-api/config"
	pc42obj "github.com/rzrbld/puml-c4-to-object-go"
	pc4types "github.com/rzrbld/puml-c4-to-object-go/types"
	log "github.com/sirupsen/logrus"
)

type MyResponseObj struct {
	Node   []interface{} `json:"_node"`
	Rel    []interface{} `json:"_rel"`
	NodeTo []interface{} `json:"_nodeto"`
}

type ValidateResponseType struct {
	Alias   string        `json:"alias"`
	IsExist bool          `json:"exist"`
	RawObj  []interface{} `json:"object"`
	IsRel   bool          `json:"relation"`
}

func GetAllNodesWithFilter(qstring string) MyResponseObj {
	allNodesQuery := `MATCH (a) WHERE a.deleted=false AND (a.alias=~ '(?i).*` + qstring + `.*' OR a.label=~'(?i).*` + qstring + `.*') RETURN a `
	allNodes, err := RunQuery(allNodesQuery, nil, "Node")
	if err != nil {
		log.Errorln("Error while query: ", allNodesQuery, "Error: ", err)
	}

	log.Debugln("Query result:", allNodes, len(allNodes.Node), len(allNodes.Rel), len(allNodes.NodeTo))

	return allNodes
}

func GetAllNodesAndRelsByGit(qstring string) MyResponseObj {
	// originQuery := `MATCH (n)-[r]->(m) WHERE n.origin=~'(?i).*` + qstring + `.*' AND n.deleted=false RETURN n,r,m `
	// MATCH (m)-[r:ORIGIN]-(n:OriginGit) WHERE n.uri="http://gogs:3000/root/c4d-test5.git/test1.puml" AND m.deleted=false AND n.deleted=false CALL{ WITH m MATCH (m)-[b]->(a) WHERE TYPE(b)<>"ORIGIN" RETURN b,a} RETURN m,b,a

	originQuery := `MATCH (m)-[r:ORIGIN]-(n:OriginGit) WHERE n.uri="` + qstring + `" AND m.deleted=false AND n.deleted=false CALL{ WITH m MATCH (m)-[b]->(a) WHERE TYPE(b)<>"ORIGIN" RETURN b,a} RETURN m,b,a`
	results, err := RunQuery(originQuery, nil, "NodeRel")
	if err != nil {
		log.Errorln("Error while query: ", originQuery, "Error: ", err)
	}

	log.Debugln("Query result:", results, len(results.Node), len(results.Rel), len(results.NodeTo))

	return results
}

func GetNeighborNodesAndRelations(nodeIdInt string, nodeAlias string) MyResponseObj {
	neighborQuery := `MATCH (n)-[r]-(m) WHERE n.deleted=false AND m.deleted=false AND ID(n)=` + nodeIdInt + ` AND n.alias="` + nodeAlias + `" AND TYPE(r)<>"ORIGIN" RETURN n,r,m`
	results, err := RunQuery(neighborQuery, nil, "NodeRel")
	if err != nil {
		log.Errorln("Error while query: ", neighborQuery, "Error: ", err)
	}

	log.Debugln("Query result:", results, len(results.Node), len(results.Rel), len(results.NodeTo))

	return results
}

func validateObj(query string, objType string, alias string) ValidateResponseType {

	searchNodeQuery := query
	Node, err := RunQuery(searchNodeQuery, nil, objType)
	var nodeResult ValidateResponseType
	log.Debugln("validate query result:", Node, Node.Node)
	log.Debugln("validate query error:", err)
	nodeExist := false
	if len(Node.Node) > 0 {
		nodeExist = true
		nodeResult.RawObj = Node.Node
	}
	if len(Node.Rel) > 0 {
		nodeExist = true
		nodeResult.RawObj = Node.Rel
	}
	log.Debugln("node exist flag:", len(Node.Node))

	nodeResult.Alias = alias
	nodeResult.IsExist = nodeExist

	nodeResult.IsRel = true
	if objType == "Node" {
		nodeResult.IsRel = false
	}

	log.Debugln("nodeResult content:", nodeResult)

	return nodeResult
}

func ValidateHandler(fileContent string) map[int]ValidateResponseType {
	log.Debugln("validate", fileContent)
	result := make(map[int]ValidateResponseType)
	var stringsSlice = strings.Split(strings.ReplaceAll(fileContent, "\r\n", "\n"), "\n")

	for index, stringContent := range stringsSlice {

		var fileObj = &pc4types.EncodedObj{}
		fileObj = pc42obj.Parse(stringContent)

		if len(fileObj.Nodes) > 0 {
			var elem = fileObj.Nodes[0]
			var node pc4types.GenericC4Type
			err := mapstructure.Decode(elem.Object, &node)
			if err != nil {
				log.Errorln("Kind of error. ", err)
			}
			qString := `MATCH (a) WHERE a.deleted=false AND (a.alias= '` + node.Alias + `') RETURN a `
			result[index] = validateObj(qString, "Node", node.Alias)
		}

		if len(fileObj.Rels) > 0 {
			var elem = fileObj.Rels[0]
			var rel pc4types.GenericC4Type
			err := mapstructure.Decode(elem.Object, &rel)
			if err != nil {
				log.Errorln("Kind of error. ", err)
			}
			qString := `MATCH (a {alias: '` + rel.From + `'})-[r:` + rel.GType + `]->(b {alias: '` + rel.To + `'})  RETURN r`
			result[index] = validateObj(qString, "Rel", rel.GType)
		}
	}

	return result
}

func RunQuery(query string, obj map[string]interface{}, respType string) (MyResponseObj, error) {
	log.Debugln("query string;", query, " object:", obj)

	uri := cnf.Neo4jURI
	username := cnf.Neo4jUser
	password := cnf.Neo4jPassword
	var response MyResponseObj

	driver, err := neo4j.NewDriver(uri, neo4j.BasicAuth(username, password, ""))
	if err != nil {
		return response, err
	}
	defer driver.Close()

	session := driver.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close()

	result, err := session.Run(query, obj)
	if err != nil {
		panic(err)
	}

	for result.Next() {

		recId := result.Record().Values[0]
		log.Debugln("Record: ", recId)

		if err != nil {
			log.Errorln("Error transform to Node type")
		}

		var node interface{}
		var node2 interface{}
		var rel interface{}
		// Values[0] //Node
		// Values[1] //Relationship
		// Values[2] //Node
		switch respType {
		case "Node":
			node = result.Record().Values[0].(dbtype.Node)
			response.Node = append(response.Node, node)
		case "NodeRel":
			node = result.Record().Values[0].(dbtype.Node)
			rel = result.Record().Values[1].(dbtype.Relationship)
			node2 = result.Record().Values[2].(dbtype.Node)
			response.Node = append(response.Node, node)
			response.Rel = append(response.Rel, rel)
			response.NodeTo = append(response.NodeTo, node2)
		case "Rel":
			rel = result.Record().Values[0].(dbtype.Relationship)
			response.Rel = append(response.Rel, rel)
		default:
			log.Warnln("unknown query type:", respType)
		}
	}

	return response, nil
}
