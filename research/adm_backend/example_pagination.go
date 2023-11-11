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

type Project struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	GitLink     string `json:"git_link"`
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

	// Get all projects with pagination support
	r.GET("/projects", func(c *gin.Context) {
		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page number"})
			return
		}

		pageSize, err := strconv.Atoi(c.DefaultQuery("page_size", "10"))
		if err != nil || pageSize <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page size"})
			return
		}

		offset := (page - 1) * pageSize

		var projects []Project
		rows, err := db.Query("SELECT id, name, description, git_link FROM projects ORDER BY id LIMIT $1 OFFSET $2", pageSize, offset)
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

	// Get a specific project
	r.GET("/projects/:id", func(c *gin.Context) {
		var project Project
		id := c.Param("id")

		row := db.QueryRow("SELECT id, name, description, git_link FROM projects WHERE id = $1", id)
		err := row.Scan(&project.ID, &project.Name, &project.Description, &project.GitLink)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}

		c.JSON(http.StatusOK, project)
	})

	r.Run(":8080")
}

//For instance, if you make a GET request to /projects?page=1&page_size=10, it will return
