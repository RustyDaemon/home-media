package helpers

import "strings"

// EscapeLikePattern escapes the SQL LIKE metacharacters (% and _) and the
// escape character itself so user input matches literally when used with
// `LIKE ... ESCAPE '\'`.
func EscapeLikePattern(s string) string {
	replacer := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`)
	return replacer.Replace(s)
}

// DeduplicateUintSlice removes duplicate values from a slice of uint
func DeduplicateUintSlice(slice []uint) []uint {
	if len(slice) == 0 {
		return slice
	}

	seen := make(map[uint]bool)
	result := make([]uint, 0, len(slice))

	for _, value := range slice {
		if !seen[value] {
			seen[value] = true
			result = append(result, value)
		}
	}

	return result
}
