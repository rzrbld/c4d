package handlers

import (
	"context"

	iris "github.com/kataras/iris/v12"

	// cnf "github.com/rzrbld/adm_backend/config"
	// "github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"strconv"
)

var CreateProject = func(ctx iris.Context) {
	if CheckAuthBeforeRequest(ctx) {
		var project Project
		if err := ctx.ReadJSON(&project); err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		err := pgClient.QueryRow(context.Background(),
			"INSERT INTO projects (name, description, git_link) VALUES ($1, $2, $3) RETURNING id",
			project.Name, project.Description, project.GitLink).
			Scan(&project.ID)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(project)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetProjectsList = func(ctx iris.Context) {

	page, error := ValidateIntParams("page", "1", ctx)
	if error != false {
		return
	}

	pageSize, error := ValidateIntParams("page_size", "10", ctx)
	if error != false {
		return
	}

	offset := (page - 1) * pageSize

	if CheckAuthBeforeRequest(ctx) {
		// var users User
		var projects []Project
		rows, err := pgClient.Query(context.Background(), "SELECT id, name, description, git_link, delete_, date_created, date_modified FROM projects WHERE delete_=false ORDER BY id LIMIT $1 OFFSET $2", pageSize, offset)
		if err != nil {
			log.Fatalln("Query failed:", err)
		}

		defer rows.Close()

		for rows.Next() {
			var project Project
			if err := rows.Scan(&project.ID, &project.Name, &project.Description, &project.GitLink, &project.Delete_, &project.Date_Created, &project.Date_Modified); err != nil {
				ctx.JSON(iris.Map{"error": err.Error()})
				return
			}
			projects = append(projects, project)
		}

		log.Debugln("Data", projects)
		ctx.JSON(projects)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetProject = func(ctx iris.Context) {
	projectId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		var project Project
		row := pgClient.QueryRow(context.Background(), "SELECT id, name, description, git_link,delete_,date_created, date_modified FROM projects WHERE id = $1", projectId)
		err := row.Scan(&project.ID, &project.Name, &project.Description, &project.GitLink, &project.Delete_, &project.Date_Created, &project.Date_Modified)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.JSON(iris.Map{"error": "Project not found"})
			return
		}

		log.Debugln("Data", project)
		ctx.JSON(project)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var DeleteProject = func(ctx iris.Context) {
	projectId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		_, err := pgClient.Exec(context.Background(), "UPDATE projects SET delete_=true WHERE id = $1", projectId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "Project deleted successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var UpdateProject = func(ctx iris.Context) {
	projectId := ctx.Params().Get("id")
	log.Infoln("Data", projectId)

	var project Project

	if CheckAuthBeforeRequest(ctx) {
		if err := ctx.ReadJSON(&project); err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{"error": "Invalid JSON payload"})
			return
		}

		var name, description, gitlink, delete_ string

		err := pgClient.QueryRow(context.Background(), "SELECT  name, description, git_link FROM projects WHERE id = $1 FOR UPDATE", projectId).
			Scan(&name, &description, &gitlink)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.JSON(iris.Map{"error": "Project not found", "info": err.Error()})
			return
		}

		// Update only non-zero fields
		if project.Name != "" {
			name = project.Name
		}
		if project.Description != "" {
			description = project.Description
		}
		if project.GitLink != "" {
			gitlink = project.GitLink
		}

		delete_ = strconv.FormatBool(project.Delete_)

		_, err = pgClient.Exec(context.Background(), "UPDATE projects SET name = $1, description = $2, git_link = $3, delete_ = $4, date_modified=NOW() WHERE id = $5",
			name, description, gitlink, delete_, projectId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "Project updated successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetProjectADRs = func(ctx iris.Context) {
	projectId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		// var groups Group
		var projectsADRs []ProjectADR
		rows, err := pgClient.Query(context.Background(), "select p.\"name\" as project_name, p.id as project_id, p.description as project_desc, p.git_link as project_repo, a.\"name\" as adr_name, a.git_link as adr_git_link, a.description as adr_desc, a.id as adr_id, padr.date_created as date_added, padr.date_modified as date_modified from projects as p, projects_adr_rel as padr, adrs as a where p.id=$1 and padr.delete_ =false  and padr.project_id  = p.id and a.id=padr.adr_id and a.delete_ =false", projectId)
		if err != nil {
			log.Fatalln("Query project failed:", err)
		}

		defer rows.Close()

		for rows.Next() {
			var projectsADR ProjectADR
			if err := rows.Scan(&projectsADR.Project_ID, &projectsADR.Project_Name, &projectsADR.Project_Description, &projectsADR.Project_GitLink, &projectsADR.Adr_ID, &projectsADR.Adr_Name, &projectsADR.Adr_Description, &projectsADR.Adr_GitLink, &projectsADR.Date_Added, &projectsADR.Date_Modified); err != nil {
				ctx.StatusCode(iris.StatusBadRequest)
				ctx.JSON(iris.Map{"error": err.Error()})
				return
			}
			projectsADRs = append(projectsADRs, projectsADR)
		}

		log.Debugln("Data", projectsADRs)
		ctx.JSON(projectsADRs)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetProjectArch = func(ctx iris.Context) {
	projectId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		// var groups Group
		var projectsArchs []ProjectArch
		rows, err := pgClient.Query(context.Background(), "select  p.\"name\" as project_name, p.id as project_id, p.description as project_desc, p.git_link as project_repo, arch.id as arch_id, arch.\"name\" as arch_name, arch.description as arch_desc, arch.git_link as arch_git_link, par.date_created as date_added, par.date_modified as date_modified  from  projects as p, projects_architectures_rel as par, architectures as arch where  p.id=$1 and  par.delete_ =false  and  par.project_id  = p.id and  arch.id=par.architecture_id  and  arch.delete_ =false", projectId)
		if err != nil {
			log.Fatalln("Query project failed:", err)
		}

		defer rows.Close()

		for rows.Next() {
			var projectsArch ProjectArch
			if err := rows.Scan(&projectsArch.Project_ID, &projectsArch.Project_Name, &projectsArch.Project_Description, &projectsArch.Project_GitLink, &projectsArch.Arch_ID, &projectsArch.Arch_Name, &projectsArch.Arch_Description, &projectsArch.Arch_GitLink, &projectsArch.Date_Added, &projectsArch.Date_Modified); err != nil {
				ctx.StatusCode(iris.StatusBadRequest)
				ctx.JSON(iris.Map{"error": err.Error()})
				return
			}
			projectsArchs = append(projectsArchs, projectsArch)
		}

		log.Debugln("Data", projectsArchs)
		ctx.JSON(projectsArchs)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}
