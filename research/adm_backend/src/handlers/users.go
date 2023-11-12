package handlers

import (
	"context"

	iris "github.com/kataras/iris/v12"

	// cnf "github.com/rzrbld/adm_backend/config"
	// "github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"strconv"
)

var CreateUser = func(ctx iris.Context) {
	var user User
	if err := ctx.ReadJSON(&user); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(iris.Map{"error": err.Error()})
		return
	}

	err := pgClient.QueryRow(context.Background(),
		"INSERT INTO users (name, mail) VALUES ($1, $2) RETURNING id",
		user.Name, user.Mail).
		Scan(&user.ID)
	if err != nil {
		ctx.StatusCode(iris.StatusInternalServerError)
		ctx.JSON(iris.Map{"error": err.Error()})
		return
	}

	ctx.JSON(user)
}

var GetUsersList = func(ctx iris.Context) {

	page, error := ValidateIntParams("page", "1", ctx)
	if error != false {
		return
	}

	pageSize, error := ValidateIntParams("page_size", "10", ctx)
	if error != false {
		return
	}

	offset := (page - 1) * pageSize

	if CheckAuthBeforeRequest(ctx) {
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
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetUser = func(ctx iris.Context) {
	userId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
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
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetUserGroups = func(ctx iris.Context) {
	userId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		var userRGs []UserRolesGroups
		rows, err := pgClient.Query(context.Background(), "select u.id as user_id, g.id as group_id, u.name as user_name, u.mail as user_mail, g.\"name\" as group_name, gru.user_role as user_role, gru.date_created as date_added, gru.date_modified as date_modified  from users as u, groups_users_rel as gru, groups as g where u.id=$1 and gru.delete_ =false  and gru.user_id = u.id and g.id=gru.group_id", userId)
		if err != nil {
			log.Fatalln("Query users failed:", err)
		}

		defer rows.Close()

		for rows.Next() {
			var userRG UserRolesGroups
			if err := rows.Scan(&userRG.User_ID, &userRG.Group_ID, &userRG.User_Name, &userRG.User_Mail, &userRG.Group_Name, &userRG.User_Role, &userRG.Date_Added, &userRG.Date_Modified); err != nil {
				ctx.StatusCode(iris.StatusBadRequest)
				ctx.JSON(iris.Map{"error": err.Error()})
				return
			}
			userRGs = append(userRGs, userRG)

		}

		log.Debugln("Data", userRGs)
		ctx.JSON(userRGs)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var DeleteUser = func(ctx iris.Context) {
	userId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		_, err := pgClient.Exec(context.Background(), "UPDATE users SET delete_=true WHERE id = $1", userId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "User deleted successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var UpdateUser = func(ctx iris.Context) {
	userId := ctx.Params().Get("id")
	log.Infoln("Data", userId)

	var user User

	if CheckAuthBeforeRequest(ctx) {
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
	} else {
		ctx.JSON(DefaultAuthError())
	}
}
