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
			log.Errorln("Error while getting list of projects", err)
		}

		ctx.JSON(project)
	} else {
		ctx.JSON(resph.DefaultAuthError())
	}

}

var NewRepo = func(ctx iris.Context) {

	if resph.CheckAuthBeforeRequest(ctx) {

		var pName = ctx.FormValue("Name")
		var pDesc = ctx.FormValue("Description")
		var pVisi = ctx.FormValue("Visibility")

		pVisibility := gitlab.PrivateVisibility

		switch pVisi {
		case "Internal":
			pVisibility = gitlab.InternalVisibility

		case "Public":
			pVisibility = gitlab.PublicVisibility
		}

		GLclient, err := clnt.GetClient(ctx)

		if err != nil {
			log.Errorln("Error while getting client")
		}

		// Create new project
		projectOptions := &gitlab.CreateProjectOptions{
			Name:                 gitlab.String(pName),
			Description:          gitlab.String(pDesc),
			MergeRequestsEnabled: gitlab.Bool(true),
			SnippetsEnabled:      gitlab.Bool(false),
			Visibility:           gitlab.Visibility(pVisibility),
		}

		project, _, err := GLclient.Projects.CreateProject(projectOptions)

		if err != nil {
			log.Errorln("Error while getting users", err)
		}

		ctx.JSON(project)
	} else {
		ctx.JSON(resph.DefaultAuthError())
	}

}
