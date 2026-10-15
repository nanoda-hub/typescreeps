"use strict";

import { Colony } from "./Colony";
import { my_room_information } from "./config";
import { memoryManager } from "./Utils/Memory";
import "./Utils/Room";

let restart = true;

export const loop = function () {
    if (restart) {

        console.log(`restart at ${Game.time}`)
        memoryManager();
        restart = false;
    }

    Object.keys(my_room_information).forEach((roomName) => {
        const room = Game.rooms[roomName];
        Colony(room);
    });
};
