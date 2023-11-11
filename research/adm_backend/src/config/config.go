package config

import (
	log "github.com/sirupsen/logrus"
	"os"
	strconv "strconv"
)

var (
	MyHostPort             = getEnv("SRV_HOST_PORT", ":3333")
	MyLogLevel             = getEnv("SRV_LOG_LEVEL", "INFO")
	MyCORS                 = getEnv("SRV_CORS_DOMAIN", "*")
	OpenSearchIgnoreSSL, _ = strconv.ParseBool(getEnv("OPENSEARCH_SSL_IGNORE", "true"))
	MetricsEnable, _       = strconv.ParseBool(getEnv("SRV_METRICS_ENABLE", "false"))
	ProbesEnable, _        = strconv.ParseBool(getEnv("SRV_PROBES_ENABLE", "false"))
	// ScHashKey              = getEnv("SRV_COOKIE_HASH_KEY", "NRUeuq6AdskNPa7ewZuxG9TrDZC4xFat")
	// ScBlockKey             = getEnv("SRV_COOKIE_BLOCK_KEY", "bnfYuphzxPhJMR823YNezH83fuHuddFC")
	// ---------------
	ScCookieName      = getEnv("SRV_COOKIE_NAME", "cakesessionid")
	OauthEnable, _    = strconv.ParseBool(getEnv("SRV_OAUTH_ENABLE", "false"))
	OauthProvider     = getEnv("SRV_OAUTH_PROVIDER", "openid-connect")
	AuditLogEnable, _ = strconv.ParseBool(getEnv("SRV_AUDIT_LOG_ENABLE", "false"))
	OauthClientId     = getEnv("SRV_OAUTH_CLIENT_ID", "login-app")
	OauthClientSecret = getEnv("SRV_OAUTH_CLIENT_SECRET", "my-keycloak-oauth-app-secret")
	OauthCallback     = getEnv("SRV_OAUTH_CALLBACK", "http://localhost:3333/auth/callback")
	OauthDiscoveryURL = getEnv("SRV_OAUTH_DISCOVERY_URL", "http://192.168.50.241:8180/realms/C4keRealm/.well-known/openid-configuration")
)

func getEnv(key, fallback string) string {
	value, exist := os.LookupEnv(key)

	if !exist {
		return fallback
	}

	return value
}

func SetLogLevel(LogLevel string) {
	log.Infoln("Set log level to: ", LogLevel)
	selectedLogLevel := log.InfoLevel
	switch loglvl := LogLevel; loglvl {
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
		log.Errorln("Unknown log level:", LogLevel, ". Fallback to INFO.", "Possible values: \n TRACE \n DEBUG \n INFO \n WARN \n ERROR \n FATAL \n PANIC")
	}

	log.SetLevel(selectedLogLevel)
}

func init() {
	SetLogLevel(MyLogLevel)
}
