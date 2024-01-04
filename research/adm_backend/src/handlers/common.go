package handlers

import (
	iris "github.com/kataras/iris/v12"
	clnt "github.com/rzrbld/adm_backend/client"
	"strconv"
	"time"
)

var pgClient = clnt.PGclient

// User represents the Users Table
type User struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Mail          string    `json:"mail,omitempty"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

// User represents the Users with Roles in Groups
type UserRolesGroups struct {
	User_ID       string    `json:"user_id"`
	Group_ID      string    `json:"group_id"`
	User_Name     string    `json:"user_name"`
	User_Mail     string    `json:"user_mail"`
	Group_Name    string    `json:"group_name"`
	User_Role     string    `json:"user_role"`
	Date_Added    time.Time `json:"date_added"`
	Date_Modified time.Time `json:"date_modified"`
}

// Project represents the Projects Table
type Project struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	GitLink       string    `json:"git_link"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created"`
	Date_Modified time.Time `json:"date_modified"`
}

type ProjectADR struct {
	Project_ID          string    `json:"project_id"`
	Project_Name        string    `json:"project_name"`
	Project_Description string    `json:"project_desc"`
	Project_GitLink     string    `json:"project_repo"`
	Adr_ID              string    `json:"adr_id"`
	Adr_Name            string    `json:"adr_name"`
	Adr_Description     string    `json:"adr_desc"`
	Adr_GitLink         string    `json:"adr_git_link"`
	Date_Added          time.Time `json:"date_added"`
	Date_Modified       time.Time `json:"date_modified"`
}

type ProjectArch struct {
	Project_ID          string    `json:"project_id"`
	Project_Name        string    `json:"project_name"`
	Project_Description string    `json:"project_desc"`
	Project_GitLink     string    `json:"project_repo"`
	Arch_ID             string    `json:"arch_id"`
	Arch_Name           string    `json:"arch_name"`
	Arch_Description    string    `json:"arch_desc"`
	Arch_GitLink        string    `json:"arch_git_link"`
	Date_Added          time.Time `json:"date_added"`
	Date_Modified       time.Time `json:"date_modified"`
}

// Architecture represents the Architectures Table
type Architecture struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description,omitempty"`
	GitLink       string    `json:"git_link,omitempty"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

// ADR represents the ADRs (Architectural Decision Records) Table
type Adr struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description,omitempty"`
	GitLink       string    `json:"git_link,omitempty"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

// Group represents the Groups Table
type Group struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description,omitempty"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

// GroupUserRelationship represents the Groups Users Relationship Table
type GroupUserRelationship struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id,omitempty"`
	GroupID       string    `json:"group_id,omitempty"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

// ProjectArchitectureRelationship represents the Projects Architectures Relationship Table
type ProjectArchitectureRelationship struct {
	ID             string    `json:"id"`
	ProjectID      string    `json:"project_id,omitempty"`
	ArchitectureID string    `json:"architecture_id,omitempty"`
	Delete_        bool      `json:"delete_"`
	Date_Created   time.Time `json:"date_created,omitempty"`
	Date_Modified  time.Time `json:"date_modified,omitempty"`
}

// UserProjectRelationship represents the Users Projects Relationship Table
type UserProjectRelationship struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id,omitempty"`
	ProjectID     string    `json:"project_id,omitempty"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

// ProjectADRRelationship represents the Projects ADR Relationship Table
type ProjectADRRelationship struct {
	ID            string    `json:"id"`
	ProjectID     string    `json:"project_id,omitempty"`
	ADRID         string    `json:"adr_id,omitempty"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

// ProjectGroupRelationship represents the Projects Groups Relationship Table
type ProjectGroupRelationship struct {
	ID            string    `json:"id"`
	ProjectID     string    `json:"project_id,omitempty"`
	GroupID       string    `json:"group_id,omitempty"`
	Delete_       bool      `json:"delete_"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

func ValidateIntParams(pname string, defaultval string, ctx iris.Context) (int, bool) {
	val, err := strconv.Atoi(ctx.URLParamDefault(pname, defaultval))
	if err != nil || val <= 0 {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(iris.Map{"error": "Invalid " + pname + " number"})
		return 0, true
	}
	return val, false
}
