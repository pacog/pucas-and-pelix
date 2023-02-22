import { PucasPelixPlayer } from "./player";
import { range } from "./range";

interface GameWorldOptions {
    maxPlayers: number;
}
export class GameWorld {
    players: PucasPelixPlayer[];

    constructor(options: GameWorldOptions) {
        this.players = Array.from(range(0, options.maxPlayers)).map(
            (index) => new PucasPelixPlayer(index)
        );
    }
}
