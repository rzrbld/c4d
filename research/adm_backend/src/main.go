package main

import (
	"fmt"
	"os"

	"github.com/iris-contrib/middleware/cors"
	prometheusMiddleware "github.com/iris-contrib/middleware/prometheus"
	iris "github.com/kataras/iris/v12"
	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/openidConnect"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	cnf "github.com/rzrbld/adm_backend/config"
	hdl "github.com/rzrbld/adm_backend/handlers"
	// log "github.com/sirupsen/logrus"
)

func main() {
	openidConnect, _ := openidConnect.New(cnf.OauthClientId, cnf.OauthClientSecret, cnf.OauthCallback, cnf.OauthDiscoveryURL)
	if openidConnect != nil {
		goth.UseProviders(openidConnect)
	}

	fmt.Println("\033[31m\r\n" + `  
 ██████╗██╗  ██╗██╗  ██╗███████╗         █████╗ ██████╗ ███╗   ███╗
██╔════╝██║  ██║██║ ██╔╝██╔════╝        ██╔══██╗██╔══██╗████╗ ████║
██║     ███████║█████╔╝ █████╗          ███████║██║  ██║██╔████╔██║
██║     ╚════██║██╔═██╗ ██╔══╝          ██╔══██║██║  ██║██║╚██╔╝██║
╚██████╗     ██║██║  ██╗███████╗███████╗██║  ██║██████╔╝██║ ╚═╝ ██║
 ╚═════╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝																																
 ` + "\033[m")

	fmt.Println("\033[33mC4ke adm svc")
	fmt.Println("Version    : 1.0")
	fmt.Println("Authors    : rzrbld")
	fmt.Println("License    : MIT")

	app := iris.New()

	// CORS config
	crs := cors.New(cors.Options{
		AllowedOrigins:   []string{cnf.MyCORS}, // allows everything, use that to change the hosts.
		AllowCredentials: true,
		AllowedHeaders:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS", "PUT", "DELETE"},
	})

	// prometheus metrics route
	if cnf.MetricsEnable {
		m := prometheusMiddleware.New("adminio", 0.3, 1.2, 5.0)
		app.Use(m.ServeHTTP)
		app.Get("/metrics", iris.FromStd(promhttp.Handler()))
	}

	// k8s probes route
	if cnf.ProbesEnable {
		app.Get("/ready", hdl.Probes)
		app.Get("/live", hdl.Probes)
	}

	v1auth := app.Party("/auth", crs).AllowMethods(iris.MethodOptions)
	{
		v1auth.Get("/logout/", hdl.AuthLogout)
		v1auth.Get("/", hdl.AuthRoot)
		v1auth.Get("/check", hdl.AuthCheck)
		v1auth.Get("/callback", hdl.AuthCallback)
	}

	app.Get("/", func(ctx iris.Context) {
		b, err := os.ReadFile("templates/index.html") // just pass the file name
		if err != nil {
			fmt.Print(err)
		}

		str := string(b) // convert content to a 'string'

		ctx.HTML(str)
	})

	//main routes
	v1Users := app.Party("/api/v1/users", crs).AllowMethods(iris.MethodOptions)
	{
		v1Users.Get("/", hdl.GetUsersList)
		v1Users.Get("/{id:uuid}", hdl.GetUser)
		v1Users.Delete("/{id:uuid}", hdl.DeleteUser)
		v1Users.Put("/{id:uuid}", hdl.UpdateUser)
	}

	v1Projects := app.Party("/api/v1/projects", crs).AllowMethods(iris.MethodOptions)
	{
		v1Projects.Get("/", hdl.GetProjectsList)
		v1Projects.Get("/{id:uuid}", hdl.GetProject)
		v1Projects.Delete("/{id:uuid}", hdl.DeleteProject)
		v1Projects.Put("/{id:uuid}", hdl.UpdateProject)
	}

	app.Run(iris.Addr(cnf.MyHostPort))
}
