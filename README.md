# Workspace tools
### infrastructure services:
 - [Gogs](https://gogs.io/)
 - [Neo4j](https://neo4j.com/)

### middleware services:
 - git-webhook
 - collection-api

### UI:
 - vscode 1.60^
 - code --install-extension systemticks.c4-dsl-extension
 - code --install-extension c4d-vscode-extension/c4dcollection-0.6.0.vsix
 - code --install-extension vincent-ledu.adr-tools (optional)

# How to run ("quick" start)
 - run docker compose `docker-compose -f docker-compose.yml up`
 - goto gogs (http://localhost:3000) and perfom basic setup:
 
   ![step_1_gogs_basic](https://raw.githubusercontent.com/rzrbld/c4d/main/images/step_1_gogs_basic.png)

 - set default user, password and email

    ![step_2_gogs_user](https://raw.githubusercontent.com/rzrbld/c4d/main/images/step_2_gogs_user.png)

 - click `install gogs`
 - you will be redirected to `http://gogs:3000/user/login` which is obviously won't open. so just replace `gogs` to `localhost` (http://localhost:3000/user/login)

 - create repository and setup webhook on push
     
    ![step_3_gogs_webhook](https://raw.githubusercontent.com/rzrbld/c4d/main/images/step_3_gogs_webhook.png)

 - set webhook endpoint to: 

```
 http://webhook:3333/webhook/event
```

 - commit puml-c4 file (for example: [C4_Container Diagram Sample - bigbankplc.puml](https://github.com/plantuml-stdlib/C4-PlantUML/blob/master/samples/C4_Container%20Diagram%20Sample%20-%20bigbankplc.puml))
 
 - run vscode
 - create new file
 - press `command+shift+p` and type `C4D`, pick `"C4D: Init puml C4 file"` 
 - press `command+shift+p` and type `C4D`, pick `"C4D: Collection"` and try search elements from puml file
 - press `command+shift+p` and type `PlantUML`, pick `"PlantUML: Preview Current Diagram"` and try search elements from puml file
 
![screenshot1](https://raw.githubusercontent.com/rzrbld/c4d/main/c4d-vscode-extension/screenshot/example_workspace.png)
