import { my_room_information, structure_limit } from "./config";
import { ControllerUpgrade } from "./Tasks/ControllerUpgrade";
import { EnergyCarry } from "./Tasks/EnergyCarry";
import { Level1SourceMine } from "./Tasks/Level1SourceMine";
import { OtherRoomSourceMine } from "./Tasks/OtherRoomSourceMine";
import { SourceMine } from "./Tasks/SourceMine";
import { StructureBuild } from "./Tasks/StructureBuild";
import { structureControl } from "./Tasks/StructureControl";
import { creepManager } from "./Utils/Creep";
import { getRoomControllerLevel } from "./Utils/Room";

export const Colony = (room: Room) => {
    if (!room.controller || room.controller!.level === 0) {
        return;
    }

    if (getRoomControllerLevel(room) <= 2) {
        Level1SourceMine(room);
    }
    SourceMine(room);
    OtherRoomSourceMine(room);
    EnergyCarry(room);
    StructureBuild(room);
    ControllerUpgrade(room);
    structureControl(room)
    creepManager(room)
};
