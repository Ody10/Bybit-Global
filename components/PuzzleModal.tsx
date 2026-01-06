'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface PuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [completionTime, setCompletionTime] = useState<string>('0');
  const [percentage, setPercentage] = useState(0);
  const [targetX, setTargetX] = useState(180);
  const [pieceY, setPieceY] = useState(55);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  const PUZZLE_SIZE = 50;
  const CONTAINER_WIDTH = 288;
  const CONTAINER_HEIGHT = 170;
  const TOLERANCE = 6;
  const SLIDER_BTN_WIDTH = 52;

  const generateNewPuzzle = useCallback(() => {
    const newTargetX = Math.floor(Math.random() * (CONTAINER_WIDTH - PUZZLE_SIZE - 120)) + 120;
    const newPieceY = Math.floor(Math.random() * (CONTAINER_HEIGHT - PUZZLE_SIZE - 50)) + 25;
    
    setTargetX(newTargetX);
    setPieceY(newPieceY);
    setSliderValue(0);
    setIsSuccess(false);
    setIsFailed(false);
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (isOpen) {
      generateNewPuzzle();
    }
  }, [isOpen, generateNewPuzzle]);

  const maxSlide = CONTAINER_WIDTH - PUZZLE_SIZE;
  const currentPieceX = (sliderValue / 100) * maxSlide;

  const handleSliderChange = useCallback((clientX: number) => {
    if (!sliderRef.current || isSuccess) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = rect.width - SLIDER_BTN_WIDTH;
    const x = clientX - rect.left - (SLIDER_BTN_WIDTH / 2);
    const percentage = Math.max(0, Math.min(100, (x / sliderWidth) * 100));
    
    setSliderValue(percentage);
  }, [isSuccess]);

  const checkSuccess = useCallback(() => {
    const distance = Math.abs(currentPieceX - targetX);
    
    if (distance <= TOLERANCE) {
      const endTime = Date.now();
      const time = ((endTime - startTime) / 1000).toFixed(1);
      setCompletionTime(time);
      setPercentage(Math.floor(Math.random() * 25) + 65);
      setIsSuccess(true);
      setSliderValue((targetX / maxSlide) * 100);
      
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      setIsFailed(true);
      setTimeout(() => {
        setSliderValue(0);
        setIsFailed(false);
      }, 600);
    }
  }, [currentPieceX, targetX, startTime, maxSlide, onSuccess]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setIsFailed(false);
    handleSliderChange(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isSuccess) {
        handleSliderChange(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDragging && !isSuccess) {
        setIsDragging(false);
        checkSuccess();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isSuccess, handleSliderChange, checkSuccess]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setIsFailed(false);
    handleSliderChange(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && !isSuccess) {
      handleSliderChange(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && !isSuccess) {
      setIsDragging(false);
      checkSuccess();
    }
  };

  const handleRefresh = () => {
    generateNewPuzzle();
  };

  if (!isOpen) return null;

  const sliderBtnLeft = `calc(${sliderValue}% - ${(sliderValue / 100) * SLIDER_BTN_WIDTH}px)`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div 
        className="bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{ width: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-4 text-center">
          <p className="text-gray-700 text-[15px] font-medium">Slide to complete the puzzle</p>
        </div>

        <div className="px-4">
          <div 
            className="relative overflow-hidden rounded-lg"
            style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}
          >
            <div className="absolute inset-0">
              <svg width="100%" height="100%" viewBox="0 0 288 170" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e2330" />
                    <stop offset="50%" stopColor="#171c28" />
                    <stop offset="100%" stopColor="#0f1318" />
                  </linearGradient>
                  <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0a0e14" />
                    <stop offset="100%" stopColor="#151a24" />
                  </linearGradient>
                </defs>
                
                <rect width="288" height="170" fill="url(#bgGrad)" />
                <ellipse cx="60" cy="150" rx="80" ry="40" fill="#2a2f3a" opacity="0.5" />
                
                <g transform="translate(25, 30)">
                  <ellipse cx="45" cy="90" rx="35" ry="25" fill="#3d434f" />
                  <path d="M10 70 Q45 55 80 70 L75 95 Q45 85 15 95 Z" fill="#4a505c" />
                  <rect x="38" y="45" width="14" height="15" fill="#d4a574" rx="3" />
                  <ellipse cx="45" cy="35" rx="22" ry="25" fill="#d4a574" />
                  <path d="M23 30 Q25 10 45 8 Q65 10 67 30 Q65 20 45 18 Q25 20 23 30" fill="#5c4033" />
                  <ellipse cx="45" cy="12" rx="18" ry="8" fill="#5c4033" />
                  <path d="M18 35 Q18 8 45 5 Q72 8 72 35" stroke="#2d3139" strokeWidth="5" fill="none" />
                  <ellipse cx="16" cy="38" rx="10" ry="14" fill="#3d434f" />
                  <ellipse cx="16" cy="38" rx="7" ry="10" fill="#2d3139" />
                  <ellipse cx="74" cy="38" rx="10" ry="14" fill="#3d434f" />
                  <ellipse cx="74" cy="38" rx="7" ry="10" fill="#2d3139" />
                  <path d="M20 32 Q20 12 45 9 Q70 12 70 32" stroke="#4a505c" strokeWidth="2" fill="none" />
                </g>
                
                <g transform="translate(140, 35)">
                  <rect x="0" y="0" width="130" height="95" rx="4" fill="#1a1f2a" stroke="#2d3139" strokeWidth="2" />
                  <rect x="5" y="5" width="120" height="85" rx="2" fill="url(#screenGrad)" />
                  <text x="65" y="32" textAnchor="middle" fontSize="18" fontWeight="bold" fontFamily="Arial">
                    <tspan fill="#ffffff">BYB</tspan>
                    <tspan fill="#f7a600">I</tspan>
                    <tspan fill="#ffffff">T</tspan>
                  </text>
                  <g transform="translate(15, 45)">
                    <path d="M0 35 L15 25 L30 30 L50 10 L70 20 L85 5 L100 15" stroke="#f7a600" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0 40 L25 30 L50 38 L75 22 L100 28" stroke="#00d26a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
                
                <rect x="130" y="130" width="150" height="8" fill="#2a2f3a" rx="2" opacity="0.3" />
              </svg>
            </div>

            {/* Target hole - HIGHLY VISIBLE VERSION */}
            <div 
              className="absolute"
              style={{
                left: targetX,
                top: pieceY,
                width: PUZZLE_SIZE,
                height: PUZZLE_SIZE,
              }}
            >
              <svg width={PUZZLE_SIZE} height={PUZZLE_SIZE} viewBox="0 0 50 50">
                {/* Dark background fill */}
                <path
                  d="M25 47 C25 47 5 31 5 18 C5 9 11 3 20 3 C23 3 25 5 25 5 C25 5 27 3 30 3 C39 3 45 9 45 18 C45 31 25 47 25 47Z"
                  fill="rgba(0,0,0,0.75)"
                />
                {/* Bright white dashed border */}
                <path
                  d="M25 47 C25 47 5 31 5 18 C5 9 11 3 20 3 C23 3 25 5 25 5 C25 5 27 3 30 3 C39 3 45 9 45 18 C45 31 25 47 25 47Z"
                  fill="none"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
                {/* Yellow glow outline */}
                <path
                  d="M25 47 C25 47 5 31 5 18 C5 9 11 3 20 3 C23 3 25 5 25 5 C25 5 27 3 30 3 C39 3 45 9 45 18 C45 31 25 47 25 47Z"
                  fill="none"
                  stroke="rgba(247,166,0,0.4)"
                  strokeWidth="4"
                />
              </svg>
            </div>

            {/* Movable puzzle piece */}
            {!isSuccess && (
              <div 
                className="absolute pointer-events-none"
                style={{
                  left: currentPieceX,
                  top: pieceY,
                  width: PUZZLE_SIZE,
                  height: PUZZLE_SIZE,
                  transition: isDragging ? 'none' : 'left 0.1s ease-out',
                }}
              >
                <svg 
                  width={PUZZLE_SIZE} 
                  height={PUZZLE_SIZE} 
                  viewBox="0 0 50 50"
                  style={{ filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.6))' }}
                >
                  <defs>
                    <linearGradient id="pieceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8ab4d4" />
                      <stop offset="40%" stopColor="#6a9fc0" />
                      <stop offset="100%" stopColor="#5088aa" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M25 47 C25 47 5 31 5 18 C5 9 11 3 20 3 C23 3 25 5 25 5 C25 5 27 3 30 3 C39 3 45 9 45 18 C45 31 25 47 25 47Z"
                    fill="url(#pieceGrad)"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.5"
                  />
                  <ellipse cx="17" cy="14" rx="6" ry="5" fill="rgba(255,255,255,0.4)" />
                  <ellipse cx="33" cy="16" rx="4" ry="3" fill="rgba(255,255,255,0.25)" />
                </svg>
              </div>
            )}

            {isSuccess && (
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.3) 40%, transparent 70%)' }} />
                <div className="relative bg-green-500 text-white text-sm py-2 text-center font-medium">
                  {completionTime}s · You beat {percentage}% of users
                </div>
              </div>
            )}

            {isFailed && (
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.3) 40%, transparent 70%)' }} />
                <div className="relative bg-red-500 text-white text-sm py-2 text-center font-medium">
                  Please try again
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4">
          <div 
            ref={sliderRef}
            className={`relative h-11 rounded-full cursor-pointer select-none overflow-hidden ${isSuccess ? 'bg-green-100' : isFailed ? 'bg-red-100' : 'bg-gray-100'}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className={`absolute left-0 top-0 h-full rounded-full transition-colors ${isSuccess ? 'bg-green-200' : isFailed ? 'bg-red-200' : 'bg-gray-200'}`}
              style={{ width: `calc(${sliderValue}% + ${SLIDER_BTN_WIDTH / 2}px)`, transition: isDragging ? 'none' : 'width 0.1s ease-out' }}
            />
            
            <div 
              className={`absolute top-1 h-9 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing ${isSuccess ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-[#f7a600] hover:bg-[#e69500]'}`}
              style={{ width: SLIDER_BTN_WIDTH, left: sliderBtnLeft, transition: isDragging ? 'none' : 'left 0.1s ease-out' }}
            >
              {isSuccess ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : isFailed ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 flex items-center gap-1">
          <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="Close">
            <X className="w-5 h-5" />
          </button>
          <button onClick={handleRefresh} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="Refresh">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PuzzleModal;