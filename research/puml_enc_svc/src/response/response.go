package handlers

import (
	log "github.com/sirupsen/logrus"

	iris "github.com/kataras/iris/v12"
)

func DefaultResHandler(ctx iris.Context, err error) iris.Map {

	return DefaultResConstructor(err)

}

func BodyResHandler(ctx iris.Context, err error, body interface{}) interface{} {

	return BodyResConstructor(err, body)

}

func BodyResConstructor(err error, body interface{}) interface{} {
	var resp interface{}
	if err != nil {
		log.Errorln(err)
		resp = iris.Map{"error": err.Error()}
	} else {
		resp = body
	}
	return resp
}

func DefaultResConstructor(err error) iris.Map {
	var resp iris.Map
	if err != nil {
		log.Errorln(err)
		resp = iris.Map{"error": err.Error()}
	} else {
		resp = iris.Map{"Success": "OK"}
	}
	return resp
}
