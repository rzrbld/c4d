package clients

import (
	iris "github.com/kataras/iris/v12"
	cnf "github.com/rzrbld/c4ke_git_api/config"
	oauth "github.com/rzrbld/c4ke_git_api/oauth"
	log "github.com/sirupsen/logrus"
	"github.com/xanzy/go-gitlab"
)

var GlabErr error
var GlabClnt *gitlab.Client

// func init() {

// 	// GlabClnt, GlabErr = gitlab.NewClient(cnf.SvcGitKey, gitlab.WithBaseURL(cnf.SvcGitBaseURL))
// 	GlabClnt, GlabErr = gitlab.NewOAuthClient(cnf.SvcGitKey, gitlab.WithBaseURL(cnf.SvcGitBaseURL))

// 	if GlabErr != nil {
// 		log.Fatalf("Failed to create client: %v", GlabErr)
// 	} else {
// 		log.Infoln("Connect to gitlab was successfull")
// 	}
// }

func GetClient(ctx iris.Context) (*gitlab.Client, error) {
	sToken := oauth.GetStoredToken(ctx)
	log.Debugln("saved token:", sToken)

	GlabClnt, GlabErr = gitlab.NewOAuthClient(sToken, gitlab.WithBaseURL(cnf.SvcGitBaseURL))

	if GlabErr != nil {
		log.Fatalf("Failed to create client: %v", GlabErr)

	} else {
		log.Infoln("Connect to gitlab was successfull")
	}
	return GlabClnt, GlabErr
}
