import { my_room_information, structure_limit } from "./config";
import { ControllerUpgrade } from "./Tasks/ControllerUpgrade";
import { EnergyCarry } from "./Tasks/EnergyCarry";
import { Level1SourceMine } from "./Tasks/Level1SourceMine";
import { SourceMine } from "./Tasks/SourceMine";
import { StructureBuild } from "./Tasks/StructureBuild";

export const Colony = (room: Room) => {
    if (!room.controller || room.controller!.level === 0) {
        return;
    }
    creepManager(room);
    if (room.controller!.level === 1) {
    }
    Level1SourceMine(room);
    SourceMine(room);
    StructureBuild(room);
    EnergyCarry(room);
    ControllerUpgrade(room);
};

function creepManager(room: Room) {
    if (
        room
            .find(FIND_STRUCTURES)
            .filter((s) => s.structureType == STRUCTURE_EXTENSION).length <
        structure_limit[room.controller!.level].STRUCTURE_EXTENSION
    ) {
        return;
    }

    let manager_creep = room
        .find(FIND_MY_CREEPS)
        .find((c) => c.memory.status == 3);

    if (manager_creep === undefined) {
        let creeps = room
            .find(FIND_MY_CREEPS)
            .filter((c) => c.memory.level < room.controller!.level);
        if (creeps.length === 0) {
            return;
        }
        creeps[0].memory.status = 3;
    } else {
        let spawn = Game.spawns[my_room_information[room.name].spawnName[0]];
        if (spawn.recycleCreep(manager_creep) == ERR_NOT_IN_RANGE) {
            manager_creep.moveTo(spawn);
        }
    }
}
