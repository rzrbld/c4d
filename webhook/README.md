# Collection api
This is a simple webhook for storing puml elements in to graph database (neo4j)

### Run demo
Read [readme](https://github.com/rzrbld/c4d#readme) from `C4D` repository. And run it:
`docker-compose -f docker-compose.yml up`

it will bring up:

 - neo4j server
 - gogs 
 - webhook 
 - collection-api

### Run with docker
```bash
cd webhook

docker build -t rzrbld/webhook:edge .

docker run -d \
      -p 3333:3333 \
      -e SRV_HOST_PORT=":3333" \
      -e SRV_LOG_LEVEL="DEBUG" \
      -e NEO4J_URI="bolt://localhost:7687" \
      -e NEO4J_USER="neo4j" \
      -e NEO4J_PASSWORD="test" \
      -e GIT_BASIC_USER="myuser" \
      -e GIT_BASIC_PASSWORD="seCrEtP@s5w0rd" \
      -e GIT_SERVER="GOGS" \
      rzrbld/webhook:latest

```

### Run manually
 - set env variables
 - go to `src` folder and compile with `go build main.go`, then run `./main` binary
 

SvcHostPort   = getEnv("SRV_HOST_PORT", ":3333")
	SvcLogLevel   = getEnv("SRV_LOG_LEVEL", "INFO")
	Neo4jURI      = getEnv("NEO4J_URI", "bolt://localhost:7687")
	Neo4jUser     = getEnv("NEO4J_USER", "neo4j")
	Neo4jPassword = getEnv("NEO4J_PASSWORD", "test")
	GitUsername   = getEnv("GIT_BASIC_USER", "")
	GitPassword   = getEnv("GIT_BASIC_PASSWORD", "")
	GitServer     = getEnv("GIT_SERVER", "GOGS") //GOGS or GITLAB

### Config Env variables
| Variable   |      Description      |  Default |
|--------------|:-----------------------:|-----------:|
| `SRV_HOST_PORT` | which host and port webhook should listening. This is Iris based API, provide 0.0.0.0:8080 or :8080 for listening on all interfaces | :3333 |
| `SRV_LOG_LEVEL` |  set loglevel TRACE,DEBUG,INFO,WARN,ERROR, FATAL, PANIC |  DEBUG |
| `NEO4J_URI` | bolt endpoint of neo4j database |  bolt://localhost:7687 |
| `NEO4J_USER` | neo4j user | neo4j |
| `NEO4J_PASSWORD` | neo4j password | test |
| `GIT_BASIC_USER` | git repo user |  |
| `GIT_BASIC_PASSWORD` | git repo password |  |
| `GIT_SERVER` | type of event. possible values: `GOGS` and `GITLAB` | GOGS |

