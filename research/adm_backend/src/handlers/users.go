package handlers

import (
	"context"

	iris "github.com/kataras/iris/v12"
	clnt "github.com/rzrbld/adm_backend/client"

	// log "github.com/sirupsen/logrus"
	// cnf "github.com/rzrbld/adm_backend/config"
	"github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"strconv"
)

var pgClient = clnt.PGclient

var DoQueryUser = func(ctx iris.Context, query string) []User {
	// var users User
	rows, err := pgClient.Query(context.Background(), query)
	if err != nil {
		log.Fatalln("Query users failed:", err)
	}

	p, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])
	if err != nil {
		log.Fatalln("Query users failed:", err)
	}
	return p
}

var GetUsersList = func(ctx iris.Context) {
	page, err := strconv.Atoi(ctx.URLParamDefault("page", "1"))
	if err != nil || page <= 0 {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(iris.Map{"error": "Invalid page number"})
		return
	}

	pageSize, err := strconv.Atoi(ctx.URLParamDefault("page_size", "10"))
	if err != nil || pageSize <= 0 {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(iris.Map{"error": "Invalid page size"})
		return
	}

	offset := (page - 1) * pageSize

	// var users User
	var users []User
	rows, err := pgClient.Query(context.Background(), "select id,name,mail,delete_,date_created, date_modified from users WHERE delete_=false ORDER BY id LIMIT $1 OFFSET $2", pageSize, offset)
	if err != nil {
		log.Fatalln("Query users failed:", err)
	}

	defer rows.Close()

	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Name, &user.Mail, &user.Delete_, &user.Date_Created, &user.Date_Modified); err != nil {
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}
		users = append(users, user)
	}

	log.Debugln("Data", users)
	ctx.JSON(users)
}

var GetUser = func(ctx iris.Context) {
	userId := ctx.Params().Get("id")

	var user User
	row := pgClient.QueryRow(context.Background(), "SELECT id,name,mail,delete_,date_created, date_modified FROM users WHERE id = $1", userId)
	err := row.Scan(&user.ID, &user.Name, &user.Mail, &user.Delete_, &user.Date_Created, &user.Date_Modified)
	if err != nil {
		ctx.StatusCode(iris.StatusNotFound)
		ctx.JSON(iris.Map{"error": "User not found"})
		return
	}

	log.Debugln("Data", user)
	ctx.JSON(user)
}

var DeleteUser = func(ctx iris.Context) {
	userId := ctx.Params().Get("id")

	_, err := pgClient.Exec(context.Background(), "UPDATE users SET delete_=true WHERE id = $1", userId)
	if err != nil {
		ctx.StatusCode(iris.StatusInternalServerError)
		ctx.JSON(iris.Map{"error": err.Error()})
		return
	}

	ctx.JSON(iris.Map{"message": "User deleted successfully"})
}

var UpdateUser = func(ctx iris.Context) {
	userId := ctx.Params().Get("id")
	log.Infoln("Data", userId)

	var user User
	if err := ctx.ReadJSON(&user); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(iris.Map{"error": "Invalid JSON payload"})
		return
	}

	var name, mail, delete_ string

	err := pgClient.QueryRow(context.Background(), "SELECT name,mail FROM users WHERE id = $1 FOR UPDATE", userId).
		Scan(&name, &mail)
	if err != nil {
		ctx.StatusCode(iris.StatusNotFound)
		ctx.JSON(iris.Map{"error": "User not found", "info": err.Error()})
		return
	}

	// Update only non-zero fields
	if user.Name != "" {
		name = user.Name
	}
	if user.Mail != "" {
		mail = user.Mail
	}

	delete_ = strconv.FormatBool(user.Delete_)

	_, err = pgClient.Exec(context.Background(), "UPDATE users SET name = $1, mail = $2, delete_ = $3, date_modified=NOW() WHERE id = $4",
		name, mail, delete_, userId)
	if err != nil {
		ctx.StatusCode(iris.StatusInternalServerError)
		ctx.JSON(iris.Map{"error": err.Error()})
		return
	}

	ctx.JSON(iris.Map{"message": "User updated successfully"})

}
