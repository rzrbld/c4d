package handlers

import (
	iris "github.com/kataras/iris/v12"
	clnt "github.com/rzrbld/c4ke_git_api/clients"
	resph "github.com/rzrbld/c4ke_git_api/response"
	log "github.com/sirupsen/logrus"
	gitlab "github.com/xanzy/go-gitlab"
)

var UserRepos = func(ctx iris.Context) {

	if resph.CheckAuthBeforeRequest(ctx) {

		GLclient, err := clnt.GetClient(ctx)

		if err != nil {
			log.Errorln("Error while getting client")
		}

		project, _, err := GLclient.Projects.ListProjects(&gitlab.ListProjectsOptions{})

		if err != nil {
			log.Errorln("Error while getting users", err)
		}

		log.Debugln("GIT VERSION >>>", project)

		ctx.JSON(project)
	} else {
		ctx.JSON(resph.DefaultAuthError())
	}

}
