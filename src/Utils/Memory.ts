export function memoryManager() {
    for (const name of Object.keys(Memory.creeps)) {
        if (Game.creeps[name] === undefined) {
            delete Memory.creeps[name];
        }
    }
}
