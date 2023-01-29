package handlers

import (
	"io"

	iris "github.com/kataras/iris/v12"
	clnt "github.com/rzrbld/c4ke_git_api/clients"

	resph "github.com/rzrbld/c4ke_git_api/response"
	log "github.com/sirupsen/logrus"
)

var Echo = func(ctx iris.Context) {
	rawData, _ := io.ReadAll(ctx.Request().Body)
	ctx.Binary(rawData)
}

var TestCall = func(ctx iris.Context) {

	if resph.CheckAuthBeforeRequest(ctx) {

		GLclient, err := clnt.GetClient(ctx)

		if err != nil {
			log.Errorln("Error while getting client")
		}

		version, resp, err := GLclient.Version.GetVersion()

		if err != nil {
			log.Errorln("Error while getting version", err, resp)
		}

		log.Debugln("GIT VERSION >>>", version)

		ctx.JSON(version)
	} else {
		ctx.JSON(resph.DefaultAuthError())
	}
}
