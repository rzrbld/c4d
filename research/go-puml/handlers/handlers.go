package handlers

import (
	iris "github.com/kataras/iris/v12"
	puml "github.com/orlade/plantuml-encode/plantuml"
	cnf "github.com/rzrbld/go-puml/config"
	log "github.com/sirupsen/logrus"
)

var PumlEnc = func(ctx iris.Context) {
	pumlContent := ctx.FormValue("text")
	// pumlBytesCont := []byte(pumlContent)
	pumlEncoded, err := puml.DeflateAndEncode(pumlContent)
	respStr := cnf.SvcPUMLURL + pumlEncoded
	if err != nil {
		log.Errorln("Error while encode puml text")
	}

	ctx.Text(respStr)

}
