package main

import (
	"fmt"
	"time"
	"github.com/iris-contrib/middleware/cors"
	"github.com/kataras/iris/v12"
	cnf "github.com/rzrbld/c4ke_git_api/config"
	hdl "github.com/rzrbld/c4ke_git_api/handlers"

	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/gitlab"

	prometheusMiddleware "github.com/iris-contrib/middleware/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// User represents the Users Table
type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Mail         string    `json:"mail"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// Project represents the Projects Table
type Project struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	GitLink      string    `json:"git_link"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// Architecture represents the Architectures Table
type Architecture struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	GitLink      string    `json:"git_link"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// ADR represents the ADRs (Architectural Decision Records) Table
type ADR struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	GitLink      string    `json:"git_link"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// Group represents the Groups Table
type Group struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// GroupUserRelationship represents the Groups Users Relationship Table
type GroupUserRelationship struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	GroupID      string    `json:"group_id"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// ProjectArchitectureRelationship represents the Projects Architectures Relationship Table
type ProjectArchitectureRelationship struct {
	ID           string    `json:"id"`
	ProjectID    string    `json:"project_id"`
	ArchitectureID string  `json:"architecture_id"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// UserProjectRelationship represents the Users Projects Relationship Table
type UserProjectRelationship struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	ProjectID    string    `json:"project_id"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// ProjectADRRelationship represents the Projects ADR Relationship Table
type ProjectADRRelationship struct {
	ID           string    `json:"id"`
	ProjectID    string    `json:"project_id"`
	ADRID        string    `json:"adr_id"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

// ProjectGroupRelationship represents the Projects Groups Relationship Table
type ProjectGroupRelationship struct {
	ID           string    `json:"id"`
	ProjectID    string    `json:"project_id"`
	GroupID      string    `json:"group_id"`
	Delete       bool      `json:"delete"`
	DateCreated  time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}



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

	FileActions := app.Party("/files", crs).AllowMethods(iris.MethodOptions)
	{
		FileActions.Post("/commit", hdl.NewCommit)
		FileActions.Post("/content", hdl.GetFile)
	}

	app.Run(iris.Addr(cnf.SvcHostPort))
}
