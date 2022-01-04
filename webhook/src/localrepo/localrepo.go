package localrepo

import (
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	"regexp"
	"strings"
	"unicode/utf8"

	// "github.com/fatih/structs"
	// "github.com/rzrbld/webhook-catcher/types"
	pc42obj "github.com/rzrbld/puml-c4-to-object-go"
	c4denc "github.com/rzrbld/puml-c4-to-object-go/encode"
	"github.com/rzrbld/puml-c4-to-object-go/types"

	log "github.com/sirupsen/logrus"
)

func GetPatch(prevCommitDir string, currCommitDir string) string {
	command := "diff -u -r " + prevCommitDir + " " + currCommitDir

	patch, err := exec.Command("sh", "-c", command).Output()

	if err != nil {
		log.Errorln("error while diff executed. Ignore it if exit code is 1 - in diff that means diff is found, but 2 is for trouble:", err)
	}

	log.Debugf("Diff patch: \n %s", patch)

	return string(patch)
}

func ReadLocalRepo(currCommitDir string) []string {
	var result []string

	files, err := ioutil.ReadDir(currCommitDir)
	if err != nil {
		log.Errorln("Error while read directory: ", err)
	}

	for _, f := range files {
		log.Debugln("Read file: ", currCommitDir, f.Name())
		var fileExt = regexp.MustCompile(".puml")
		matched := fileExt.MatchString(f.Name())
		if matched {
			log.Debugln("File matched: ", f.Name())
			result = append(result, f.Name())
		}
	}

	return result
}

func FileReadLines(path string) ([]*types.ParserGenericType, []*types.ParserGenericType) {

	frNodes := []*types.ParserGenericType{}
	frRels := []*types.ParserGenericType{}
	var nodesAndRels = &types.EncodedObj{}

	b, err := ioutil.ReadFile(path)
	if err != nil {
		log.Errorln("Error while reading lines from file", err)
	}
	str := string(b)

	nodesAndRels = pc42obj.Parse(str)

	frNodes = nodesAndRels.Nodes
	frRels = nodesAndRels.Rels

	return frNodes, frRels
}

func trimFirstRune(s string) string {
	_, i := utf8.DecodeRuneInString(s)
	return s[i:]
}

func GetRemovedStrings(patch string) (map[string][]*types.ParserGenericType, map[string][]*types.ParserGenericType) {
	currFileName := ""
	rmNodes := make(map[string][]*types.ParserGenericType)
	rmRels := make(map[string][]*types.ParserGenericType)
	var obj = &types.ParserGenericType{}

	re := regexp.MustCompile(`(?m)(^[-]{3}.*)|(^[-])(.*)\((.*),(.*)\)`)

	for _, match := range re.FindAllString(patch, -1) {

		filenameFlag := string([]rune(match)[0:3])
		if filenameFlag == "---" {
			_, file := path.Split(match)
			fileName := strings.Split(file, "\t")
			if len(fileName) > 0 {
				fileNameSplit := strings.Split(fileName[0], ".")
				if len(fileNameSplit) > 1 {
					fileExt := fileNameSplit[1]
					if fileExt == "puml" {
						currFileName = fileName[0]
					}
				}
			}

		} else {
			if match[0:1] == "-" || match[0:1] == " " {
				match = trimFirstRune(match)
			}
			obj = c4denc.ParseMatch(match, false, "")
			if obj.IsRelation {
				rmRels[currFileName] = append(rmRels[currFileName], obj)
			} else {
				rmNodes[currFileName] = append(rmNodes[currFileName], obj)
			}
		}

		log.Traceln("Remove matched: ", currFileName, match)

	}

	return rmNodes, rmRels
}

func CleanupTempDir() {
	os.RemoveAll("./tmp/")
	log.Infoln("./tmp directory is cleaned")
}
