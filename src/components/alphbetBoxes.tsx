import React from 'react';

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

interface AlphabetBoxesProps {
  inputs: { key: string; time: number }[];
}

export default function AlphabetBoxes({ inputs }: AlphabetBoxesProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 justify-center">
      {alphabet.map((letter, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-16 lg:h-16 border rounded flex items-center justify-center text-xs sm:text-sm md:text-base lg:text-xl bg-white text-black">
            {inputs[index]?.key || ''}
          </div>
          <span className="mt-1 text-[10px] sm:text-sm text-gray-600 uppercase">{letter}</span>
        </div>
      ))}
    </div>
  );
}
