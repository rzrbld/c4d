package handlers

import (
	iris "github.com/kataras/iris/v12"
	cnf "github.com/rzrbld/adm_backend/config"
	auth "github.com/rzrbld/adm_backend/oauth"
	log "github.com/sirupsen/logrus"
)

var AuthLogout = func(ctx iris.Context) {
	auth.Logout(ctx)
	ctx.Redirect("/", iris.StatusTemporaryRedirect)
}

var AuthRoot = func(ctx iris.Context) {
	// try to get the user without re-authenticating
	if _, err := auth.CompleteUserAuth(ctx); err == nil {
		auth.Redirect(ctx)
		// ctx.JSON(iris.Map{"name": gothUser.Email, "auth": true, "oauth": cnf.OauthEnable})
	} else {
		auth.BeginAuthHandler(ctx)
	}
}

var AuthCheck = func(ctx iris.Context) {
	log.Debugln()
	if gothUser, err := auth.CompleteUserAuth(ctx); err == nil {
		ctx.ViewData("", gothUser)
		ctx.JSON(iris.Map{"name": gothUser.Email, "auth": true, "oauth": cnf.OauthEnable})
	} else {
		log.Debugln("GOTHUSER>>>", gothUser)
		ctx.JSON(iris.Map{"auth": false, "oauth": cnf.OauthEnable})
	}
}

var AuthCallback = func(ctx iris.Context) {
	user, err := auth.CompleteUserAuth(ctx)
	if err != nil {
		log.Debugln("Error in auth callback: ", err)
		ctx.StatusCode(iris.StatusInternalServerError)
		ctx.Text("%v", err)
		return
	}
	log.Debugln("User: ", user.Email)
	auth.Redirect(ctx)
}
