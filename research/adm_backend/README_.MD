# GO-search REST Service

GO-search is an example REST service built on top of OpenSearch. It is not production-ready and serves as a demonstration of integrating with OpenSearch. This README.md file provides essential information about the service, its environment variables, and how to get started.

## Run with Docker
### Build image
Repo contains multi stage Docker file `Dockerfile.dev`, so no golang installation is required.
``` bash
cd /path/to/repo/go-search
docker build -f Dockerfile.dev -t my/go-search .
```

### Run image
```bash
docker run -d \
      -p 3333:3333 \
      -e SRV_HOST_PORT=":3333" \
      -e OPENSEARCH_URI="https://192.168.50.67:9200" \
      -e OPENSEARCH_USER="admin" \
      -e OPENSEARCH_PASSWORD="admin" \
      my/go-search
```

## Environment Variables

Below is a table listing the environment variables used by the GO-search service. These variables allow you to customize the behavior of the service based on your requirements.

| Name                 | Default                | Description                                                                                       |
|----------------------|------------------------|---------------------------------------------------------------------------------------------------|
| SRV_HOST_PORT        | :3333                  | Specifies the host and port on which the API should listen. Use `:8080` for listening on all interfaces in an Iris-based API. |
| SRV_LOG_LEVEL        | INFO                   | Sets the log level. Possible values: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, PANIC.              |
| SRV_CORS_DOMAIN      | *                      | Sets the CORS policy domain.                                                                      |
| OPENSEARCH_URI       | https://192.168.50.67:9200 | The API endpoint for OpenSearch. Use `https`.                                                    |
| OPENSEARCH_USER      | admin                  | The username for accessing the OpenSearch API.                                                   |
| OPENSEARCH_PASSWORD  | admin                  | The password for accessing the OpenSearch API.                                                   |
| OPENSEARCH_FIELDS    | ["after.Title^4", "after.Annotation", "after.Authors^2", "after.Copyright", "after.Genres", "after.ISBN", "after.Publisher", "after.Series"] | Defines the fields to search for in the request. [Read more](https://opensearch.org/docs/1.2/opensearch/rest-api/search/#request-body) |
| OPENSEARCH_INDEX     | stroki_.stroki.catalog | The index used in the search query.                                                               |
| OPENSEARCH_SSL_IGNORE| true                   | Skips SSL verification for the OpenSearch API.                                                    |
| SRV_METRICS_ENABLE   | false                  | Enables default Iris/Go metrics on the `/metrics/` URI path.                                      |
| SRV_PROBES_ENABLE    | false                  | Enables basic liveness and readiness probes for Kubernetes at the `/ready/` and `/live/` URI path installations. |

## Getting Started

To get started with GO-search, follow these steps:

1. Clone the repository: `<repository_url>`
2. Install the necessary dependencies `go mod download`
3. Set the required environment variables as per your configuration.
4. Run the service using the appropriate command.
5. Access the API at the specified `SRV_HOST_PORT` (e.g., `http://localhost:3333` for example WebUI or `http://localhost:3333/api/v2/search?q=` for Search API request).

Please note that this example service is not intended for production use and serves as a starting point for experimenting with OpenSearch integration. Always ensure that you handle sensitive information and security aspects appropriately when deploying a production-ready service.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request. We welcome contributions from the community to enhance the functionality and reliability of GO-search.

## License

GO-search is released under the [MIT License](LICENSE). Feel free to use, modify, and distribute it according to the terms of the license.