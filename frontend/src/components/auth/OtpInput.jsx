import { useRef } from 'react';

export default function OtpInput({ value, onChange, length = 6 }) {
  const inputRefs = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  function handleChange(index, rawValue) {
    const digit = rawValue.replace(/[^0-9]/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join(''));
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (pasted) {
      e.preventDefault();
      onChange(pasted.padEnd(length, '').slice(0, length).trimEnd());
    }
  }

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="input-field h-12 w-12 text-center text-lg font-mono"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
