import { creep_format, my_room_information } from "@/config";
import { getRoomControllerLevel, renewCreep, spawnCreep } from "@/Utils/Room";

export function ControllerUpgrade(room: Room) {
    room.memory.controller_upgrade ??= {
        workerName: null,
        containerId: null,
    };
    creepManager(room);
    runTask(room);
}

function creepManager(room: Room) {
    // container manager
    if (room.memory.controller_upgrade.containerId == null) {
        let spawn_pos =
            Game.spawns[my_room_information[room.name].spawnName[0]].pos;
        let controller_pos = room.controller!.pos;

        let path = room.findPath(controller_pos, spawn_pos, {
            ignoreCreeps: true,
        });

        let { x: target_x, y: target_y } = path[1];
        {
            let target = room
                .lookForAt(LOOK_STRUCTURES, target_x, target_y)
                .find((s) => s.structureType == STRUCTURE_CONTAINER);
            if (target !== undefined) {
                room.memory.controller_upgrade.containerId = target.id;
                return;
            }
        }

        let target = room
            .lookForAt(LOOK_CONSTRUCTION_SITES, target_x, target_y)
            .find((s) => s.structureType == STRUCTURE_CONTAINER);
        if (target !== undefined) {
            return;
        } else {
            let res = room.createConstructionSite(
                target_x,
                target_y,
                STRUCTURE_CONTAINER,
            );
            if (res != OK) {
                console.log(`createConstructionSite failed ${res}`);
            }
        }
        return;
    }

    if (room.memory.controller_upgrade.workerName === null) {
        const creep_name = `worker_${room.name}_${Game.time}`;
        if (
            spawnCreep(
                room,
                creep_format[getRoomControllerLevel(room)].worker,
                creep_name,
                {
                    memory: {
                        status: 0,
                        level: getRoomControllerLevel(room),
                    },
                },
            )
        ) {
            room.memory.controller_upgrade.workerName = creep_name;
        }
        return;
    }

    let creep = Game.creeps[room.memory.controller_upgrade.workerName!];
    if (creep === undefined) {
        room.memory.controller_upgrade.workerName = null;
        return;
    }

    if (creep.spawning) return;

    if (creep.ticksToLive! < 150) {
        creep.memory.status = 2;
    }

    if (creep.memory.status == 2 && creep.ticksToLive! > 1350) {
        creep.memory.status = 0;
    }
}

function runTask(room: Room) {
    if (room.memory.controller_upgrade.workerName === null) {
        return;
    }
    let creep = Game.creeps[room.memory.controller_upgrade.workerName!];
    if (room.memory.controller_upgrade.containerId === null) {
        return;
    }
    let target = Game.getObjectById(room.memory.controller_upgrade.containerId);
    if (target === null) {
        room.memory.controller_upgrade.containerId = null;
        return;
    }
    if (creep.spawning) return;

    if (creep.memory.status == 0) {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            creep.memory.status = 1;
        }
    } else if (creep.memory.status == 1) {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.upgradeController(room.controller!) == ERR_NOT_IN_RANGE) {
                creep.moveTo(room.controller!);
            }
        } else {
            creep.memory.status = 0;
        }
    } else if (creep.memory.status == 2) {
        renewCreep(room, creep);
    }
}
