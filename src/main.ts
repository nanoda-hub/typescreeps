'use strict';

import { Colony } from "./Colony";
import { my_room_information } from "./config";
import "./Utils/Room";

export const loop = function () {
    console.log(Game.time)
    Object.keys(my_room_information).forEach(roomName => {
        const room = Game.rooms[roomName]
        Colony(room)
    })
}