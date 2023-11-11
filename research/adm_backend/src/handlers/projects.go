package handlers

import (
	"context"

	iris "github.com/kataras/iris/v12"

	// cnf "github.com/rzrbld/adm_backend/config"
	// "github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"strconv"
)

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
