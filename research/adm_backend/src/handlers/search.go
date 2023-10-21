package handlers

import (
	"context"

	iris "github.com/kataras/iris/v12"
	clnt "github.com/rzrbld/adm_backend/client"

	// log "github.com/sirupsen/logrus"
	// cnf "github.com/rzrbld/adm_backend/config"
	"github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
)

var pgClient = clnt.PGclient

var DoQuery = func(ctx iris.Context, query string) []User {
	// var users User
	rows, err := pgClient.Query(context.Background(), "select id,name,mail,delete_,date_created, date_modified from users")
	if err != nil {
		log.Fatalln("Query users failed:", err)
	}

	p, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])
	if err != nil {
		log.Fatalln("Query users failed:", err)
	}
	return p
}

var DoSearch = func(ctx iris.Context) {
	response := DoQuery(ctx, "query")
	log.Infoln("Data", response)
	ctx.JSON(response)

}
