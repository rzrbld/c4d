package repository

import (
	git "github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	cnf "github.com/rzrbld/webhook-catcher/config"
	log "github.com/sirupsen/logrus"
)

func GitClone(url string, commit string) string {

	gitCloneURL := url
	directory := "./tmp/" + commit
	username := cnf.GitUsername
	password := cnf.GitPassword

	log.Infoln("git clone url: ", gitCloneURL, ", commit: ", commit, " to directory: ", directory)

	r, err := git.PlainClone(directory, false, &git.CloneOptions{
		Auth: &http.BasicAuth{
			Username: username,
			Password: password,
		},
		URL:               gitCloneURL,
		RecurseSubmodules: git.DefaultSubmoduleRecursionDepth,
	})

	if err != nil {
		log.Errorln("Error while git plain clone. ", err)
	}

	w, _ := r.Worktree()

	log.Infoln("git checkout", commit)

	_ = w.Checkout(&git.CheckoutOptions{
		Hash: plumbing.NewHash(commit),
	})

	return directory
}
