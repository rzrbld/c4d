package graph

import (
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j/dbtype"
	cnf "github.com/rzrbld/collection-api/config"
	log "github.com/sirupsen/logrus"
)

func GetAllNodesWithFilter(qstring string) interface{} {
	allNodesQuery := `MATCH (a) WHERE a.deleted=false AND (a.alias=~ '(?i).*` + qstring + `.*' OR a.label=~'(?i).*` + qstring + `.*') RETURN a `
	allNodes, err := RunQuery(allNodesQuery, nil, "Node")
	if err != nil {
		log.Errorln("Error while query: ", allNodesQuery, "Error: ", err)
	}

	log.Debugln("Query result:", allNodes, len(allNodes))

	return allNodes
}

func GetAllNodesAndRelations() interface{} {

	allNodesQuery := `MATCH (n)-[r]->(m) RETURN n,r,m`
	allNodes, err := RunQuery(allNodesQuery, nil, "NodeRel")
	if err != nil {
		log.Errorln("Error while query: ", allNodesQuery, "Error: ", err)
	}

	log.Debugln("Query result:", allNodes, len(allNodes))

	return allNodes
}

func RunQuery(query string, obj map[string]interface{}, respType string) ([]interface{}, error) {
	log.Debugln("query string;", query, " object:", obj)

	uri := cnf.Neo4jURI
	username := cnf.Neo4jUser
	password := cnf.Neo4jPassword
	var response []interface{}

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
			response = append(response, node)
		} else {
			node = result.Record().Values[0].(dbtype.Node)
			rel = result.Record().Values[1].(dbtype.Relationship)
			node2 = result.Record().Values[2].(dbtype.Node)
			response = append(response, node)
			response = append(response, rel)
			response = append(response, node2)
		}

	}

	return response, nil
}
