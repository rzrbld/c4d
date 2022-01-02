# c4d PoC in progress
git webhook listener, c4 parser, rest api, vscode extension for modelling puml c4 and build collection of elements 

# how to run (by now is difficult)
 - run docker compose `docker-compose -f docker-compose.yml up`
 - build and run webhook `cd webhook && go build main.go && ./main`
 - goto gogs and setup repo with webhook on commit 
 - commit puml-c4 file 
 - build and run collection api `cd collection-api && go build main.go && ./main`
 - run vscode with extension (see readme at `c4d-vscode-extension`)
