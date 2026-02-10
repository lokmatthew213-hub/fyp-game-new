import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  RefreshCw, 
  SortAsc, 
  Palette, 
  User, 
  Trophy,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import rummikubLogic from './utils/rummikubLogic';

const App = () => {
  const [playerRack, setPlayerRack] = useState([]);
  const [board, setBoard] = useState([]);
  const [npcTileCounts, setNpcTileCounts] = useState([14, 14, 14]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Welcome to Rummikub! Your turn.');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    setPlayerRack(rummikubLogic.getInitialPlayerRack());
    setBoard(rummikubLogic.getInitialBoard());
    setNpcTileCounts([14, 14, 14]);
    setIsGameOver(false);
    setWinner(null);
    setStatusMessage('Game started! Good luck.');
  };

  const handleTileClick = (tile, source, index) => {
    if (selectedTile) {
      // If a tile is already selected, and we click another tile, swap or do nothing
      if (selectedTile.id === tile.id) {
        setSelectedTile(null);
      } else {
        setSelectedTile({ tile, source, index });
      }
    } else {
      setSelectedTile({ tile, source, index });
    }
  };

  const handleBoardSetClick = (setIndex) => {
    if (selectedTile) {
      const { tile, source, index } = selectedTile;
      
      // Move tile to board set
      const newBoard = rummikubLogic.addTileToBoardSet(tile, setIndex, board);
      setBoard(newBoard);

      // Remove from source
      if (source === 'rack') {
        setPlayerRack(playerRack.filter(t => t.id !== tile.id));
      } else if (source === 'board') {
        const updatedBoard = [...newBoard];
        updatedBoard[index] = updatedBoard[index].filter(t => t.id !== tile.id);
        setBoard(updatedBoard.filter(s => s.length > 0 || updatedBoard.indexOf(s) === setIndex));
      }

      setSelectedTile(null);
      setStatusMessage(`Moved ${tile.isJoker ? 'Joker' : tile.number} to set ${setIndex + 1}`);
    }
  };

  const addNewSet = () => {
    if (selectedTile) {
      const { tile, source, index } = selectedTile;
      const newBoard = [...board, [tile]];
      setBoard(newBoard);

      if (source === 'rack') {
        setPlayerRack(playerRack.filter(t => t.id !== tile.id));
      } else if (source === 'board') {
        const updatedBoard = [...board];
        updatedBoard[index] = updatedBoard[index].filter(t => t.id !== tile.id);
        setBoard([...updatedBoard.filter(s => s.length > 0), [tile]]);
      }
      setSelectedTile(null);
      setStatusMessage('Created a new set!');
    } else {
      setStatusMessage('Select a tile first to create a new set.');
    }
  };

  const drawTile = () => {
    const newTile = rummikubLogic.drawTile();
    if (newTile) {
      setPlayerRack([...playerRack, newTile]);
      setStatusMessage('You drew a tile. Turn ends.');
      // In a real game, drawing ends the turn.
      setTimeout(npcTurn, 1000);
    } else {
      setStatusMessage('No more tiles in the pool!');
    }
  };

  const finishTurn = () => {
    if (rummikubLogic.finishTurn(board)) {
      if (playerRack.length === 0) {
        setIsGameOver(true);
        setWinner('Player');
        setStatusMessage('CONGRATULATIONS! You won!');
      } else {
        setStatusMessage('Valid move! NPC turn...');
        setTimeout(npcTurn, 1000);
      }
    } else {
      setStatusMessage('Invalid sets on board! Please fix them or reset.');
    }
  };

  const npcTurn = () => {
    // Simple NPC logic: just pretend they play or draw
    setNpcTileCounts(prev => prev.map(count => {
      const action = Math.random();
      if (action > 0.7 && count > 1) return count - 1; // NPC plays a tile
      if (action < 0.2) return count + 1; // NPC draws a tile
      return count;
    }));
    setStatusMessage('NPCs have moved. Your turn!');
  };

  const resetBoard = () => {
    // In a real game, this should return tiles to their original positions
    // For now, let's just clear the board and give tiles back to rack (simplified)
    const allBoardTiles = board.flat();
    setPlayerRack([...playerRack, ...allBoardTiles]);
    setBoard([]);
    setStatusMessage('Board reset.');
  };

  const getTileColor = (color) => {
    switch (color) {
      case 'Red': return 'text-red-600 border-red-200 bg-red-50';
      case 'Blue': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'Yellow': return 'text-yellow-500 border-yellow-100 bg-yellow-50';
      case 'Black': return 'text-gray-800 border-gray-300 bg-gray-100';
      case 'Joker': return 'text-purple-600 border-purple-200 bg-purple-50';
      default: return 'text-gray-500 border-gray-200 bg-white';
    }
  };

  return (
    <div className="bg-[#1a2a6c] min-h-screen flex flex-col font-sans text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg rotate-3">
            <span className="text-white font-black text-xl">R</span>
          </div>
          <h1 className="text-xl font-black tracking-tight">RUMMIKUB <span className="text-amber-400">KIDS</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-sm font-bold">Score: {106 - playerRack.length}</span>
          </div>
          <button onClick={startGame} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Game Area */}
        <main className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          {/* Opponents */}
          <div className="flex justify-center gap-12">
            {npcTileCounts.map((count, i) => (
              <motion.div 
                key={i}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-white/10 flex items-center justify-center shadow-xl">
                    <User size={32} className="text-slate-400" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#1a2a6c] shadow-lg">
                    {count}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">NPC {i + 1}</span>
              </motion.div>
            ))}
          </div>

          {/* Board */}
          <div className="flex-1 bg-black/20 rounded-[2rem] border-2 border-white/5 p-8 overflow-y-auto no-scrollbar shadow-inner relative">
            <div className="flex flex-wrap gap-6 content-start">
              {board.map((set, setIdx) => (
                <motion.div
                  key={setIdx}
                  layout
                  onClick={() => handleBoardSetClick(setIdx)}
                  className={`min-w-[120px] min-h-[100px] p-3 rounded-2xl border-2 transition-all flex flex-wrap gap-2 items-center justify-center
                    ${rummikubLogic.isValidSet(set) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer'}`}
                >
                  {set.map((tile) => (
                    <Tile 
                      key={tile.id} 
                      tile={tile} 
                      isSelected={selectedTile?.tile.id === tile.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTileClick(tile, 'board', setIdx);
                      }}
                    />
                  ))}
                </motion.div>
              ))}
              
              {/* Add New Set Button */}
              <button 
                onClick={addNewSet}
                className="w-24 h-32 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/40 hover:border-white/40 transition-all hover:scale-105"
              >
                <Plus size={32} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">New Set</span>
              </button>
            </div>

            {/* Status Message Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-3">
              <AlertCircle size={16} className="text-amber-400" />
              <span className="text-sm font-medium">{statusMessage}</span>
            </div>
          </div>
        </main>

        {/* Sidebar Actions */}
        <aside className="w-64 p-6 flex flex-col gap-4 bg-black/10 border-l border-white/5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Actions</h3>
          <ActionButton icon={<Plus />} label="Draw Tile" color="bg-emerald-500" onClick={drawTile} />
          <ActionButton icon={<Check />} label="Finish Turn" color="bg-indigo-500" onClick={finishTurn} />
          
          <div className="h-px bg-white/5 my-2" />
          
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Rack Tools</h3>
          <ActionButton icon={<SortAsc />} label="By Number" color="bg-slate-700" onClick={() => setPlayerRack(rummikubLogic.sortTilesByNumber(playerRack))} />
          <ActionButton icon={<Palette />} label="By Color" color="bg-slate-700" onClick={() => setPlayerRack(rummikubLogic.sortTilesByColor(playerRack))} />
          <ActionButton icon={<RefreshCw />} label="Reset Board" color="bg-rose-500/80" onClick={resetBoard} />
        </aside>
      </div>

      {/* Player Rack */}
      <footer className="h-48 bg-[#3d2b1f] border-t-8 border-[#2d1f16] p-6 relative shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }} />
        <div className="max-w-6xl mx-auto h-full flex items-center gap-3 overflow-x-auto no-scrollbar px-4">
          <AnimatePresence>
            {playerRack.map((tile) => (
              <Tile 
                key={tile.id} 
                tile={tile} 
                isSelected={selectedTile?.tile.id === tile.id}
                onClick={() => handleTileClick(tile, 'rack')}
              />
            ))}
          </AnimatePresence>
          {playerRack.length === 0 && (
            <div className="w-full text-center text-white/20 font-black uppercase tracking-widest italic">Empty Rack</div>
          )}
        </div>
      </footer>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center border-8 border-amber-100"
          >
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="text-amber-600" size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-2">VICTORY!</h2>
            <p className="text-slate-500 mb-8 font-bold uppercase tracking-widest">{winner} has cleared their rack!</p>
            <button 
              onClick={startGame}
              className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const Tile = ({ tile, isSelected, onClick }) => {
  const getTileStyles = (color) => {
    switch (color) {
      case 'Red': return 'text-red-600';
      case 'Blue': return 'text-blue-600';
      case 'Yellow': return 'text-amber-500';
      case 'Black': return 'text-slate-900';
      case 'Joker': return 'text-purple-600';
      default: return 'text-slate-400';
    }
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 1.1 : 1, 
        opacity: 1,
        y: isSelected ? -10 : 0
      }}
      whileHover={{ y: -5, scale: 1.05 }}
      onClick={onClick}
      className={`relative w-14 h-20 flex-shrink-0 bg-white rounded-xl shadow-lg cursor-pointer flex flex-col items-center justify-center border-b-4 border-slate-300 transition-all
        ${isSelected ? 'ring-4 ring-amber-400 shadow-amber-500/50' : 'hover:shadow-xl'}`}
    >
      {tile.isJoker ? (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mb-1">
            <span className="text-xl">⭐</span>
          </div>
          <span className="text-[8px] font-black text-purple-400 uppercase tracking-tighter">Joker</span>
        </div>
      ) : (
        <>
          <span className={`text-3xl font-black leading-none ${getTileStyles(tile.color)}`}>
            {tile.number}
          </span>
          <div className={`w-2 h-2 rounded-full mt-2 ${tile.color === 'Red' ? 'bg-red-500' : tile.color === 'Blue' ? 'bg-blue-500' : tile.color === 'Yellow' ? 'bg-amber-400' : 'bg-slate-900'}`} />
        </>
      )}
    </motion.div>
  );
};

const ActionButton = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full py-3 px-4 ${color} hover:brightness-110 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg transition-all active:scale-95`}
  >
    <div className="bg-white/20 p-1.5 rounded-lg">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

export default App;
