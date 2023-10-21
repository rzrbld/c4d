package handlers

import(
	"strings"
)

func CountWords(s string) int {
	return len(strings.Fields(s))
}