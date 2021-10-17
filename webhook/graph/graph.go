package graph

import (
	"reflect"

	"github.com/mitchellh/mapstructure"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
	cnf "github.com/rzrbld/webhook-catcher/config"
	"github.com/rzrbld/webhook-catcher/types"
	log "github.com/sirupsen/logrus"
)

func FroeachObjectsToGraph(objMap map[string][]*types.GlobalType, repoURI string, removeFlag bool) {
	for k, v := range objMap {
		for i := 0; i < len(v); i++ {
			log.Infoln("object with key: ", k, " object: ", v[i], " and remove flag: ", removeFlag)
			RunCUDQuery(v[i].Object, v[i].BoundaryAlias, removeFlag, repoURI+"/"+k, repoURI)
		}
	}
}

func RunCUDQuery(obj map[string]interface{}, boundaryAlias string, rmFlag bool, origin string, repo string) {
	log.Debugln("Get type of object: ", reflect.TypeOf(obj))
	var node types.GraphObj
	err := mapstructure.Decode(obj, &node)
	if err != nil {
		log.Errorln("Some went wrong on map structure. ", err)
	}

	runes := []rune(node.GType)
	isRelation := string(runes[0:3])
	query := ""
	if isRelation != "Rel" {

		check := `MATCH (a:` + node.GType + ` {alias: $Alias}) RETURN id(a)+'', a.origin`
		checkR, nodeOrigin, err := RunQuery(check, obj)

		if err != nil {
			log.Errorln("Error while check node exist. ", err)
		}

		log.Debugln("Node check found: ", checkR, ". Node origin: ", nodeOrigin, ". Delete flag: ", rmFlag)

		switch ntype := node.GType; ntype {

		case "Component", "ComponentDb", "ComponentQueue", "Component_Ext", "ComponentDb_Ext", "ComponentQueue_Ext", "Container", "ContainerDb", "ContainerQueue", "Container_Ext", "ContainerDb_Ext", "ContainerQueue_Ext":

			if rmFlag {
				if checkR != "none" && origin == nodeOrigin {
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.deleted=true RETURN '' + id(a)`
				}
			} else {
				if checkR == "none" { //create
					query = "CREATE (a:" + node.GType + "{alias: $Alias, label: $Label, techn: $Techn, descr: $Descr, deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
				} else { //update
					if origin == nodeOrigin {
						query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.alias=$Alias SET a.label=$Label SET a.techn=$Techn SET a.descr=$Descr SET a.deleted=false RETURN '' + id(a)`
					}
				}

			}

		case "Person", "Person_Ext", "System", "System_Ext", "SystemDb", "SystemQueue", "SystemDb_Ext", "SystemQueue_Ext":
			if rmFlag {
				if checkR != "none" && origin == nodeOrigin {
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.deleted=true RETURN '' + id(a)`
				}

			} else {
				if checkR == "none" { //create
					query = "CREATE (a:" + node.GType + "{alias: $Alias, label: $Label, descr: $Descr, deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
				} else { //update
					if origin == nodeOrigin {
						query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.alias=$Alias SET a.label=$Label SET a.descr=$Descr SET a.deleted=false RETURN '' + id(a)`
					}
				}
			}

		case "Enterprise_Boundary", "System_Boundary", "Container_Boundary":
			if rmFlag {
				if checkR != "none" && origin == nodeOrigin {
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.deleted=true RETURN '' + id(a)`
				}

			} else {
				if checkR == "none" { //create
					query = "CREATE (a:" + node.GType + "{alias: $Alias, label: $Label, type: $Type, deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
				} else { //update
					if origin == nodeOrigin {
						query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.alias=$Alias SET a.label=$Label SET a.type=$Type SET a.deleted=false RETURN '' + id(a)`
					}
				}
			}

		case "Deployment_Node", "Deployment_Node_L", "Deployment_Node_R", "Node", "Node_L", "Node_R":

			if rmFlag {
				if checkR != "none" && origin == nodeOrigin {
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.deleted=true RETURN '' + id(a)`
				}

			} else {
				if checkR == "none" { //create
					query = "CREATE (a:" + node.GType + "{alias: $Alias, label: $Label, type: $Type, descr: $Descr, deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
				} else { //update
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.alias=$Alias SET a.label=$Label SET a.type=$Type SET a.descr=$Descr SET a.deleted=false RETURN '' + id(a)`
				}
			}

		}

		if query != "" {
			qResult, _, err := RunQuery(query, obj)
			if err != nil {
				log.Errorln("error while run create/update/delete node query: ", err)
			}
			log.Debugln("create/update/delete query node success: ", qResult)
		}
	} else {

		checkBound := `MATCH (a {alias: '` + node.From + `'})-[r:` + node.GType + `]->(b {alias: '` + node.To + `'})  RETURN type(r), r.origin`
		boundCheck, relOrigin, err := RunQuery(checkBound, nil)
		if err != nil {
			log.Errorln("Error while check relation exist. ", err)
		}

		log.Debugln("Relation exist: ", boundCheck, ", remove flag: ", rmFlag, " existed origin: ", relOrigin, " saved origin: ", origin)

		switch ntype := node.GType; ntype {
		case "Rel", "Rel_Back", "Rel_Neighbor", "Rel_Back_Neighbor", "Rel_D", "Rel_Down", "Rel_U", "Rel_Up", "Rel_L", "Rel_Left", "Rel_R", "Rel_Right":

			if rmFlag {
				if checkBound != "none" && origin == relOrigin {
					query = `MATCH (a {alias:'` + node.From + `'})-[r:` + node.GType + `]->(b {alias: '` + node.To + `'}) DELETE r RETURN type(r)`
				}
			} else {
				if boundCheck == "none" { //create
					query = `MATCH
					(a),
					(b)
				WHERE a.alias = '` + node.From + `' AND b.alias = '` + node.To + `'
				CREATE (a)-[r:` + node.GType + `]->(b)
				SET r.label = '` + node.Label + `' SET r.techn = '` + node.Techn + `' SET r.descr = '` + node.Descr + `' SET r.origin = '` + origin + `' SET r.git = '` + repo + `'
				RETURN type(r)`
				} else { //update
					query = `MATCH (a {alias: '` + node.From + `'})-[r:` + node.GType + `]->(b {alias: '` + node.To + `'}) SET r.label = '` + node.Label + `' SET r.techn = '` + node.Techn + `' SET r.descr = '` + node.Descr + `' RETURN type(r)`
				}
			}

		case "RelIndex", "RelIndex_Back", "RelIndex_Neighbor", "RelIndex_Back_Neighbor", "RelIndex_D", "RelIndex_Down", "RelIndex_U", "RelIndex_Up", "RelIndex_L", "RelIndex_Left", "RelIndex_R", "RelIndex_Right":

			if rmFlag {
				if checkBound != "none" && origin == relOrigin {
					query = `MATCH (a {alias:'` + node.From + `'})-[r:` + node.GType + `]->(b {alias: '` + node.To + `'}) DELETE r RETURN type(r)`
				}
			} else {

				if boundCheck == "none" { //create
					query = `MATCH
					(a),
					(b)
				WHERE a.alias = '` + node.From + `' AND b.alias = '` + node.To + `'
				CREATE (a)-[r:` + node.GType + `]->(b)
				SET r.index = '` + node.Index + `'SET r.label = '` + node.Label + `' SET r.techn = '` + node.Techn + `' SET r.descr = '` + node.Descr + `' SET r.origin = '` + origin + `' SET r.git = '` + repo + `'
				RETURN type(r)`
				} else { //update
					query = `MATCH (a {alias: '` + node.From + `'})-[r:` + node.GType + `]->(b {alias: '` + node.To + `'}) SET r.index = '` + node.Index + `' SET r.label = '` + node.Label + `' SET r.techn = '` + node.Techn + `' SET r.descr = '` + node.Descr + `' RETURN type(r)`
				}
			}
		}

		if query != "" {
			qResult, _, err := RunQuery(query, nil)
			if err != nil {
				log.Errorln("error while run create/update/delete node query: ", err)
			}
			log.Debugln("create/update/delete query node success: ", qResult)
		}

	}

	if boundaryAlias != "" {
		checkBound := `MATCH (a:` + node.GType + ` {alias: '` + node.Alias + `'})-[r:BOUNDARY]->(b {alias: '` + boundaryAlias + `'})  RETURN type(r), r.origin`
		boundCheck, _, err := RunQuery(checkBound, nil)
		if err != nil {
			log.Errorln("error while run check boundary relation query: ", err)
		}
		log.Debugln("boundary relation exist:", boundCheck)

		if boundCheck == "none" {
			relBound := `MATCH
				(a:` + node.GType + `),
				(b)
			WHERE a.alias = '` + node.Alias + `' AND b.alias = '` + boundaryAlias + `'
			CREATE (a)-[r:BOUNDARY]->(b) SET r.origin = '` + origin + `' SET r.git = '` + repo + `'
			RETURN type(r)`
			boundRel, _, err := RunQuery(relBound, nil)
			if err != nil {
				log.Errorln("Query add bounded relation error. ", err)
			}
			log.Infoln("Query add bounded relation success.", boundRel)
		}

	}

}

func RunQuery(query string, obj map[string]interface{}) (string, string, error) {
	log.Debugln("query string;", query, " object:", obj)

	uri := cnf.Neo4jURI
	username := cnf.Neo4jUser
	password := cnf.Neo4jPassword
	origin := ""

	driver, err := neo4j.NewDriver(uri, neo4j.BasicAuth(username, password, ""))
	if err != nil {
		return "", origin, err
	}
	defer driver.Close()

	session := driver.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close()

	wResult, err := session.WriteTransaction(func(transaction neo4j.Transaction) (interface{}, error) {
		var response []string
		result, err := transaction.Run(
			query, obj)
		if err != nil {
			return response, err
		}

		if result.Next() {

			log.Debugln("Query return number of values: ", len(result.Record().Values), result.Record().Values)
			log.Debugln("Query return number of keys:", len(result.Record().Keys), result.Record().Keys)
			if len(result.Record().Values) == 2 {

				org := result.Record().Values[1]
				origin = org.(string)
			}
			recId := result.Record().Values[0]
			response = append(response, recId.(string))
			response = append(response, origin)
			return response, nil
		}

		return response, result.Err()
	})
	if err != nil {
		return "", origin, err
	}

	result := "none"

	wResultSlc := wResult.([]string)

	if len(wResultSlc) == 0 {
		result = "none"
	} else {
		if len(wResultSlc) == 2 {
			origin = wResultSlc[1]
		}
		result = wResultSlc[0]
	}

	if result == "" {
		result = "none"
	}

	return result, origin, nil
}
