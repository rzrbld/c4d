package handlers

import (
	log "github.com/sirupsen/logrus"

	iris "github.com/kataras/iris/v12"
	audit "github.com/rzrbld/adm_backend/audit"
	cnf "github.com/rzrbld/adm_backend/config"
	auth "github.com/rzrbld/adm_backend/oauth"
)

func DefaultResHandler(ctx iris.Context, err error) iris.Map {
	log.Debugln("DefaultResHandler is called")
	if cnf.OauthEnable {
		if gothUser, err := auth.CompleteUserAuth(ctx); err == nil {
			audit.DefaultAuditLog(gothUser, ctx)
			return DefaultResConstructor(err)
		} else {
			return iris.Map{"auth": false, "oauth": cnf.OauthEnable}
		}
	} else {
		return DefaultResConstructor(err)
	}
}

func CheckAuthBeforeRequest(ctx iris.Context) bool {
	if cnf.OauthEnable {
		if _, err := auth.CompleteUserAuth(ctx); err == nil {
			return true
		} else {
			return false
		}
	} else {
		return true
	}
}

func BodyResHandler(ctx iris.Context, err error, body interface{}) interface{} {
	log.Debugln("BodyResHandler is called")
	if cnf.OauthEnable {
		if gothUser, err := auth.CompleteUserAuth(ctx); err == nil {
			audit.DefaultAuditLog(gothUser, ctx)
			return BodyResConstructor(err, body)
		} else {
			return iris.Map{"auth": false, "oauth": cnf.OauthEnable}
		}
	} else {
		return BodyResConstructor(err, body)
	}
}

func BodyResConstructor(err error, body interface{}) interface{} {
	var resp interface{}
	if err != nil {
		log.Errorln(err)
		resp = iris.Map{"error": err.Error()}
	} else {
		resp = body
	}
	return resp
}

func DefaultResConstructor(err error) iris.Map {
	var resp iris.Map
	if err != nil {
		log.Errorln(err)
		resp = iris.Map{"error": err.Error()}
	} else {
		resp = iris.Map{"Success": "OK"}
	}
	return resp
}

func DefaultAuthError() interface{} {
	log.Debugln("DefaultAuthError is called")
	return iris.Map{"auth": false, "oauth": cnf.OauthEnable}
}
