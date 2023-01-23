package handlers

import (
	iris "github.com/kataras/iris/v12"
	resph "github.com/rzrbld/go-puml/response"
)

var Probes = func(ctx iris.Context) {
	var res = resph.DefaultResConstructor(nil)
	ctx.JSON(res)
}
