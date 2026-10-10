"use strict";

import { Colony } from "./Colony";
import { my_room_information } from "./config";
import "./Utils/Room";

let restart = true;

export const loop = function () {
    if (restart) {
        for (const name of Object.keys(Memory.creeps)) {
            if (Game.creeps[name] === undefined) {
                delete Memory.creeps[name];
            }
        }
        restart = false;
    }

    Object.keys(my_room_information).forEach((roomName) => {
        const room = Game.rooms[roomName];
        Colony(room);
    });
};
