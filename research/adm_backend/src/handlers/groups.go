package handlers

import (
	"context"

	iris "github.com/kataras/iris/v12"

	// cnf "github.com/rzrbld/adm_backend/config"
	// "github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"strconv"
)

var CreateGroup = func(ctx iris.Context) {
	if CheckAuthBeforeRequest(ctx) {
		var group Group
		if err := ctx.ReadJSON(&group); err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		err := pgClient.QueryRow(context.Background(),
			"INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING id",
			group.Name, group.Description).
			Scan(&group.ID)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(group)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetGroupsList = func(ctx iris.Context) {

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
		// var groups Group
		var groups []Group
		rows, err := pgClient.Query(context.Background(), "select id,name,description,delete_,date_created, date_modified from groups WHERE delete_=false ORDER BY id LIMIT $1 OFFSET $2", pageSize, offset)
		if err != nil {
			log.Fatalln("Query groups failed:", err)
		}

		defer rows.Close()

		for rows.Next() {
			var group Group
			if err := rows.Scan(&group.ID, &group.Name, &group.Description, &group.Delete_, &group.Date_Created, &group.Date_Modified); err != nil {
				ctx.JSON(iris.Map{"error": err.Error()})
				return
			}
			groups = append(groups, group)
		}

		log.Debugln("Data", groups)
		ctx.JSON(groups)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}
var GetGroupUsers = func(ctx iris.Context) {
	groupId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		// var groups Group
		var userRGs []UserRolesGroups
		rows, err := pgClient.Query(context.Background(), "select u.id as user_id, g.id as group_id, u.name as user_name, u.mail as user_mail, g.\"name\" as group_name, gru.user_role as user_role, gru.date_created as date_added, gru.date_modified as date_modified  from users as u, groups_users_rel as gru, groups as g where g.id=$1 and gru.delete_ =false  and gru.user_id = u.id and g.id=gru.group_id", groupId)
		if err != nil {
			log.Fatalln("Query groups failed:", err)
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

var AddUserToGroup = func(ctx iris.Context) {
	groupId := ctx.Params().Get("id")
	var user UserRolesGroups

	if err := ctx.ReadJSON(&user); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(iris.Map{"error": err.Error()})
		return
	}

	if CheckAuthBeforeRequest(ctx) {
		err := pgClient.QueryRow(context.Background(),
			"INSERT INTO groups_users_rel (user_id, group_id, user_role) VALUES ($1, $2, $3) RETURNING id",
			user.User_ID, groupId, user.User_Role).
			Scan(&user.Group_ID)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(user)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var RemoveUserFromGroup = func(ctx iris.Context) {
	groupId := ctx.Params().Get("id")
	userId := ctx.Params().Get("uid")

	if CheckAuthBeforeRequest(ctx) {
		_, err := pgClient.Exec(context.Background(), "UPDATE groups_users_rel SET delete_=true WHERE group_id = $1 AND user_id = $2", groupId, userId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "User removerd from group successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var GetGroup = func(ctx iris.Context) {
	groupId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		var group Group
		row := pgClient.QueryRow(context.Background(), "SELECT id,name,description,delete_,date_created, date_modified FROM groups WHERE id = $1", groupId)
		err := row.Scan(&group.ID, &group.Name, &group.Description, &group.Delete_, &group.Date_Created, &group.Date_Modified)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.JSON(iris.Map{"error": "Group not found"})
			return
		}

		log.Debugln("Data", group)
		ctx.JSON(group)
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var DeleteGroup = func(ctx iris.Context) {
	groupId := ctx.Params().Get("id")

	if CheckAuthBeforeRequest(ctx) {
		_, err := pgClient.Exec(context.Background(), "UPDATE groups SET delete_=true WHERE id = $1", groupId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "Group deleted successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}

var UpdateGroup = func(ctx iris.Context) {
	groupId := ctx.Params().Get("id")
	log.Infoln("Data", groupId)

	var group Group

	if CheckAuthBeforeRequest(ctx) {
		if err := ctx.ReadJSON(&group); err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{"error": "Invalid JSON payload"})
			return
		}

		var name, description, delete_ string

		err := pgClient.QueryRow(context.Background(), "SELECT name,description FROM groups WHERE id = $1 FOR UPDATE", groupId).
			Scan(&name, &description)
		if err != nil {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.JSON(iris.Map{"error": "Group not found", "info": err.Error()})
			return
		}

		// Update only non-zero fields
		if group.Name != "" {
			name = group.Name
		}
		if group.Description != "" {
			description = group.Description
		}

		delete_ = strconv.FormatBool(group.Delete_)

		_, err = pgClient.Exec(context.Background(), "UPDATE groups SET name = $1, description = $2, delete_ = $3, date_modified=NOW() WHERE id = $4",
			name, description, delete_, groupId)
		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{"error": err.Error()})
			return
		}

		ctx.JSON(iris.Map{"message": "Group updated successfully"})
	} else {
		ctx.JSON(DefaultAuthError())
	}
}
