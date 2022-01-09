package config

import (
	"os"

	log "github.com/sirupsen/logrus"
)

var (
	SvcHostPort   = getEnv("SRV_HOST_PORT", ":3333")
	SvcLogLevel   = getEnv("SRV_LOG_LEVEL", "INFO")
	Neo4jURI      = getEnv("NEO4J_URI", "bolt://localhost:7687")
	Neo4jUser     = getEnv("NEO4J_USER", "neo4j")
	Neo4jPassword = getEnv("NEO4J_PASSWORD", "test")
	GitUsername   = getEnv("GIT_BASIC_USER", "")
	GitPassword   = getEnv("GIT_BASIC_PASSWORD", "")
	GitServer     = getEnv("GIT_SERVER", "GOGS") //GOGS or GITLAB
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
