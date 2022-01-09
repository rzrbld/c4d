# Collection api
This is a simple "REST" API for [vscode exstension](https://github.com/rzrbld/c4d/tree/main/c4d-vscode-extension)

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
cd collection-api

docker build -t rzrbld/collection-api:edge .

docker run -d \
      -p 3334:3334 \
      -e SRV_HOST_PORT=":3334" \
      -e SRV_LOG_LEVEL="DEBUG" \
      -e NEO4J_URI="bolt://localhost:7687" \
      -e NEO4J_USER="neo4j" \
      -e NEO4J_PASSWORD="test" \
      rzrbld/adminio-api:latest

```

### Run manually
 - set env variables
 - go to `src` folder and compile with `go build main.go`, then run `./main` binary
 

### Config Env variables
| Variable   |      Description      |  Default |
|--------------|:-----------------------:|-----------:|
| `SRV_HOST_PORT` | which host and port API should listening. This is Iris based API, provide 0.0.0.0:8080 or :8080 for listening on all interfaces | :3334 |
| `SRV_LOG_LEVEL` |  set loglevel TRACE,DEBUG,INFO,WARN,ERROR, FATAL, PANIC |  DEBUG |
| `NEO4J_URI` | bolt endpoint of neo4j database |  bolt://localhost:7687 |
| `NEO4J_USER` | neo4j user | neo4j |
| `NEO4J_PASSWORD` | neo4j password | test |

