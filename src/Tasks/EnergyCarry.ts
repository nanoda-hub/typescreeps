import { creep_format } from "@/config";
import {
    getRoomControllerLevel,
    getStoreStructures,
    getWithdrawStructures,
    renewCreep,
    spawnCreep,
} from "@/Utils/Room";

export function EnergyCarry(room: Room) {
    room.memory.energy_carry ??= {
        workersName: Array<string>(0),
    };

    creepManager(room);
    runTask(room);
}

function creepManager(room: Room) {
    let names = room.memory.energy_carry.workersName;
    room.memory.energy_carry.workersName = names.filter(
        (name) => Game.creeps[name] !== undefined,
    );

    if (room.memory.energy_carry.workersName.length < 2) {
        const worker_name = `carrier_${room.name}_${Game.time}`;
        if (
            spawnCreep(
                room,
                creep_format[getRoomControllerLevel(room)].carrier,
                worker_name,
                {
                    memory: {
                        status: 0,
                        level: getRoomControllerLevel(room),
                    },
                },
            )
        ) {
            room.memory.energy_carry.workersName.push(worker_name);
        }
    }

    let creeps = room.memory.energy_carry.workersName.map(
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
    let creeps = room.memory.energy_carry.workersName.map(
        (name) => Game.creeps[name],
    );

    for (const creep of creeps) {
        if (creep.spawning) continue;
        if (creep.memory.status == 0) {
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                let s = getWithdrawStructures(room);
                if (s === null) {
                    return;
                }
                if (creep.withdraw(s, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(s);
                }
            } else {
                creep.memory.status = 1;
            }
        } else if (creep.memory.status == 1) {
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                let s = getStoreStructures(room);
                if (s === null) {
                    return;
                }
                if (creep.transfer(s, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(s);
                }
            } else {
                creep.memory.status = 0;
            }
        } else if (creep.memory.status == 2) {
            renewCreep(room, creep);
        }
    }
}
