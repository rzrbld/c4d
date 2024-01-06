package config

import (
	"os"
	"strconv"

	log "github.com/sirupsen/logrus"
)

var (
	SvcHostPort   = getEnv("HOST_PORT", ":8080")
	SvcCORS       = getEnv("CORS_DOMAIN", "*")
	SvcLogLevel   = getEnv("LOG_LEVEL", "INFO")
	SvcPUMLURL    = getEnv("PUML_URL", "http://localhost:8083/svg/")
	SvcGitKey     = getEnv("GIT_TOKEN", "glxxx-6df2jSjyDZGWMS4F7dsX")
	SvcGitBaseURL = getEnv("GIT_BASE_URL", "https://gitlab.rzrbld.ru/api/v4")
	// AES only supports key sizes of 16, 24 or 32 bytes.
	// You either need to provide exactly that amount or you derive the key from what you type in.
	ScHashKey  = getEnv("COOKIE_HASH_KEY", "7pO5WRJOLRKtUmSkY7l5Ifz62AHlNUga")
	ScBlockKey = getEnv("COOKIE_BLOCK_KEY", "zwWi2xKfvl9su4s06PuqIWLop37DgzIf")
	// ---------------
	ScCookieName      = getEnv("COOKIE_NAME", "cakesessionid")
	OauthEnable, _    = strconv.ParseBool(getEnv("OAUTH_ENABLE", "false"))
	AuditLogEnable, _ = strconv.ParseBool(getEnv("AUDIT_LOG_ENABLE", "false"))

	OauthProvider     = getEnv("OAUTH_PROVIDER", "gitlab")
	OauthClientId     = getEnv("OAUTH_CLIENT_ID", "my-gitlab-oauth-app-client-id")
	OauthClientSecret = getEnv("OAUTH_CLIENT_SECRET", "my-gitlab-oauth-app-secret")
	OauthCallback     = getEnv("OAUTH_CALLBACK", "http://"+SvcHostPort+"/auth/callback")

	// AuthURL    = "https://gitlab.com/oauth/authorize"
	// TokenURL   = "https://gitlab.com/oauth/token"
	// ProfileURL = "https://gitlab.com/api/v3/user"

	OauthCustomDomain = getEnv("OAUTH_CUSTOM_DOMAIN", "")

	OauthAuthURL     = getEnv("OAUTH_AUTH_URL", "https://"+OauthCustomDomain+"/oauth/authorize")
	OauthTokenURL    = getEnv("OAUTH_TOKEN_URL", "https://"+OauthCustomDomain+"/oauth/token")
	OauthUserInfoURL = getEnv("OAUTH_USERINFO_URL", "https://"+OauthCustomDomain+"/api/v3/user")

	MetricsEnable, _ = strconv.ParseBool(getEnv("METRICS_ENABLE", "false"))
	ProbesEnable, _  = strconv.ParseBool(getEnv("PROBES_ENABLE", "false"))
)

func getEnv(key, fallback string) string {
	value, exist := os.LookupEnv(key)

	if !exist {
		return fallback
	}

	return value
}

func SetLogLevel() {
	log.Infoln("Set log level to: ", SvcLogLevel)
	selectedLogLevel := log.InfoLevel
	switch loglvl := SvcLogLevel; loglvl {
	case "TRACE":
		selectedLogLevel = log.TraceLevel
	case "DEBUG":
		selectedLogLevel = log.DebugLevel
	case "INFO":
		selectedLogLevel = log.InfoLevel
	case "WARN":
		selectedLogLevel = log.WarnLevel
	case "ERROR":
		selectedLogLevel = log.ErrorLevel
	case "FATAL":
		selectedLogLevel = log.FatalLevel
	case "PANIC":
		selectedLogLevel = log.PanicLevel
	default:
		log.Errorln("Unknown log level:", SvcLogLevel, ". Fallback to INFO.", "Possible values: \n TRACE \n DEBUG \n INFO \n WARN \n ERROR \n FATAL \n PANIC \n")
	}

	log.SetLevel(selectedLogLevel)
}
