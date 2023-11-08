package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "your_username"
	password = "your_password"
	dbname   = "your_database"
)

var db *sql.DB

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Mail string `json:"mail"`
}

func setupDB() {
	connectionString :=
		fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
			host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatal("Error connecting to the database: ", err)
	}
}

func main() {
	setupDB()
	defer db.Close()

	r := gin.Default()

	// ... (previous code)

	// Get all users in a project
	r.GET("/projects/:id/users", func(c *gin.Context) {
		projectID := c.Param("id")

		var users []User
		rows, err := db.Query("SELECT u.id, u.name, u.mail FROM users u JOIN users_projects_rel up ON u.id = up.user_id WHERE up.project_id = $1", projectID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var user User
			if err := rows.Scan(&user.ID, &user.Name, &user.Mail); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			users = append(users, user)
		}

		c.JSON(http.StatusOK, users)
	})

	// Get all projects in a group
	r.GET("/groups/:id/projects", func(c *gin.Context) {
		groupID := c.Param("id")

		var projects []Project
		rows, err := db.Query("SELECT p.id, p.name, p.description, p.git_link FROM projects p JOIN projects_groups_rel pg ON p.id = pg.project_id WHERE pg.group_id = $1", groupID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var project Project
			if err := rows.Scan(&project.ID, &project.Name, &project.Description, &project.GitLink); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			projects = append(projects, project)
		}

		c.JSON(http.StatusOK, projects)
	})

	// Get all users in a group
	r.GET("/groups/:id/users", func(c *gin.Context) {
		groupID := c.Param("id")

		var users []User
		rows, err := db.Query("SELECT u.id, u.name, u.mail FROM users u JOIN groups_users_rel gu ON u.id = gu.user_id WHERE gu.group_id = $1", groupID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var user User
			if err := rows.Scan(&user.ID, &user.Name, &user.Mail); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			users = append(users, user)
		}

		c.JSON(http.StatusOK, users)
	})

	r.Run(":8080")
}

// These new endpoints allow you to get all users in a project, all projects in a group, and all users in a group. You can use these endpoints by making GET requests to:

// /projects/{project_id}/users to get all users associated with a specific project.
// /groups/{group_id}/projects to get all projects associated with a specific group.
// /groups/{group_id}/users to get all users associated with a specific group.
// Replace {project_id} and {group_id} in the URL with the actual IDs of the project and group you want to query.
