import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const QUIPS = {
  project_load: [
    "Let's get this bread 🍞",
    "Time to make magic happen",
    "Loading your empire...",
    "Booting up brilliance",
    "Here we go again..."
  ],
  task_complete: [
    "Finally.",
    "Look at you, being productive!",
    "One down, infinity to go",
    "Ship it or it ships you.",
    "That's what I'm talking about!",
    "Achievement unlocked 🎮"
  ],
  blocked: [
    "Blocked again? Love that.",
    "Ah yes, the waiting game",
    "Someone's living dangerously",
    "Houston, we have a problem"
  ],
  backlog: [
    "Backlog: where dreams nap.",
    "Adding to the pile, I see",
    "Future you will handle this"
  ],
  ceo_question: [
    "CEO has entered the chat.",
    "Escalation station 🚂",
    "Bringing in the big guns"
  ],
  general: [
    "Oh, just now doing this? Geeesh.",
    "Working hard or hardly working?",
    "Coffee break soon? ☕"
  ]
};

export function useQuip(type = 'general', enabled = true) {
  const [quip, setQuip] = useState(null);

  const showQuip = (customType) => {
    if (!enabled) return;
    const quipType = customType || type;
    const quipList = QUIPS[quipType] || QUIPS.general;
    const randomQuip = quipList[Math.floor(Math.random() * quipList.length)];
    setQuip(randomQuip);
    setTimeout(() => setQuip(null), 3000);
  };

  return { quip, showQuip };
}

export default function QuipToast({ quip }) {
  if (!quip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">{quip}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}