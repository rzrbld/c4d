package oauth

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/gorilla/securecookie"
	iris "github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
	"github.com/markbates/goth"
	cnf "github.com/rzrbld/c4ke_git_api/config"
	log "github.com/sirupsen/logrus"
)

var (
	sessionsManager *sessions.Sessions
)

// {"AuthURL":"https://gitlab.rzrbld.ru/oauth/authorize?client_id=2cb3ca8382eca95585514017b68a13bf4e671efc84d9b00854efc15d079b8090\u0026redirect_uri=http%3A%2F%2Flocalhost%3A8099%2Fauth%2Fcallback\u0026response_type=code\u0026state=state",
// "AccessToken":"34c00ef69bb4dd9efa1e8a6b18a885cb1f80111124824d4a503c8dacf3a56206",
// "RefreshToken":"a3dbf561ba5863bdc77a0d8b633f183419458269002cd69c2c51b9d2a0daa35c",
// "ExpiresAt":"2023-01-29T21:51:40.191559+03:00"}

type StoredSession struct {
	AuthURL      string `json:"AuthURL"`
	AccessToken  string `json:"AccessToken"`
	RefreshToken string `json:"RefreshToken"`
	ExpiresAt    string `json:"ExpiresAt"`
}

func init() {
	cookieName := cnf.ScCookieName
	hashKey := []byte(cnf.ScHashKey)
	blockKey := []byte(cnf.ScBlockKey)
	secureCookie := securecookie.New(hashKey, blockKey)

	sessionsManager = sessions.New(sessions.Config{
		Cookie:   cookieName,
		Encoding: secureCookie,
	})
}

var GetProviderName = func(ctx iris.Context) (string, error) {
	return cnf.OauthProvider, nil
}

func BeginAuthHandler(ctx iris.Context) {
	url, err := GetAuthURL(ctx)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.Writef("%v", err)
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

	if value == "" {
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

func GetStoredToken(ctx iris.Context) string {
	provName, err := GetProviderName(ctx)
	if err != nil {
		log.Warningln("Cannot get auth token:", err)
		return ""
	} else {
		session := sessionsManager.Start(ctx)
		currSess := session.Get(provName)

		valStr := fmt.Sprintf("%v", currSess)

		sralizedSession := StoredSession{}

		json.Unmarshal([]byte(valStr), &sralizedSession)

		return sralizedSession.AccessToken
	}
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
	if url != "" && url != "state" {
		ctx.Redirect(url, iris.StatusTemporaryRedirect)
	}
}
