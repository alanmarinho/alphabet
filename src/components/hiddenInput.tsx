import React, { useRef, useEffect } from 'react';

interface HiddenInputProps {
  onKeyTyped: (key: string) => void;
  active: boolean;
  onBlur: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export default function HiddenInput({ onKeyTyped, active, onBlur, inputRef }: HiddenInputProps) {
  useEffect(() => {
    if (active && inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [active]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!active) return;
    const key = e.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
      onKeyTyped(key);
      e.preventDefault();
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      maxLength={1}
      tabIndex={-1}
      inputMode="none"
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      onBlur={onBlur}
      spellCheck={false}
      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
      onKeyDown={handleKeyDown}
    />
  );
}
