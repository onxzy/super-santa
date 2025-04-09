package groupService

type GroupInfo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type DrawSession struct {
	UserIDs []int `json:"user_ids"`
}
