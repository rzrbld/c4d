package main

import (
	"fmt"

	"github.com/iris-contrib/middleware/cors"
	"github.com/kataras/iris/v12"
	cnf "github.com/rzrbld/c4ke_git_api/config"
	hdl "github.com/rzrbld/c4ke_git_api/handlers"

	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/gitlab"

	prometheusMiddleware "github.com/iris-contrib/middleware/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {

	gitlab.AuthURL = cnf.OauthAuthURL
	gitlab.TokenURL = cnf.OauthTokenURL
	gitlab.ProfileURL = cnf.OauthUserInfoURL

	goth.UseProviders(
		gitlab.New(cnf.OauthClientId, cnf.OauthClientSecret, cnf.OauthCallback),
		// gitlab.NewCustomisedURL(cnf.OauthClientId, cnf.OauthClientSecret, cnf.OauthCallback, cnf.OauthAuthURL, cnf.OauthTokenURL),
	)

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
	C4ke GIT API 
	Version    : 0.1
	Authors    : rzrbld
	License    : EULA
	` + "\033[00;00m")

	app := iris.New()

	crs := cors.New(cors.Options{
		AllowedOrigins:   []string{cnf.SvcCORS}, // allows everything, use that to change the hosts.
		AllowCredentials: true,
	})

	// prometheus metrics
	if cnf.MetricsEnable {
		m := prometheusMiddleware.New("git_svc", 0.3, 1.2, 5.0)
		app.Use(m.ServeHTTP)
		app.Get("/metrics", iris.FromStd(promhttp.Handler()))
	}

	app.Use(iris.Compression)

	if cnf.ProbesEnable {
		app.Get("/ready", hdl.Probes)
		app.Get("/live", hdl.Probes)
	}

	v1auth := app.Party("/auth/", crs).AllowMethods(iris.MethodOptions)
	{
		v1auth.Get("/logout/", hdl.AuthLogout)
		v1auth.Get("/", hdl.AuthRoot)
		v1auth.Get("/check", hdl.AuthCheck)
		v1auth.Get("/callback", hdl.AuthCallback)
	}

	v1 := app.Party("/", crs).AllowMethods(iris.MethodOptions)
	{
		v1.Post("/echo", hdl.Echo)
		v1.Get("/test", hdl.TestCall)
	}

	UserActions := app.Party("/users", crs).AllowMethods(iris.MethodOptions)
	{
		UserActions.Get("/info", hdl.UserInfo)
	}

	ReposActions := app.Party("/repos", crs).AllowMethods(iris.MethodOptions)
	{
		ReposActions.Get("/list", hdl.UserRepos)
		ReposActions.Post("/create", hdl.NewRepo)
	}

	app.Run(iris.Addr(cnf.SvcHostPort))
}
