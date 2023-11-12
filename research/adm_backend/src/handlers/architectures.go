package handlers

import (
	"context"

	iris "github.com/kataras/iris/v12"

	// cnf "github.com/rzrbld/adm_backend/config"
	// "github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"strconv"
)

var CreateArchitecture = func(ctx iris.Context) {
	if CheckAuthBeforeRequest(ctx) {
		var architecture Architecture
		if err := ctx.ReadJSON(&architecture); err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		err := pgClient.QueryRow(context.Background(),
			"INSERT INTO architectures (name, description, git_link) VALUES ($1, $2, $3) RETURNING id",
			architecture.Name, architecture.Description, architecture.GitLink).
			Scan(&architecture.ID)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(architecture)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetArchitecturesList = func(ctx iris.Context) {

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
		// var architectures Architecture
		var architectures []Architecture
		rows, err := pgClient.Query(context.Background(), "select id,name,description,git_link,delete_,date_created, date_modified from architectures WHERE delete_=false ORDER BY id LIMIT $1 OFFSET $2", pageSize, offset)
		if err != nil {
			log.Fatalln("Query architectures failed:", err)
		}

		defer rows.Close()

		for rows.Next() {
			var architecture Architecture
			if err := rows.Scan(&architecture.ID, &architecture.Name, &architecture.Description, &architecture.GitLink, &architecture.Delete_, &architecture.Date_Created, &architecture.Date_Modified); err != nil {
				ctx.JSON(iris.Map{"error": err.Error()})
				return
			}
			architectures = append(architectures, architecture)
		}

		log.Debugln("Data", architectures)
		ctx.JSON(architectures)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetArchitecture = func(ctx iris.Context) {
	architectureId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		var architecture Architecture
		row := pgClient.QueryRow(context.Background(), "SELECT id,name,description,git_link,delete_,date_created, date_modified FROM architectures WHERE id = $1", architectureId)
		err := row.Scan(&architecture.ID, &architecture.Name, &architecture.Description, &architecture.GitLink, &architecture.Delete_, &architecture.Date_Created, &architecture.Date_Modified)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.JSON(iris.Map{"error": "Architecture not found"})
			return
		}

		log.Debugln("Data", architecture)
		ctx.JSON(architecture)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var DeleteArchitecture = func(ctx iris.Context) {
	architectureId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		_, err := pgClient.Exec(context.Background(), "UPDATE architectures SET delete_=true WHERE id = $1", architectureId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "Architecture deleted successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var UpdateArchitecture = func(ctx iris.Context) {
	architectureId := ctx.Params().Get("id")
	log.Infoln("Data", architectureId)

	var architecture Architecture

	if CheckAuthBeforeRequest(ctx) {
		if err := ctx.ReadJSON(&architecture); err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{"error": "Invalid JSON payload"})
			return
		}

		var name, description, gitlink, delete_ string

		err := pgClient.QueryRow(context.Background(), "SELECT name,description,git_link FROM architectures WHERE id = $1 FOR UPDATE", architectureId).
			Scan(&name, &description, &gitlink)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.JSON(iris.Map{"error": "Architecture not found", "info": err.Error()})
			return
		}

		// Update only non-zero fields
		if architecture.Name != "" {
			name = architecture.Name
		}
		if architecture.Description != "" {
			description = architecture.Description
		}
		if architecture.GitLink != "" {
			gitlink = architecture.GitLink
		}

		delete_ = strconv.FormatBool(architecture.Delete_)

		_, err = pgClient.Exec(context.Background(), "UPDATE architectures SET name = $1, description = $2, git_link=$3 ,delete_ = $4, date_modified=NOW() WHERE id = $5",
			name, description, gitlink, delete_, architectureId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "Architecture updated successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}
