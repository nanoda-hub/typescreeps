

interface RoomMemory {
    source_mine: {
        [sourceId: string]: {
            minerName: string | null,
            carrierName: string | null,
            containerId: Id<StructureContainer> | null,
        }
    },
    level_1_source_mine: {
        [sourceId: string]: {
            workerName: string | null,
        }
    },
    build_structure: {
        targetsId: Array<Id<ConstructionSite>>,
        workersName: Array<string>,
    },
    controller_upgrade: {
        containerId: Id<StructureContainer> | null,
        workerName: string | null,
    }
}

interface CreepMemory {
    status: number,
    level: number,
}
