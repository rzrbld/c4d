package main

import (
	"fmt"

	"github.com/iris-contrib/middleware/cors"
	iris "github.com/kataras/iris/v12"
	cnf "github.com/rzrbld/collection-api/config"
	gr "github.com/rzrbld/collection-api/graph"
	log "github.com/sirupsen/logrus"
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
	Collection api

	Version    : 1.1
	Authors    : rzrbld
	License    : MIT
	` + "\033[00;00m")

	app := iris.New()
	cnf.SetLogLevel()

	crs := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // allows everything, use that to change the hosts.
		AllowCredentials: true,
	})

	v1 := app.Party("/api/v1", crs).AllowMethods(iris.MethodOptions)
	{
		v1.Get("/nodes", func(ctx iris.Context) {
			qstring := ctx.URLParam("qstring")
			log.Debugln("/nodes route hit")
			allNodes := gr.GetAllNodesWithFilter(qstring)
			ctx.JSON(allNodes)
		})

		v1.Get("/repo", func(ctx iris.Context) {
			qstring := ctx.URLParam("qstring")
			log.Debugln("/nodes route hit")
			allNodes := gr.GetAllNodesAndRelsByGit(qstring)
			ctx.JSON(allNodes)
		})

		v1.Get("/node_rel", func(ctx iris.Context) {
			log.Debugln("/n-n-r route hit")
			allNodes := gr.GetAllNodesAndRelations()
			ctx.JSON(allNodes)
		})
	}

	app.Run(iris.Addr(cnf.SvcHostPort))
}
