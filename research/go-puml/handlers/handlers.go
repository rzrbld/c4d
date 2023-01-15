package handlers

import (
	"io"
	"net/url"

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

var Echo = func(ctx iris.Context) {

	rawData, _ := io.ReadAll(ctx.Request().Body)
	ctx.Binary(rawData)
}

var Save = func(ctx iris.Context) {
	filename := ctx.FormValue("filename")
	xmlDta := ctx.FormValue("xml")

	decodedXML, err := url.QueryUnescape(xmlDta)
	if err != nil {
		log.Fatal(err)
		return
	}

	if filename == "" {
		filename = "export"
	}

	log.Infoln("filename", filename)
	log.Infoln("xml", decodedXML)

	binStr := []byte(decodedXML)
	ctx.Header("Content-Disposition", "attachment; filename=\""+filename+"\"; filename*=UTF-8''Drawing1.xml")

	ctx.Binary(binStr)

}
