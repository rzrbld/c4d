package oauth

import (
	"errors"
	"github.com/gorilla/securecookie"
	iris "github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
	"github.com/markbates/goth"
	cnf "github.com/rzrbld/adm_backend/config"
	log "github.com/sirupsen/logrus"
)

var (
	sessionsManager *sessions.Sessions
)

func init() {
	cookieName := cnf.ScCookieName
	hashKey := securecookie.GenerateRandomKey(64)
	blockKey := securecookie.GenerateRandomKey(32)
	secureCookie := securecookie.New(hashKey, blockKey)

	sessionsManager = sessions.New(sessions.Config{
		Cookie:       cookieName,
		Encoding:     secureCookie,
		AllowReclaim: true,
	})
}

var GetProviderName = func(ctx iris.Context) (string, error) {
	return cnf.OauthProvider, nil
}

func BeginAuthHandler(ctx iris.Context) {
	url, err := GetAuthURL(ctx)
	if err != nil {
		ctx.StopWithError(iris.StatusBadRequest, err)
		return
	}

	ctx.Redirect(url, iris.StatusTemporaryRedirect)
}

func GetAuthURL(ctx iris.Context) (string, error) {
	providerName, err := GetProviderName(ctx)
	if err != nil {
		return "", err
	}

	provider, err := goth.GetProvider(providerName)
	if err != nil {
		return "", err
	}
	sess, err := provider.BeginAuth(SetState(ctx))
	if err != nil {
		return "", err
	}

	url, err := sess.GetAuthURL()
	if err != nil {
		return "", err
	}
	session := sessionsManager.Start(ctx)
	session.Set(providerName, sess.Marshal())
	return url, nil
}

var SetState = func(ctx iris.Context) string {
	state := ctx.URLParam("state")
	if len(state) > 0 {
		return state
	}
	return "state"
}

var GetState = func(ctx iris.Context) string {
	return ctx.URLParam("state")
}

var CompleteUserAuth = func(ctx iris.Context) (goth.User, error) {
	providerName, err := GetProviderName(ctx)
	if err != nil {
		return goth.User{}, err
	}

	provider, err := goth.GetProvider(providerName)
	if err != nil {
		return goth.User{}, err
	}
	session := sessionsManager.Start(ctx)
	value := session.GetString(providerName)
	log.Debugln("session value for " + providerName + " found! with value: " + value)
	if value == "" {
		log.Debugln("session value for " + providerName + " not found")
		return goth.User{}, errors.New("session value for " + providerName + " not found")
	}

	sess, err := provider.UnmarshalSession(value)
	if err != nil {
		return goth.User{}, err
	}

	user, err := provider.FetchUser(sess)
	if err == nil {
		// user can be found with existing session data
		return user, err
	}

	// get new token and retry fetch
	_, err = sess.Authorize(provider, ctx.Request().URL.Query())
	if err != nil {
		return goth.User{}, err
	}

	session.Set(providerName, sess.Marshal())
	return provider.FetchUser(sess)
}

func Logout(ctx iris.Context) error {
	providerName, err := GetProviderName(ctx)
	if err != nil {
		return err
	}
	session := sessionsManager.Start(ctx)
	session.Delete(providerName)
	return nil
}

func Redirect(ctx iris.Context) {
	url := GetState(ctx)
	log.Debugln("Called redirect :", url)
	if url != "" && url != "state" {
		ctx.Redirect(url, iris.StatusTemporaryRedirect)
	}
}
