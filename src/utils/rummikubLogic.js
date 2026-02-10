import { v4 as uuidv4 } from 'uuid';

export const COLORS = ['Red', 'Blue', 'Yellow', 'Black'];

let tilePool = [];

export const generateTiles = () => {
    let tiles = [];
    for (const color of COLORS) {
        for (let number = 1; number <= 13; number++) {
            tiles.push({ id: uuidv4(), color, number, isJoker: false });
            tiles.push({ id: uuidv4(), color, number, isJoker: false });
        }
    }
    for (let i = 0; i < 2; i++) {
        tiles.push({ id: uuidv4(), color: 'Joker', number: null, isJoker: true });
    }
    return shuffle(tiles);
};

const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const getInitialPlayerRack = () => {
    if (tilePool.length === 0) tilePool = generateTiles();
    const rack = tilePool.splice(0, 14);
    return rack;
};

export const getInitialBoard = () => {
    return []; // Board starts empty
};

export const drawTile = () => {
    if (tilePool.length === 0) return null;
    return tilePool.pop();
};

export const sortTilesByNumber = (tiles) => {
    return [...tiles].sort((a, b) => {
        if (a.isJoker) return 1;
        if (b.isJoker) return -1;
        if (a.number !== b.number) return a.number - b.number;
        return COLORS.indexOf(a.color) - COLORS.indexOf(b.color);
    });
};

export const sortTilesByColor = (tiles) => {
    return [...tiles].sort((a, b) => {
        if (a.isJoker) return 1;
        if (b.isJoker) return -1;
        if (a.color !== b.color) return COLORS.indexOf(a.color) - COLORS.indexOf(b.color);
        return a.number - b.number;
    });
};

export const isValidSet = (tiles) => {
    if (tiles.length < 3) return false;
    return isGroup(tiles) || isRun(tiles);
};

const isGroup = (tiles) => {
    if (tiles.length < 3 || tiles.length > 4) return false;
    const nonJokers = tiles.filter(t => !t.isJoker);
    if (nonJokers.length === 0) return true;
    const number = nonJokers[0].number;
    const colors = new Set();
    for (const tile of nonJokers) {
        if (tile.number !== number) return false;
        if (colors.has(tile.color)) return false;
        colors.add(tile.color);
    }
    return true;
};

const isRun = (tiles) => {
    if (tiles.length < 3) return false;
    const nonJokers = tiles.filter(t => !t.isJoker);
    if (nonJokers.length === 0) return true;
    const color = nonJokers[0].color;
    if (nonJokers.some(t => t.color !== color)) return false;
    const numbers = nonJokers.map(t => t.number).sort((a, b) => a - b);
    if (new Set(numbers).size !== numbers.length) return false;
    const range = numbers[numbers.length - 1] - numbers[0] + 1;
    return range <= tiles.length && range <= 13;
};

export const addTileToBoardSet = (tile, setIndex, board) => {
    const newBoard = [...board];
    if (!newBoard[setIndex]) newBoard[setIndex] = [];
    newBoard[setIndex] = [...newBoard[setIndex], tile];
    return newBoard;
};

export const finishTurn = (board) => {
    // Check if all sets on board are valid
    for (const set of board) {
        if (set.length > 0 && !isValidSet(set)) return false;
    }
    return true;
};

export default {
    generateTiles,
    getInitialPlayerRack,
    getInitialBoard,
    drawTile,
    sortTilesByNumber,
    sortTilesByColor,
    isValidSet,
    addTileToBoardSet,
    finishTurn
};
