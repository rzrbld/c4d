package handlers

import (
	iris "github.com/kataras/iris/v12"
	clnt "github.com/rzrbld/c4ke_git_api/clients"
	resph "github.com/rzrbld/c4ke_git_api/response"
	log "github.com/sirupsen/logrus"
	gitlab "github.com/xanzy/go-gitlab"
)

func GetFileContent(GLclient *gitlab.Client, projectPath, filePath string) string {

	gf := &gitlab.GetFileOptions{
		Ref: gitlab.String("master"),
	}

	f, _, err := GLclient.RepositoryFiles.GetFile(projectPath, filePath, gf)
	if err != nil {
		log.Errorln("Error while getting file content", err)
	}

	fContent := ""

	if f.Content != "" {
		fContent = f.Content
		log.Debugln("File contains:", f.Content, f)
	}

	return fContent
}

var GetFile = func(ctx iris.Context) {
	if resph.CheckAuthBeforeRequest(ctx) {
		var pName = ctx.FormValue("Project")
		var fPath = ctx.FormValue("FilePath")

		GLclient, err := clnt.GetClient(ctx)

		if err != nil {
			log.Errorln("Error while getting client")
		}

		fContent := GetFileContent(GLclient, pName, fPath)

		ctx.JSON(fContent)

	} else {
		ctx.JSON(resph.DefaultAuthError())
	}
}

var NewCommit = func(ctx iris.Context) {

	if resph.CheckAuthBeforeRequest(ctx) {

		var pName = ctx.FormValue("ProjectName")
		var fName = ctx.FormValue("FileName")
		var fCont = ctx.FormValue("FileContent")
		var cDesc = ctx.FormValue("Description")

		GLclient, err := clnt.GetClient(ctx)

		if err != nil {
			log.Errorln("Error while getting client")
		}

		fileCont := GetFileContent(GLclient, pName, fName)

		var file *gitlab.FileInfo

		if fileCont == "" {
			// Create a new repository file
			cf := &gitlab.CreateFileOptions{
				Branch:        gitlab.String("master"),
				Content:       gitlab.String(fCont),
				CommitMessage: gitlab.String(cDesc),
			}
			file, _, err = GLclient.RepositoryFiles.CreateFile(pName, fName, cf)
			if err != nil {
				log.Fatal(err)
			}

			if err != nil {
				log.Errorln("Error while create file", err)
			}
		} else {
			// Update a repository file
			uf := &gitlab.UpdateFileOptions{
				Branch:        gitlab.String("master"),
				Content:       gitlab.String(fCont),
				CommitMessage: gitlab.String(cDesc),
			}
			file, _, err = GLclient.RepositoryFiles.UpdateFile(pName, fName, uf)
			if err != nil {
				log.Fatal(err)
			}
		}

		ctx.JSON(file)

	} else {
		ctx.JSON(resph.DefaultAuthError())
	}

}
