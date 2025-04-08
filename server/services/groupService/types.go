package groupService

type GroupInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type DrawSession struct {
	UserIDs []string `json:"user_ids"`
}
