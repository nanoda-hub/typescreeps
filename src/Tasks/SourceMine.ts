import { creep_format, my_room_information } from "@/config";
import { renewCreep } from "@/Utils/Creep";
import { getRoomControllerLevel, spawnCreep } from "@/Utils/Room";

export function SourceMine(room: Room) {
    room.memory.source_mine ??= {};
    let sources = room.find(FIND_SOURCES);
    for (const source of sources) {
        room.memory.source_mine[source.id] ??= {
            minerName: null,
            containerId: null,
            carrierName: null,
        };
        room.memory.source_mine[source.id].carrierName ??= null;
        creepManager(room, source);
        runTask(room, source);
        carrierManager(room, source);
        carrierRun(room, source);
    }
}

function creepManager(room: Room, source: Source) {
    if (room.memory.source_mine[source.id].containerId == null) {
        let spawn_pos =
            Game.spawns[my_room_information[room.name].spawnName[0]].pos;
        let source_pos = source.pos;

        let path = room.findPath(source_pos, spawn_pos, {
            ignoreCreeps: true,
        });

        let { x: target_x, y: target_y } = path[0];

        {
            let target = room
                .lookForAt(LOOK_STRUCTURES, target_x, target_y)
                .find((s) => s.structureType == STRUCTURE_CONTAINER);
            if (target !== undefined) {
                room.memory.source_mine[source.id].containerId = target.id;
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

    if (room.memory.source_mine[source.id].minerName === null) {
        const creep_name = `miner_${room.name}_${Game.time}`;
        if (
            spawnCreep(
                room,
                creep_format[getRoomControllerLevel(room)].miner,
                creep_name,
                {
                    memory: {
                        status: 0,
                        level: getRoomControllerLevel(room),
                    },
                },
            )
        ) {
            room.memory.source_mine[source.id].minerName = creep_name;
        }
        return;
    }

    let creep = Game.creeps[room.memory.source_mine[source.id].minerName!];
    if (creep === undefined) {
        room.memory.source_mine[source.id].minerName = null;
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

function carrierManager(room: Room, source: Source) {
    if (room.memory.source_mine[source.id].carrierName === null) {
        const creep_name = `carrier_${room.name}_${Game.time}`;
        if (spawnCreep(
                room,
                creep_format[getRoomControllerLevel(room)].carrier,
                creep_name,
                {
                    memory: {
                        status: 0,
                        level: getRoomControllerLevel(room),
                    },
                },
            )
        ) {
            room.memory.source_mine[source.id].carrierName = creep_name;
        }
        return;
    }

    let creep = Game.creeps[room.memory.source_mine[source.id].carrierName!];
    if (creep === undefined) {
        room.memory.source_mine[source.id].carrierName = null;
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

function runTask(room: Room, source: Source) {
    if (room.memory.source_mine[source.id].minerName === null) {
        return;
    }
    let creep = Game.creeps[room.memory.source_mine[source.id].minerName!];


    if (creep.spawning) return;

    if (creep.memory.status == 0) {
        if (room.memory.source_mine[source.id].containerId === null) {
            return;
        }

        let target = Game.getObjectById(
            room.memory.source_mine[source.id].containerId!,
        );
        if (target === null) {
            room.memory.source_mine[source.id].containerId = null;
            return;
        }
        let container_pos = target.pos;
        let creep_pos = creep.pos;

        if (creep_pos.x == container_pos.x && creep_pos.y == container_pos.y) {
            creep.memory.status = 1;
        } else {
            creep.moveTo(container_pos);
        }
    } else if (creep.memory.status == 1) {
        creep.harvest(source);
    } else if (creep.memory.status == 2) {
        renewCreep(room, creep)
    }
}

function carrierRun(room: Room, source: Source) {
    if (room.memory.source_mine[source.id].carrierName === null) {
        return;
    }
    let creep = Game.creeps[room.memory.source_mine[source.id].carrierName!];


    if (creep.spawning) return;

    if (creep.memory.status == 0) {
        if (room.memory.source_mine[source.id].containerId === null) {
            return;
        }

        let target = Game.getObjectById(
            room.memory.source_mine[source.id].containerId!,
        );
        if (target === null) {
            room.memory.source_mine[source.id].containerId = null;
            return;
        }

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
            }
        } else {
            creep.memory.status = 1
        }

    } else if (creep.memory.status == 1) {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.transfer(room.storage!, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(room.storage!);
            }
        } else {
            creep.memory.status = 0
        }
    } else if (creep.memory.status == 2) {
        renewCreep(room, creep)
    }
}
