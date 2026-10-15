export function structureControl(room: Room) {
    towerControl(room)
}

function towerControl(room: Room) {
    let towers = room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_TOWER)
    if (towers.length == 0) {
        return
    }

    let targets = room.find(FIND_HOSTILE_CREEPS)
    let heal_creeps = room.find(FIND_MY_CREEPS).filter(c => c.hits < c.hitsMax)
    for (let tower of towers) {
        tower.attack(targets[0])
        tower.heal(heal_creeps[0])
    }

}
