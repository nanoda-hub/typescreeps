import { Level1SourceMine } from "./Tasks/Level1SourceMine"
import { StructureBuild } from "./Tasks/StructureBuild"

export const Colony = (room: Room) => {

  if (!room.controller || room.controller!.level === 0) {
      return
  }
  if (room.controller!.level === 1) {
    Level1SourceMine(room)
  }

  StructureBuild(room)
}
