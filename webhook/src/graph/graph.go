package graph

import (
	"reflect"

	"github.com/mitchellh/mapstructure"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
	c4dtypes "github.com/rzrbld/puml-c4-to-object-go/types"
	cnf "github.com/rzrbld/webhook-catcher/config"
	"github.com/rzrbld/webhook-catcher/types"
	log "github.com/sirupsen/logrus"
)

func FroeachObjectsToGraph(objMap map[string][]*c4dtypes.ParserGenericType, repoURI string, removeFlag bool, isRelFlag bool) {
	for k, v := range objMap {
		for i := 0; i < len(v); i++ {
			log.Infoln("object with key: ", k, " object: ", v[i], " and remove flag: ", removeFlag)
			origin := repoURI + "/" + k
			originId := originNode(origin, repoURI)
			// add create file node
			RunQueryBuilder(v[i].Object, v[i].BoundaryAlias, removeFlag, origin, repoURI, isRelFlag, originId)
		}
	}
}

func originNode(origin string, repo string) string {
	check := `MATCH (a:OriginGit {uri: "` + origin + `"}) RETURN id(a)+''`
	query := ""
	originId := ""
	originResult := ""

	checkR, originResult, err := RunQuery(check, nil)
	if err != nil {
		log.Errorln("error while run check origin query: ", err)
	}
	log.Debugln("check query origin success: ", originResult)

	if checkR == "none" { //create
		query = "CREATE (a:OriginGit {uri:  '" + origin + "', deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
		originId, originResult, err = RunQuery(query, nil)
	} else {
		originId = checkR
	}

	if err != nil {
		log.Errorln("error while run create origin query: ", "check status:", checkR, err)
	}
	log.Debugln("create query origin success: ", "check status:", checkR, originResult)

	return originId
}

func rmNode(checkR string, origin string, nodeOrigin string, nodeGType string) {
	if checkR != "none" && origin == nodeOrigin {
		query := `MATCH (a:` + nodeGType + ` {alias: $Alias}) SET a.deleted=true RETURN '' + id(a)`
		QueryHandler(query, nil)
	}
}

func rmRel(checkBound string, origin string, relOrigin string, nodeFrom string, nodeGType string, nodeTo string) {
	if checkBound != "none" && origin == relOrigin {
		query := `MATCH (a {alias:'` + nodeFrom + `'})-[r:` + nodeGType + `]->(b {alias: '` + nodeTo + `'}) DELETE r RETURN type(r)`
		QueryHandler(query, nil)
	}
}

func QueryHandler(query string, obj map[string]interface{}) {
	if query != "" {
		qResult, _, err := RunQuery(query, obj)
		if err != nil {
			log.Errorln("error while run create/update/delete node query: ", err)
		}
		log.Debugln("create/update/delete query node success: ", qResult)
	}
}

func RunQueryBuilder(obj map[string]interface{}, boundaryAlias string, rmFlag bool, origin string, repo string, isRelFlag bool, originId string) {
	query := ""
	log.Debugln("Get type of object: ", reflect.TypeOf(obj))
	var node types.GraphObj
	err := mapstructure.Decode(obj, &node)
	if err != nil {
		log.Errorln("Some went wrong on map structure. ", err)
	}

	if !isRelFlag {

		check := `MATCH (a:` + node.GType + ` {alias: $Alias}) RETURN id(a)+'', a.origin`
		checkR, nodeOrigin, err := RunQuery(check, obj)

		if rmFlag && checkR != "none" && origin == nodeOrigin {
			rmNode(checkR, origin, nodeOrigin, node.GType)
			return
		}

		if err != nil {
			log.Errorln("Error while check node exist. ", err)
		}

		log.Debugln("Node check found: ", checkR, ". Node origin: ", nodeOrigin, ". Delete flag: ", rmFlag)

		switch ntype := node.GType; ntype {

		case "Component", "ComponentDb", "ComponentQueue", "Component_Ext", "ComponentDb_Ext", "ComponentQueue_Ext", "Container", "ContainerDb", "ContainerQueue", "Container_Ext", "ContainerDb_Ext", "ContainerQueue_Ext":

			if checkR == "none" { //create
				query = "CREATE (a:" + node.GType + "{alias: $Alias, label: $Label, techn: $Techn, descr: $Descr, deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
			} else { //update
				if origin == nodeOrigin {
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.alias=$Alias SET a.label=$Label SET a.techn=$Techn SET a.descr=$Descr SET a.deleted=false RETURN '' + id(a)`
				}
			}

		case "Person", "Person_Ext", "System", "System_Ext", "SystemDb", "SystemQueue", "SystemDb_Ext", "SystemQueue_Ext", "Enterprise":

			if checkR == "none" { //create
				query = "CREATE (a:" + node.GType + "{alias: $Alias, label: $Label, descr: $Descr, deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
			} else { //update
				if origin == nodeOrigin {
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.alias=$Alias SET a.label=$Label SET a.descr=$Descr SET a.deleted=false RETURN '' + id(a)`
				}
			}

		case "Enterprise_Boundary", "System_Boundary", "Container_Boundary":

			if checkR == "none" { //create
				query = "CREATE (a:" + node.GType + "{alias: $Alias, label: $Label, type: $Type, deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
			} else { //update
				if origin == nodeOrigin {
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.alias=$Alias SET a.label=$Label SET a.type=$Type SET a.deleted=false RETURN '' + id(a)`
				}
			}

		case "Deployment_Node", "Deployment_Node_L", "Deployment_Node_R", "Node", "Node_L", "Node_R":

			if checkR == "none" { //create
				query = "CREATE (a:" + node.GType + "{alias: $Alias, label: $Label, type: $Type, descr: $Descr, deleted: false, origin: '" + origin + "', git: '" + repo + "'}) RETURN '' + id(a)"
			} else { //update
				if origin == nodeOrigin {
					query = `MATCH (a:` + node.GType + ` {alias: $Alias}) SET a.alias=$Alias SET a.label=$Label SET a.type=$Type SET a.descr=$Descr SET a.deleted=false RETURN '' + id(a)`
				}
			}

		}

		QueryHandler(query, obj)

	} else {

		checkBound := `MATCH (a {alias: '` + node.From + `'})-[r:` + node.GType + `]->(b {alias: '` + node.To + `'})  RETURN type(r), r.origin`
		boundCheck, relOrigin, err := RunQuery(checkBound, nil)
		if err != nil {
			log.Errorln("Error while check relation exist. ", err)
		}

		log.Debugln("Relation exist: ", boundCheck, ", remove flag: ", rmFlag, " existed origin: ", relOrigin, " saved origin: ", origin)

		if rmFlag && checkBound != "none" && origin == relOrigin {
			rmRel(checkBound, origin, relOrigin, node.From, node.GType, node.To)
			return
		}

		switch ntype := node.GType; ntype {
		case "Rel", "Rel_Back", "Rel_Neighbor", "Rel_Back_Neighbor", "Rel_D", "Rel_Down", "Rel_U", "Rel_Up", "Rel_L", "Rel_Left", "Rel_R", "Rel_Right":

			if boundCheck == "none" { //create
				query = `MATCH
				(a),
				(b)
			WHERE a.alias = '` + node.From + `' AND b.alias = '` + node.To + `'
			CREATE (a)-[r:` + node.GType + `]->(b)
			SET r.to = '` + node.To + `' SET r.from = '` + node.From + `' SET r.label = '` + node.Label + `' SET r.techn = '` + node.Techn + `' SET r.descr = '` + node.Descr + `' SET r.origin = '` + origin + `' SET r.git = '` + repo + `'
			RETURN type(r)`
			} else { //update
				query = `MATCH (a {alias: '` + node.From + `'})-[r:` + node.GType + `]->(b {alias: '` + node.To + `'}) SET r.to = '` + node.To + `' SET r.from = '` + node.From + `' SET r.label = '` + node.Label + `' SET r.techn = '` + node.Techn + `' SET r.descr = '` + node.Descr + `' RETURN type(r)`
			}

		case "RelIndex", "RelIndex_Back", "RelIndex_Neighbor", "RelIndex_Back_Neighbor", "RelIndex_D", "RelIndex_Down", "RelIndex_U", "RelIndex_Up", "RelIndex_L", "RelIndex_Left", "RelIndex_R", "RelIndex_Right":

			if boundCheck == "none" { //create
				query = `MATCH
				(a),
				(b)
			WHERE a.alias = '` + node.From + `' AND b.alias = '` + node.To + `'
			CREATE (a)-[r:` + node.GType + `]->(b)
			SET r.to = '` + node.To + `' SET r.from = '` + node.From + `' SET r.index = '` + node.Index + `'SET r.label = '` + node.Label + `' SET r.techn = '` + node.Techn + `' SET r.descr = '` + node.Descr + `' SET r.origin = '` + origin + `' SET r.git = '` + repo + `'
			RETURN type(r)`
			} else { //update
				query = `MATCH (a {alias: '` + node.From + `'})-[r:` + node.GType + `]->(b {alias: '` + node.To + `'}) SET r.to = '` + node.To + `' SET r.from = '` + node.From + `' SET r.index = '` + node.Index + `' SET r.label = '` + node.Label + `' SET r.techn = '` + node.Techn + `' SET r.descr = '` + node.Descr + `' RETURN type(r)`
			}
		}

		QueryHandler(query, nil)

	}

	if originId != "" && originId != "none" {
		// MATCH (a:Container {alias: 'mobile_app'})-[r:origin]->(b:OriginGit {uri: 'http://ya.ru/1'})  RETURN type(r), r.origin
		checkOriginRelQ := `MATCH (a:` + node.GType + ` {alias: '` + node.Alias + `'})-[r:ORIGIN]->(b:OriginGit {uri: '` + boundaryAlias + `'})  RETURN type(r), r.origin`
		originRel, _, err := RunQuery(checkOriginRelQ, nil)
		if err != nil {
			log.Errorln("error while run check boundary relation query: ", err, "QUERY: ", checkOriginRelQ)
		}
		log.Debugln("boundary relation exist:", originRel)

		if originRel == "none" {
			// MATCH (a:Container {alias:'mobile_app'}), (b:OriginGit) WHERE id(b) = 16
			// CREATE (a)-[r:ORIGIN]->(b) SET r.to = 'mobile_app' SET r.from = 16 SET r.origin=16 RETURN type(r)
			createOriginQ := `MATCH
				(a:` + node.GType + ` {alias:'` + node.Alias + `'}),
				(b:OriginGit)
			WHERE id(b) = ` + originId + `
			CREATE (a)-[r:ORIGIN]->(b) SET r.to = '` + node.Alias + `' SET r.from = ` + originId + ` SET r.origin = '` + origin + `' SET r.git = '` + repo + `'
			RETURN type(r)`
			createOriginRel, _, err := RunQuery(createOriginQ, nil)
			if err != nil {
				log.Errorln("Query add origin relation ERROR. ", err, "QUERY: ", createOriginQ)
			}
			log.Infoln("Query add origin relation success.", createOriginRel)
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
			CREATE (a)-[r:BOUNDARY]->(b) SET r.to = '` + boundaryAlias + `' SET r.from = '` + node.Alias + `' SET r.origin = '` + origin + `' SET r.git = '` + repo + `'
			RETURN type(r)`
			boundRel, _, err := RunQuery(relBound, nil)
			if err != nil {
				log.Errorln("Query add bounded relation ERROR. ", err)
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
