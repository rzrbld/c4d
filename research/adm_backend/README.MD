# Demo Search

This repository contains configurations for Kafka Connect and a test search service built on top of OpenSearch.

- kafka connect [configuaration files](kafka-connector_config)
- Source code of example [search service](go-search)

## Implementation Schema
![img](img/go-search.png)

## Connectors

### Debezium MySQL Connector (Source)
[debezium-connector-mysql-2.3.1.Final-plugin.tar.gz](https://repo1.maven.org/maven2/io/debezium/debezium-connector-mysql/2.3.1.Final/debezium-connector-mysql-2.3.1.Final-plugin.tar.gz) - Installation [instructions](https://debezium.io/documentation/reference/stable/install.html)

Configuration [guide](https://debezium.io/documentation/reference/stable/connectors/mysql.html)

configuration that used in demo:

```bash
name=stroki-example-conn
connector.class=io.debezium.connector.mysql.MySqlConnector
tasks.max=1
database.hostname=192.168.50.187
database.port=3306
database.user=debezium
database.password=P455VV0r-d
database.server.id=184324
topic.prefix=stroki_
database.include.list=stroki
schema.history.internal.kafka.bootstrap.servers=192.168.50.196:9092
schema.history.internal.kafka.topic=schema-changes.stroki
include.schema.changes=true
```

### Aiven OpenSearch Connector (Sink)
[opensearch-connector-for-apache-kafka-3.1.0.tar](https://github.com/Aiven-Open/opensearch-connector-for-apache-kafka/releases/download/v3.1.0/opensearch-connector-for-apache-kafka-3.1.0.tar) - Official [repository](https://github.com/Aiven-Open/opensearch-connector-for-apache-kafka)

Connection setup [instructions](https://docs.aiven.io/docs/products/kafka/kafka-connect/howto/opensearch-sink#example-create-an-opensearch-sink-connector-on-a-topic-in-plain-json-format) for JSON format (without Schema registry) to a topic.

configuration that used in demo:

```bash
name=aiven-opensearch
connector.class=io.aiven.kafka.connect.opensearch.OpensearchSinkConnector
topics.regex=stroki_.(.*)
connection.url=https://192.168.50.67:9200
connection.username=admin
connection.password=admin
type.name=stroki
tasks.max=1
key.converter=org.apache.kafka.connect.storage.StringConverter
value.converter=org.apache.kafka.connect.json.JsonConverter
value.converter.schemas.enable=true
schema.ignore=true
max.in.flight.requests=4
index.write.method=upsert
key.ignore=true
key.ignore.id.strategy=record.key
behavior.on.malformed.documents=ignore
```