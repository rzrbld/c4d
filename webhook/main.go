package main

import (
	"fmt"

	log "github.com/sirupsen/logrus"

	"github.com/iris-contrib/middleware/cors"
	iris "github.com/kataras/iris/v12"

	cnf "github.com/rzrbld/webhook-catcher/config"
	"github.com/rzrbld/webhook-catcher/graph"
	lr "github.com/rzrbld/webhook-catcher/localrepo"
	"github.com/rzrbld/webhook-catcher/repository"
	"github.com/rzrbld/webhook-catcher/types"
)

func main() {
	fmt.Println("\033[31m\r\n" + `

          _____       .___      __                        __                
  ____   /  |  |    __| _/_____/  |_  ____   ____ _____ _/  |_  ___________ 
_/ ___\ /   |  |_  / __ |/ __ \   __\/  _ \ /    \\__  \\   __\/  _ \_  __ \
\  \___/    ^   / / /_/ \  ___/|  | (  <_> )   |  \/ __ \|  | (  <_> )  | \/
 \___  >____   |  \____ |\___  >__|  \____/|___|  (____  /__|  \____/|__|   
     \/     |__|       \/    \/                 \/     \/                   
	
	 ` + "\033[m")

	fmt.Println("\033[33m" + `
	Catcher for gogs webhooks

	Version    : 1.0
	Authors    : rzrbld
	License    : MIT
	` + "\033[00;00m")

	app := iris.New()

	lr.CleanupTempDir()
	cnf.SetLogLevel()

	crs := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // allows everything, use that to change the hosts.
		AllowCredentials: true,
	})

	v1 := app.Party("/webhook", crs).AllowMethods(iris.MethodOptions)
	{
		v1.Post("/event", func(ctx iris.Context) {
			var event types.Event

			err := ctx.ReadJSON(&event)
			if err != nil {
				log.Errorln("Error parse gogs event json:", err)
				// ctx.StopWithError(iris.StatusBadRequest, err)
				return
			}

			currCommitDir := repository.GitClone(event.Repository.Clone_url, event.After)
			prevCommitDir := currCommitDir

			if event.Before != "0000000000000000000000000000000000000000" {
				prevCommitDir = repository.GitClone(event.Repository.Clone_url, event.Before)
			}

			patch := lr.GetPatch(prevCommitDir, currCommitDir)

			allRmNodes, allRmRels := lr.GetRemovedStrings(string(patch))

			// then add new or update existed nodes and relations
			pumlFileList := lr.ReadLocalRepo(currCommitDir)
			allRels := make(map[string][]*types.GlobalType)
			allNodes := make(map[string][]*types.GlobalType)

			log.Infoln("puml files in set:", pumlFileList)

			if len(pumlFileList) > 0 {
				for i := 0; i < len(pumlFileList); i++ {
					frNodes, frRels := lr.FileReadLines(currCommitDir + "/" + pumlFileList[i])
					allRels[pumlFileList[i]] = frRels
					allNodes[pumlFileList[i]] = frNodes
				}
			} else {
				log.Infoln("No puml files found in repository")
			}

			lr.CleanupTempDir()

			log.Infoln("Create or update nodes: ", allNodes, ", relations:", allRels, ". Remove nodes: ", allRmNodes, ", relations:", allRmRels)

			graph.FroeachObjectsToGraph(allRmNodes, event.Repository.Clone_url, true)
			graph.FroeachObjectsToGraph(allRmRels, event.Repository.Clone_url, true)

			graph.FroeachObjectsToGraph(allNodes, event.Repository.Clone_url, false)
			graph.FroeachObjectsToGraph(allRels, event.Repository.Clone_url, false)

		})

	}

	app.Run(iris.Addr(cnf.SvcHostPort))
}
