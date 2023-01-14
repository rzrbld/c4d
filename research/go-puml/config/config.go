package config

import (
	"os"

	log "github.com/sirupsen/logrus"
)

var (
	SvcHostPort = getEnv("HOST_PORT", "localhost:8084")
	SvcCORS     = getEnv("CORS_DOMAIN", "*")
	SvcLogLevel = getEnv("LOG_LEVEL", "INFO")
	SvcPUMLURL  = getEnv("PUML_URL", "http://localhost:8083/svg/")
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
