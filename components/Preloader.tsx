'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: '#000000' }}
        >
          {/* Orbital ring */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* Spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
              className="absolute w-20 h-20 rounded-full"
              style={{
                border: '1.5px solid transparent',
                borderTopColor: '#6366F1',
                borderRightColor: 'rgba(99,102,241,0.3)',
              }}
            />

            {/* Core glow */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-white"
              style={{ boxShadow: '0 0 20px 6px rgba(99,102,241,0.8), 0 0 40px 12px rgba(99,102,241,0.3)' }}
            />
          </motion.div>

          {/* Brand text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute mt-32 text-center"
          >
            <span
              className="text-sm font-medium tracking-[0.2em] uppercase"
              style={{
                color: '#94A3B8',
                fontFamily: "'Clash Display', 'Outfit', sans-serif",
              }}
            >
              MoonFluxx
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
