package main

import (
	"github.com/iris-contrib/middleware/cors"
	"github.com/kataras/iris/v12"
	cnf "github.com/rzrbld/go-puml/config"
	hdl "github.com/rzrbld/go-puml/handlers"
)

func main() {
	app := iris.New()

	crs := cors.New(cors.Options{
		AllowedOrigins:   []string{cnf.SvcCORS}, // allows everything, use that to change the hosts.
		AllowCredentials: true,
	})

	app.Use(iris.Compression)

	v1 := app.Party("/", crs).AllowMethods(iris.MethodOptions)
	{
		v1.Post("/echo", hdl.Echo)
		v1.Post("/save", hdl.Save)
		v1.Post("/enc", hdl.PumlEnc)
	}

	app.Run(iris.Addr(cnf.SvcHostPort))
}
