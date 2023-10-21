package config

import (
	"os"
	log "github.com/sirupsen/logrus"
	strconv "strconv"
)

var (
	MyHostPort          = getEnv("SRV_HOST_PORT", ":3333")
	MyLogLevel          = getEnv("SRV_LOG_LEVEL", "INFO")
	MyCORS              = getEnv("SRV_CORS_DOMAIN", "*")
	OpenSearchURI       = getEnv("OPENSEARCH_URI", "https://192.168.50.67:9200")
	OpenSearchUser      = getEnv("OPENSEARCH_USER", "admin")
	OpenSearchPassword  = getEnv("OPENSEARCH_PASSWORD", "admin")
	OpenSearchFields    = getEnv("OPENSEARCH_FIELDS", `["after.Title^4", "after.Annotation", "after.Authors^2", "after.Copyright", "after.Genres", "after.ISBN", "after.Publisher", "after.Series"]`)
	OpenSearchIndex     = getEnv("OPENSEARCH_INDEX", "stroki_.stroki.catalog")
	OpenSearchIgnoreSSL, _   = strconv.ParseBool(getEnv("OPENSEARCH_SSL_IGNORE", "true"))
	MetricsEnable, _         = strconv.ParseBool(getEnv("SRV_METRICS_ENABLE", "false"))
	ProbesEnable, _          = strconv.ParseBool(getEnv("SRV_PROBES_ENABLE", "false"))

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

func init(){
	SetLogLevel(MyLogLevel)
}
