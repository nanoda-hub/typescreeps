import { my_room_information } from "@/config";

let spawnRequestTick = -1;
const spawnRequested = new Set<string>();

export function spawnCreep(
    room: Room,
    body: BodyPartConstant[],
    name: string,
    opts?: SpawnOptions,
): boolean {
    if (spawnRequestTick !== Game.time) {
        spawnRequestTick = Game.time;
        spawnRequested.clear();
    }

    const spawnNames = my_room_information[room.name].spawnName;

    for (const spawnName of spawnNames) {
        const spawn = Game.spawns[spawnName];
        if (!spawn || spawnRequested.has(spawn.name)) {
            continue;
        }

        const result = spawn.spawnCreep(body, name, opts);
        if (result === OK) {
            spawnRequested.add(spawn.name);
            return true;
        }

        if (result !== ERR_NOT_ENOUGH_ENERGY && result !== ERR_BUSY) {
            return false;
        }
    }

    return false;
}

export function renewCreep(room: Room, creep: Creep) {
    const spawn = Game.spawns[my_room_information[room.name].spawnName[0]]
    if (spawn.renewCreep(creep) == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn)
    }
}
