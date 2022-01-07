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
	originQuery := `MATCH (n)-[r]->(m) WHERE n.origin=~'(?i).*` + qstring + `.*' AND n.deleted=false RETURN n,r,m `
	results, err := RunQuery(originQuery, nil, "NodeRel")
	if err != nil {
		log.Errorln("Error while query: ", originQuery, "Error: ", err)
	}

	log.Debugln("Query result:", results, len(results.Node), len(results.Rel), len(results.NodeTo))

	return results
}

func GetNeighborNodesAndRelations(nodeIdInt string, nodeAlias string) MyResponseObj {

	neighborQuery := `MATCH (n)-[r]-(m) WHERE n.deleted=false AND ID(n)=` + nodeIdInt + ` AND n.alias="` + nodeAlias + `" RETURN n,r,m`
	results, err := RunQuery(neighborQuery, nil, "NodeRel")
	if err != nil {
		log.Errorln("Error while query: ", neighborQuery, "Error: ", err)
	}

	log.Debugln("Query result:", results, len(results.Node), len(results.Rel), len(results.NodeTo))

	return results
}

type ValidateResponseType struct {
	Alias   string        `json:"alias"`
	IsExist bool          `json:"exist"`
	RawObj  []interface{} `json:"object"`
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
			searchNodeQuery := `MATCH (a) WHERE a.deleted=false AND (a.alias= '` + node.Alias + `') RETURN a `
			Node, err := RunQuery(searchNodeQuery, nil, "Node")
			log.Debugln("validate query result:", Node, Node.Node)
			log.Debugln("validate query error:", err)
			nodeExist := false
			if len(Node.Node) > 0 {
				nodeExist = true
			}
			log.Debugln("node exist flag:", len(Node.Node))

			var nodeResult ValidateResponseType
			nodeResult.Alias = node.Alias
			nodeResult.IsExist = nodeExist
			nodeResult.RawObj = Node.Node

			log.Debugln("nodeResult content:", nodeResult, index)

			result[index] = nodeResult
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
	// records, err := result.Collect()
	// if err != nil {
	// 	panic(err)
	// }

	for result.Next() {

		// log.Debugln("Query return number of values: ", len(result.Record().Values), result.Record().Values)
		// log.Debugln("Query return number of keys:", len(result.Record().Keys), result.Record().Keys)
		// if len(result.Record().Values) == 2 {
		// 	org := result.Record().Values[1]
		// }

		recId := result.Record().Values[0]
		log.Debugln("Record: ", recId)
		// node, err := result.Collect()
		if err != nil {
			log.Errorln("Error transform to Node type")
		}

		var node interface{}
		var node2 interface{}
		var rel interface{}
		// Values[0] //Node
		// Values[1] //Relationship
		// Values[2] //Node
		if respType == "Node" {
			node = result.Record().Values[0].(dbtype.Node)
			response.Node = append(response.Node, node)
		} else {
			node = result.Record().Values[0].(dbtype.Node)
			rel = result.Record().Values[1].(dbtype.Relationship)
			node2 = result.Record().Values[2].(dbtype.Node)
			response.Node = append(response.Node, node)
			response.Rel = append(response.Rel, rel)
			response.NodeTo = append(response.NodeTo, node2)
		}

	}

	return response, nil
}
