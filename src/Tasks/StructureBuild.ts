import { creep_format } from "@/config"
import { getWithdrawStructures, renewCreep, spawnCreep } from "@/Utils/Room"

export function StructureBuild(room: Room) {
  creepManager(room)
}

function creepManager(room: Room) {
  let names = room.memory.structure_build.workersName
  room.memory.structure_build.workersName = names.filter(name => Game.creeps[name] !== undefined)

  if (room.memory.structure_build.workersName.length < 2) {
    const worker_name = `worker_${room.name}_${Game.time}`
    if (spawnCreep(room, creep_format[room.controller!.level].worker, worker_name)) {
      room.memory.structure_build.workersName.push(worker_name)
    }
  }

  let creeps = room.memory.structure_build.workersName.map(name => Game.creeps[name])
  for (const creep of creeps) {
    if (creep.spawning)
     return

    if (creep.ticksToLive! < 150) {
      creep.memory.status = 2
    }

    if (creep.memory.status == 2 && creep.ticksToLive! > 1300) {
      creep.memory.status = 0
    }
  }

}

function runTask(room: Room) {
  let construction_sites = room.memory.structure_build.targetsId
  room.memory.structure_build.targetsId = construction_sites.filter(id => Game.getObjectById(id) !== null)
  if (room.memory.structure_build.targetsId.length == 0) return

  let target = Game.getObjectById(room.memory.structure_build.targetsId[0])!
  let creeps = room.memory.structure_build.workersName.map(name => Game.creeps[name])
  for (const creep of creeps) {
    if (creep.spawning) continue

    if (creep.memory.status == 0) {
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        let s = getWithdrawStructures(room)
        if (s === null) {
          continue
        }
        if (creep.withdraw(s, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(s)
        }
      } else {
        creep.memory.status = 1
      }
    } else if (creep.memory.status == 1) {
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target)
        }
      } else {
        creep.memory.status = 0
      }
    } else if (creep.memory.status == 2) {
      renewCreep(room, creep)
    }
  }
}
