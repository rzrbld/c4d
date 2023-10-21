package client

import (
	"context"

	"github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
)

var PGclient *pgx.Conn
var err error

func init() {
	var pg_uri = "postgres://postgres:passw00rd@192.168.50.241:5432/c4ke"
	PGclient, err = pgx.Connect(context.Background(), pg_uri)
	if err != nil {
		log.Fatalln("Unable to connect to database: %v\n", err)
	}
	// defer PGclient.Close(context.Background())

	// var name string
	// var weight int64
	// err = PGclient.QueryRow(context.Background(), "select name from Users limit 1", 42).Scan(&name, &weight)
	// if err != nil {
	// 	log.Fatalln("QueryRow failed: %v\n", err)
	// }

	// log.Infoln(name, weight)
}
