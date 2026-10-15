import { creep_format, my_room_information } from "@/config";
import { renewCreep } from "@/Utils/Creep";
import { getRoomControllerLevel, spawnCreep } from "@/Utils/Room";

let OTHER_ROOM_SOURCE_POS: { [roomName: string]: { x: number; y: number } } = {
    "E25N52": {
        x: 26,
        y: 6,
    },
};

// miner 常驻远程房间、负责维持该房间视野。远程房间没有 spawn、无法续命，
// 所以在它快死时提前孵一个替身，让新旧重叠、房间不断视野。
const MINER_REPLACE_TICK = 50;

type RemoteSource = { roomName: string; pos: RoomPosition };

export function OtherRoomSourceMine(homeRoom: Room) {
    homeRoom.memory.other_room_source_mine ??= {};

    for (const roomName in OTHER_ROOM_SOURCE_POS) {
        const { x, y } = OTHER_ROOM_SOURCE_POS[roomName];
        const cfg: RemoteSource = {
            roomName,
            pos: new RoomPosition(x, y, roomName),
        };

        homeRoom.memory.other_room_source_mine[roomName] ??= {
            minerName: null,
            carrierName: null,
        };

        minerManager(homeRoom, cfg);
        minerRun(homeRoom, cfg);
        carrierManager(homeRoom, cfg);
        carrierRun(homeRoom, cfg);
    }
}

/* ---------------------------------- miner ---------------------------------- */

function minerManager(homeRoom: Room, cfg: RemoteSource) {
    const mem = homeRoom.memory.other_room_source_mine[cfg.roomName];

    if (mem.minerName === null) {
        spawnMiner(homeRoom, cfg);
        return;
    }

    const creep = Game.creeps[mem.minerName];
    if (creep === undefined) {
        mem.minerName = null;
        return;
    }
    if (creep.spawning) return;

    // 远程房间无法 renew，改为"快死就孵替身"：新 miner 到位前旧 miner 仍在，视野不断。
    if ((creep.ticksToLive ?? 0) < MINER_REPLACE_TICK) {
        spawnMiner(homeRoom, cfg);
    }
}

function spawnMiner(homeRoom: Room, cfg: RemoteSource) {
    const mem = homeRoom.memory.other_room_source_mine[cfg.roomName];
    const name = `remote_miner_${cfg.roomName}_${Game.time}`;
    const level = getRoomControllerLevel(homeRoom);

    if (
        spawnCreep(homeRoom, creep_format[level].miner, name, {
            memory: { status: 0, level },
        })
    ) {
        mem.minerName = name;
    }
}

function minerRun(homeRoom: Room, cfg: RemoteSource) {
    const mem = homeRoom.memory.other_room_source_mine[cfg.roomName];
    if (mem.minerName === null) return;

    const creep = Game.creeps[mem.minerName];
    if (creep === undefined || creep.spawning) return;

    // 没到目标房间时找不到 source，也不需要视野：直接朝硬编码坐标走，
    // moveTo(RoomPosition) 跨房时会自动走向通往目标房间的出口。
    const source =
        creep.room.name === cfg.roomName
            ? creep.room
                  .find(FIND_SOURCES)
                  .find((s) => s.pos.x === cfg.pos.x && s.pos.y === cfg.pos.y)
            : undefined;

    // miner 无 CARRY，能量会掉在地上
    if (source === undefined || creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(cfg.pos);
    }
}

/* --------------------------------- carrier --------------------------------- */

function carrierManager(homeRoom: Room, cfg: RemoteSource) {
    const mem = homeRoom.memory.other_room_source_mine[cfg.roomName];

    if (mem.carrierName === null) {
        spawnCarrier(homeRoom, cfg);
        return;
    }

    const creep = Game.creeps[mem.carrierName];
    if (creep === undefined) {
        mem.carrierName = null;
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

function spawnCarrier(homeRoom: Room, cfg: RemoteSource) {
    const mem = homeRoom.memory.other_room_source_mine[cfg.roomName];
    const name = `remote_carrier_${cfg.roomName}_${Game.time}`;
    const level = getRoomControllerLevel(homeRoom);

    if (spawnCreep(homeRoom, creep_format[level].carrier, name, { memory: { status: 0, level }})) {
        mem.carrierName = name;
    }
}

function carrierRun(homeRoom: Room, cfg: RemoteSource) {
    const mem = homeRoom.memory.other_room_source_mine[cfg.roomName];
    if (mem.carrierName === null) return;

    const creep = Game.creeps[mem.carrierName];
    if (creep === undefined || creep.spawning) return;

    if (creep.memory.status == 0) {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            let pos = RoomPosition(cfg.pos.x - 1, cfg.pos.y - 2, cfg.roomName)
            if (creep.pos.isEqualTo(pos)) {
                let source = pos.lookFor(LOOK_RESOURCES);
                if (source.length == 0) {
                    return
                }

                creep.pickup(source[0])
            } else {
                creep.moveTo(pos)
            }
        } else {
            creep.memory.status = 1;
        }
    } else if (creep.memory.status == 1) {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            const target =
                homeRoom.storage ??
                Game.spawns[my_room_information[homeRoom.name].spawnName[0]];
            if (target === undefined) return;
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            creep.memory.status = 0;
        }
    } else if (creep.memory.status == 2) {
        renewCreep(homeRoom, creep);
    }
}
