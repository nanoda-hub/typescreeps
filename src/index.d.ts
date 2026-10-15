interface RoomMemory {
    source_mine: {
        [sourceId: string]: {
            minerName: string | null;
            containerId: Id<StructureContainer> | null;
            carrierName: string | null;
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
        workersName: Array<string>;
    };
    energy_carry: {
        workersName: Array<string>;
    };
    other_room_source_mine: {
        [roomName: string]: {
            minerName: string | null;
            carrierName: string | null;
        };
    };
}

interface CreepMemory {
    status: number;
    level: number;
}

declare const MIN_TICK = 150;
declare const MAX_TICK = 1350;
