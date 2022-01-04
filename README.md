# c4d PoC in progress
git webhook listener, c4 parser, collection api, vscode extension for modelling puml c4 and build collection of elements 

# how to run
 - run docker compose `docker-compose -f docker-compose.yml up`
 - goto gogs and setup repo with webhook on commit 
 - commit puml-c4 file 
 - run vscode with extension (see readme at `c4d-vscode-extension`)


## default webhook endpoint
```
 http://webhook:3333/webhook/event
```
## default collection-api endpoint

```
http://collection:3334/api/v1/nodes
http://collection:3334/api/v1/repo
http://collection:3334/api/v1/node_rel

```
## gogs external url
```
set to http://gogs:3000/
```
on host get docker ip address
```
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' c4d_gogs_1

#example output:
10.4.1.3
```
add entry to hosts file:
```
echo "10.4.1.3      gogs" >> /etc/hosts

```
