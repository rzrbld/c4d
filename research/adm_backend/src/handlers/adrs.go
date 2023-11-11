package handlers

import (
	"context"

	iris "github.com/kataras/iris/v12"

	// cnf "github.com/rzrbld/adm_backend/config"
	// "github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"strconv"
)

var GetAdrsList = func(ctx iris.Context) {

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
		// var adrs Adr
		var adrs []Adr
		rows, err := pgClient.Query(context.Background(), "select id,name,description,git_link,delete_,date_created, date_modified from adrs WHERE delete_=false ORDER BY id LIMIT $1 OFFSET $2", pageSize, offset)
		if err != nil {
			log.Fatalln("Query adrs failed:", err)
		}

		defer rows.Close()

		for rows.Next() {
			var adr Adr
			if err := rows.Scan(&adr.ID, &adr.Name, &adr.Description, &adr.GitLink, &adr.Delete_, &adr.Date_Created, &adr.Date_Modified); err != nil {
				ctx.JSON(iris.Map{"error": err.Error()})
				return
			}
			adrs = append(adrs, adr)
		}

		log.Debugln("Data", adrs)
		ctx.JSON(adrs)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetAdr = func(ctx iris.Context) {
	adrId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		var adr Adr
		row := pgClient.QueryRow(context.Background(), "SELECT id,name,description,git_link,delete_,date_created, date_modified FROM adrs WHERE id = $1", adrId)
		err := row.Scan(&adr.ID, &adr.Name, &adr.Description, &adr.GitLink, &adr.Delete_, &adr.Date_Created, &adr.Date_Modified)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.JSON(iris.Map{"error": "Adr not found"})
			return
		}

		log.Debugln("Data", adr)
		ctx.JSON(adr)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var DeleteAdr = func(ctx iris.Context) {
	adrId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		_, err := pgClient.Exec(context.Background(), "UPDATE adrs SET delete_=true WHERE id = $1", adrId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "Adr deleted successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var UpdateAdr = func(ctx iris.Context) {
	adrId := ctx.Params().Get("id")
	log.Infoln("Data", adrId)

	var adr Adr

	if CheckAuthBeforeRequest(ctx) {
		if err := ctx.ReadJSON(&adr); err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{"error": "Invalid JSON payload"})
			return
		}

		var name, description, gitlink, delete_ string

		err := pgClient.QueryRow(context.Background(), "SELECT name,description,git_link FROM adrs WHERE id = $1 FOR UPDATE", adrId).
			Scan(&name, &description, &gitlink)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.JSON(iris.Map{"error": "Adr not found", "info": err.Error()})
			return
		}

		// Update only non-zero fields
		if adr.Name != "" {
			name = adr.Name
		}
		if adr.Description != "" {
			description = adr.Description
		}
		if adr.GitLink != "" {
			gitlink = adr.GitLink
		}

		delete_ = strconv.FormatBool(adr.Delete_)

		_, err = pgClient.Exec(context.Background(), "UPDATE adrs SET name = $1, description = $2, git_link=$3 ,delete_ = $4, date_modified=NOW() WHERE id = $5",
			name, description, gitlink, delete_, adrId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "Adr updated successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}
