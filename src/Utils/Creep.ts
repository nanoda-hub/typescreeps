import { my_room_information, structure_limit } from "@/config";
import { getMaxEnergy, getRoomControllerLevel, getTotalEnergy } from "./Room";
import { win32 } from "path/win32";

var renew_tick_to_last = 0;
var recycle_tick_to_last = 0;

export function creepManager(room: Room) {

    let total_energy = getTotalEnergy(room)
    let max_energy = getMaxEnergy(room)

    if (total_energy / max_energy > 0.8) {

        if (Game.time - renew_tick_to_last > 300) {
            let creep = room.find(FIND_MY_CREEPS).filter(c => !c.spawning).sort((a, b) => a.ticksToLive! - b.ticksToLive!)[0];
            creep.memory.status = 2;
            renew_tick_to_last = Game.time
        }
    }



    let manager_creep = room
        .find(FIND_MY_CREEPS)
        .find((c) => c.memory.status == 3);

    if (manager_creep === undefined) {
        if (Game.time - recycle_tick_to_last < 50) {
            return
        }

        if (
            room.find(FIND_STRUCTURES)
                .filter((s) => s.structureType == STRUCTURE_EXTENSION).length <
            structure_limit[room.controller!.level].STRUCTURE_EXTENSION
        ) {
            return;
        }

        let creeps = room
            .find(FIND_MY_CREEPS)
            .filter((c) => c.memory.level < getRoomControllerLevel(room));
        if (creeps.length === 0) {
            return;
        }
        creeps[0].memory.status = 3;
    } else {
        let spawn = Game.spawns[my_room_information[room.name].spawnName[0]];
        if (spawn.recycleCreep(manager_creep) == ERR_NOT_IN_RANGE) {
            manager_creep.moveTo(spawn);
        }
        recycle_tick_to_last = Game.time
    }

}

export function renewCreep(room: Room, creep: Creep) {
    const spawn = Game.spawns[my_room_information[room.name].spawnName[0]];
    if (spawn.renewCreep(creep) == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
    }
}
