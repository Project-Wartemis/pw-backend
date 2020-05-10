package wrapper

import (
	"fmt"
	"encoding/json"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/Project-Wartemis/pw-backend/internal/base"
	"github.com/Project-Wartemis/pw-backend/internal/util"
)

type RoomWrapper struct {}

func NewRoomWrapper() *RoomWrapper {
	return &RoomWrapper {}
}

func (this *RoomWrapper) AddClient(writer http.ResponseWriter, request *http.Request) {
	roomKey := mux.Vars(request)["room"]
	room := base.GetLobby().GetRoomByKey(roomKey)
	if room == nil {
		util.WriteStatus(writer, http.StatusNotFound, fmt.Sprintf("Could not find room for key [%s]", roomKey))
		return
	}

	clientKey := new(string)
	err := json.NewDecoder(request.Body).Decode(clientKey)
	if err != nil {
		util.WriteStatus(writer, http.StatusBadRequest, "Could not parse clientKey", err)
		return
	}

	client := base.GetLobby().GetClientByKey(*clientKey)
	if client == nil {
		util.WriteStatus(writer, http.StatusNotFound, fmt.Sprintf("Could not find client for key [%s]", clientKey))
		return
	}

	room.AddClient(client)

	util.WriteJson(writer, client)
}