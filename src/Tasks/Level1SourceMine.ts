import { creep_format, my_room_information } from "@/config";
import { getStoreStructures, renewCreep, spawnCreep } from "@/Utils/Room";

export function Level1SourceMine(room: Room) {

  let sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    room.memory.level_1_source_mine[source.id] ??= {
      workerName: null
    }
    creepManager(room, source)
    runTask(room, source)
    break
  }
}

function creepManager(room: Room, source: Source) {
  if (room.memory.level_1_source_mine[source.id].workerName === null) {
    const creep_name = `worker_${room.name}_${Game.time}`
    if (spawnCreep(room, creep_format[1].worker, creep_name, {
      memory: {
        status: 0,
        level: room.controller!.level
      }
    })) {
      room.memory.level_1_source_mine[source.id].workerName = creep_name
    }

    return
  }

  let creep = Game.creeps[room.memory.level_1_source_mine[source.id].workerName!]
  if (creep === undefined) {
    room.memory.level_1_source_mine[source.id].workerName = null
    return;
  }

  if (creep.spawning)
    return

  if (creep.ticksToLive! < 150) {
    creep.memory.status = 2
  }

  if (creep.memory.status == 2 && creep.ticksToLive! > 1300) {
    creep.memory.status = 0
  }

}

function runTask(room: Room, source: Source) {
  if (room.memory.level_1_source_mine[source.id].workerName === null) return
  let creep = Game.creeps[room.memory.level_1_source_mine[source.id].workerName!]
  if (creep.spawning) return

  if (creep.memory.status == 0) {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source)
      }
    } else {
      creep.memory.status = 1
    }
  } else if (creep.memory.status == 1) {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      let s = getStoreStructures(room)
      if (s === null) {
        return
      }
      if (creep.transfer(s, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(s)
      }
    } else {
      creep.memory.status = 0
    }
  } else if (creep.memory.status == 2) {
    renewCreep(room, creep)
  }

}
