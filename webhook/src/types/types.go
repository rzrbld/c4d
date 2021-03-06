package types

type CompCont struct {
	Alias string `json:"alias"`
	Label string `json:"label"`
	Techn string `json:"techn"`
	Descr string `json:"descr"`
	GType string `json:"gtype"`
}

type PersSystem struct {
	Alias string `json:"alias"`
	Label string `json:"label"`
	Descr string `json:"descr"`
	GType string `json:"gtype"`
}

type Boundary struct {
	Alias string `json:"alias"`
	Label string `json:"label"`
	Type  string `json:"type"`
	GType string `json:"gtype"`
	Descr string `json:"descr"` //fake it
	Techn string `json:"techn"` //fake it
}

type Node struct {
	Alias string `json:"alias"`
	Label string `json:"label"`
	Type  string `json:"type"`
	Descr string `json:"descr"`
	GType string `json:"gtype"`
}

type Rel struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Label string `json:"label"`
	Techn string `json:"techn"`
	Descr string `json:"descr"`
	GType string `json:"gtype"`
}

type RelIndex struct {
	Index string `json:"index"`
	From  string `json:"from"`
	To    string `json:"to"`
	Label string `json:"label"`
	Techn string `json:"techn"`
	Descr string `json:"descr"`
	GType string `json:"gtype"`
}

type GraphObj struct {
	Alias string `json:"alias"`
	Label string `json:"label"`
	Techn string `json:"techn"`
	Descr string `json:"descr"`
	Type  string `json:"type"`
	GType string `json:"gtype"`
	Index string `json:"index"`
	From  string `json:"from"`
	To    string `json:"to"`
}

type GlobalType struct {
	Object        map[string]interface{}
	BoundaryAlias string
	IsRelation    bool
}

type Person struct {
	Name string `json:"_key"`
	Age  int    `json:"age"`
}

type MyEdgeObject struct {
	From string `json:"_from"`
	To   string `json:"_to"`
	Type string `json:"type"`
}

type Event struct {
	After      string   `json:"after"`
	Before     string   `json:"before"`
	Repository Repotype `json:"repository"`
}

type GogsEvent struct {
	After      string       `json:"after"`
	Before     string       `json:"before"`
	Repository GogsRepotype `json:"repository"`
}

type GitlabEvent struct {
	After      string         `json:"after"`
	Before     string         `json:"before"`
	Repository GitlabRepotype `json:"repository"`
}

type Repotype struct {
	Clone_url string `json:"clone_url"`
}

type GogsRepotype struct {
	Clone_url string `json:"clone_url"`
}

type GitlabRepotype struct {
	Git_http_url string `json:"git_http_url"`
}

type Item struct {
	Id   int64
	Name string
}
