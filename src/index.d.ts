interface RoomMemory {
    source_mine: {
        [sourceId: string]: {
            minerName: string | null;
            containerId: Id<StructureContainer> | null;
        };
    };
    level_1_source_mine: {
        [sourceId: string]: {
            workerName: string | null;
        };
    };
    structure_build: {
        workersName: Array<string>;
        targetId: Id<AnyStructure> | null;
    };
    controller_upgrade: {
        containerId: Id<StructureContainer> | null;
        workerName: string | null;
    };
    energy_carry: {
        workersName: Array<string>;
    };
}

interface CreepMemory {
    status: number;
    level: number;
}
