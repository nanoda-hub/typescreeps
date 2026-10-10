import { creep_format } from "@/config";
import {
    getRoomControllerLevel,
    getWithdrawStructures,
    renewCreep,
    spawnCreep,
} from "@/Utils/Room";

let build_number = 3;

export function StructureBuild(room: Room) {
    room.memory.structure_build ??= {
        workersName: Array<string>(0),
        targetId: null,
    };
    room.memory.structure_build.targetId = null;
    creepManager(room);
    runTask(room);
}

function creepManager(room: Room) {
    let names = room.memory.structure_build.workersName;
    room.memory.structure_build.workersName = names.filter(
        (name) => Game.creeps[name] !== undefined,
    );

    if (room.memory.structure_build.workersName.length < build_number) {
        const worker_name = `worker_${room.name}_${Game.time}`;
        if (
            spawnCreep(
                room,
                creep_format[getRoomControllerLevel(room)].worker,
                worker_name,
                {
                    memory: {
                        status: 0,
                        level: getRoomControllerLevel(room),
                    },
                },
            )
        ) {
            room.memory.structure_build.workersName.push(worker_name);
        }
    }

    let creeps = room.memory.structure_build.workersName.map(
        (name) => Game.creeps[name],
    );
    for (const creep of creeps) {
        if (creep.spawning) return;

        if (creep.ticksToLive! < 150) {
            creep.memory.status = 2;
        }

        if (creep.memory.status == 2 && creep.ticksToLive! > 1350) {
            creep.memory.status = 0;
        }
    }
}

function runTask(room: Room) {
    let targets = room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length != 0) {
        let target = targets[0];

        let creeps = room.memory.structure_build.workersName.map(
            (name) => Game.creeps[name],
        );

        let s = getWithdrawStructures(room);
        for (const creep of creeps) {
            if (creep.spawning) continue;

            if (creep.memory.status == 0) {
                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    if (s === null) {
                        if (
                            creep.harvest(
                                Game.getObjectById(
                                    Object.keys(
                                        room.memory.level_1_source_mine,
                                    )[0],
                                ) as Source,
                            ) == ERR_NOT_IN_RANGE
                        ) {
                            creep.moveTo(
                                Game.getObjectById(
                                    Object.keys(
                                        room.memory.level_1_source_mine,
                                    )[0],
                                ) as Source,
                            );
                        }
                    } else {
                        if (
                            creep.withdraw(s, RESOURCE_ENERGY) ==
                            ERR_NOT_IN_RANGE
                        ) {
                            creep.moveTo(s);
                        }
                    }
                } else {
                    creep.memory.status = 1;
                }
            } else if (creep.memory.status == 1) {
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    creep.memory.status = 0;
                }
            } else if (creep.memory.status == 2) {
                renewCreep(room, creep);
            }

            // creep.moveTo(25, 33)
        }
    } else {
        if (room.memory.structure_build.targetId === null) {
            let targets: AnyStructure[] = room
                .find(FIND_STRUCTURES)
                .filter(
                    (s) =>
                        (s.structureType == STRUCTURE_CONTAINER ||
                            s.structureType == STRUCTURE_ROAD) &&
                        s.hits / s.hitsMax < 0.05,
                );

            if (targets.length == 0) {
                return;
            }

            room.memory.structure_build.targetId = targets[0].id;
        }

        if (room.memory.structure_build.targetId === null) {
            return;
        }

        let target = Game.getObjectById(room.memory.structure_build.targetId);

        if (target == null || target.hits / target.hitsMax > 0.9) {
            room.memory.structure_build.targetId = null;
            return;
        }

        let creeps = room.memory.structure_build.workersName.map(
            (name) => Game.creeps[name],
        );

        let s = getWithdrawStructures(room);
        for (const creep of creeps) {
            if (creep.spawning) continue;

            if (creep.memory.status == 0) {
                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    if (s === null) {
                        if (
                            creep.harvest(
                                Game.getObjectById(
                                    Object.keys(
                                        room.memory.level_1_source_mine,
                                    )[0],
                                ) as Source,
                            ) == ERR_NOT_IN_RANGE
                        ) {
                            creep.moveTo(
                                Game.getObjectById(
                                    Object.keys(
                                        room.memory.level_1_source_mine,
                                    )[0],
                                ) as Source,
                            );
                        }
                    } else {
                        if (
                            creep.withdraw(s, RESOURCE_ENERGY) ==
                            ERR_NOT_IN_RANGE
                        ) {
                            creep.moveTo(s);
                        }
                    }
                } else {
                    creep.memory.status = 1;
                }
            } else if (creep.memory.status == 1) {
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                } else {
                    creep.memory.status = 0;
                }
            } else if (creep.memory.status == 2) {
                renewCreep(room, creep);
            }
        }
    }
}

function structureManager(room: Room) {}
