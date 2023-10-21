package handlers

import (
	"time"
)

// User represents the Users Table
type User struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Mail          string    `json:"mail,omitempty"`
	Delete_       bool      `json:"delete_,omitempty"`
	Date_Created  time.Time `json:"date_created,omitempty"`
	Date_Modified time.Time `json:"date_modified,omitempty"`
}

// Project represents the Projects Table
type Project struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description,omitempty"`
	GitLink      string    `json:"git_link,omitempty"`
	Delete_      bool      `json:"delete_,omitempty"`
	DateCreated  time.Time `json:"date_created,omitempty"`
	DateModified time.Time `json:"date_modified,omitempty"`
}

// Architecture represents the Architectures Table
type Architecture struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description,omitempty"`
	GitLink      string    `json:"git_link,omitempty"`
	Delete_      bool      `json:"delete_,omitempty"`
	DateCreated  time.Time `json:"date_created,omitempty"`
	DateModified time.Time `json:"date_modified,omitempty"`
}

// ADR represents the ADRs (Architectural Decision Records) Table
type ADR struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description,omitempty"`
	GitLink      string    `json:"git_link,omitempty"`
	Delete_      bool      `json:"delete_,omitempty"`
	DateCreated  time.Time `json:"date_created,omitempty"`
	DateModified time.Time `json:"date_modified,omitempty"`
}

// Group represents the Groups Table
type Group struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description,omitempty"`
	Delete_      bool      `json:"delete_,omitempty"`
	DateCreated  time.Time `json:"date_created,omitempty"`
	DateModified time.Time `json:"date_modified,omitempty"`
}

// GroupUserRelationship represents the Groups Users Relationship Table
type GroupUserRelationship struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id,omitempty"`
	GroupID      string    `json:"group_id,omitempty"`
	Delete_      bool      `json:"delete_,omitempty"`
	DateCreated  time.Time `json:"date_created,omitempty"`
	DateModified time.Time `json:"date_modified,omitempty"`
}

// ProjectArchitectureRelationship represents the Projects Architectures Relationship Table
type ProjectArchitectureRelationship struct {
	ID             string    `json:"id"`
	ProjectID      string    `json:"project_id,omitempty"`
	ArchitectureID string    `json:"architecture_id,omitempty"`
	Delete_        bool      `json:"delete_,omitempty"`
	DateCreated    time.Time `json:"date_created,omitempty"`
	DateModified   time.Time `json:"date_modified,omitempty"`
}

// UserProjectRelationship represents the Users Projects Relationship Table
type UserProjectRelationship struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id,omitempty"`
	ProjectID    string    `json:"project_id,omitempty"`
	Delete_      bool      `json:"delete_,omitempty"`
	DateCreated  time.Time `json:"date_created,omitempty"`
	DateModified time.Time `json:"date_modified,omitempty"`
}

// ProjectADRRelationship represents the Projects ADR Relationship Table
type ProjectADRRelationship struct {
	ID           string    `json:"id"`
	ProjectID    string    `json:"project_id,omitempty"`
	ADRID        string    `json:"adr_id,omitempty"`
	Delete_      bool      `json:"delete_,omitempty"`
	DateCreated  time.Time `json:"date_created,omitempty"`
	DateModified time.Time `json:"date_modified,omitempty"`
}

// ProjectGroupRelationship represents the Projects Groups Relationship Table
type ProjectGroupRelationship struct {
	ID           string    `json:"id"`
	ProjectID    string    `json:"project_id,omitempty"`
	GroupID      string    `json:"group_id,omitempty"`
	Delete_      bool      `json:"delete_,omitempty"`
	DateCreated  time.Time `json:"date_created,omitempty"`
	DateModified time.Time `json:"date_modified,omitempty"`
}
