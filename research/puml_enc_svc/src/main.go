package main

import (
	"fmt"

	"github.com/iris-contrib/middleware/cors"
	"github.com/kataras/iris/v12"
	cnf "github.com/rzrbld/go-puml/config"
	hdl "github.com/rzrbld/go-puml/handlers"

	prometheusMiddleware "github.com/iris-contrib/middleware/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {

	fmt.Println("\033[31m\r\n" + `
    .____/\ .____/\ ._______
    :   /  \:   /  \: .____/
    |.  ___/|.  ___/| : _/\ 
    |     \ |     \ |   /  \
    |      \|      \|_.: __/
    |___\  /|___\  /   :/   
         \/      \/         													
	 ` + "\033[m")

	fmt.Println("\033[33m" + `
	C4ke ENC service API 
	Version    : 0.1
	Authors    : rzrbld
	License    : EULA
	` + "\033[00;00m")

	app := iris.New()

	// prometheus metrics
	if cnf.MetricsEnable {
		m := prometheusMiddleware.New("enc_svc", 0.3, 1.2, 5.0)
		app.Use(m.ServeHTTP)
		app.Get("/metrics", iris.FromStd(promhttp.Handler()))
	}

	crs := cors.New(cors.Options{
		AllowedOrigins:   []string{cnf.SvcCORS}, // allows everything, use that to change the hosts.
		AllowCredentials: true,
	})

	app.Use(iris.Compression)

	if cnf.ProbesEnable {
		app.Get("/ready", hdl.Probes)
		app.Get("/live", hdl.Probes)
	}

	v1 := app.Party("/", crs).AllowMethods(iris.MethodOptions)
	{
		v1.Post("/echo", hdl.Echo)
		v1.Post("/save", hdl.Save)
		v1.Post("/enc", hdl.PumlEnc)

	}

	app.Run(iris.Addr(cnf.SvcHostPort))
}
