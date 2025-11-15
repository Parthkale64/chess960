import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Chess } from 'chess.js';

const BACKEND_URL = 'http://localhost:4000';

export const useMultiplayer = (roomId: string | null, onGameUpdate: (fen: string) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerRole, setPlayerRole] = useState<'w' | 'b' | 'spectator' | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('joinGame', roomId);
    });

    newSocket.on('playerRole', (role: 'w' | 'b' | 'spectator') => {
      setPlayerRole(role);
    });

    newSocket.on('gameUpdate', (fen: string) => {
      onGameUpdate(fen);
    });

    newSocket.on('invalidMove', (fen: string) => {
      onGameUpdate(fen);
    });

    newSocket.on('gameOver', (reason: string) => {
      console.log('Game over:', reason);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.close();
    };
  }, [roomId, onGameUpdate]);

  const makeMove = (move: any) => {
    if (socket && roomId) {
      socket.emit('move', { roomId, move });
    }
  };

  return { socket, playerRole, isConnected, makeMove };
};
