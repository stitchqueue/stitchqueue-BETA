'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ERROR_MESSAGES = [
  {
    title: "Lost in the Stash",
    subtitle: "404 – Pattern Piece Not Found",
    message: "Looks like this block wandered off into the deepest corner of the stash. Don't worry — we've all been there.",
  },
  {
    title: "Unfinished Object Alert",
    subtitle: "404 – This Page Got UFO'd",
    message: "UnFinished Object — it was almost quilted... then life happened.",
  },
  {
    title: "Seam Ripper Special",
    subtitle: "Oops! 404 Error",
    message: "This page just met the seam ripper. We had to undo it — mistakes were made.",
  },
  {
    title: "Quilt Square Mix-up",
    subtitle: "404 – Square Not in This Quilt",
    message: "We must've rotated the block the wrong way and now nothing lines up.",
  },
  {
    title: "Fabric Ran Out",
    subtitle: "404 – Out of Fabric",
    message: "We cut the last scrap for this page and now it's gone forever. Time to raid the remnant bin!",
  },
  {
    title: "The Dog Ate My Page",
    subtitle: "404 – Page Chewed by the Quilt Inspector",
    message: "You know... the one with four legs and zero respect for paper patterns. Sorry!",
  },
  {
    title: "Binding Fell Off",
    subtitle: "404 – Binding Error",
    message: "The edge came undone and the whole page unraveled. Let's get you stitched back together.",
  },
  {
    title: "Mystery Block Edition",
    subtitle: "404 – Mystery Quilt Clue Missing",
    message: "This was supposed to be revealed in Month 3... but someone lost the envelope! No spoilers here.",
  },
];

export default function NotFound() {
  // Use useEffect to select random message client-side to avoid hydration mismatch
  const [messageIndex, setMessageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMessageIndex(Math.floor(Math.random() * ERROR_MESSAGES.length));
    setMounted(true);
  }, []);

  const errorContent = ERROR_MESSAGES[messageIndex];

  // Show a simple loading state until client-side hydration completes
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#4e283a] flex items-center justify-center">
        <div className="text-[#98823a] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4e283a] to-[#3a1d2b] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Decorative quilting block pattern */}
        <div className="mb-6">
          <svg 
            className="w-24 h-24 mx-auto text-[#98823a] opacity-80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Quilting square pattern */}
            <rect x="10" y="10" width="35" height="35" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="55" y="10" width="35" height="35" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="10" y="55" width="35" height="35" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="55" y="55" width="35" height="35" stroke="currentColor" strokeWidth="2" fill="none" />
            {/* Diagonal quilting lines */}
            <line x1="10" y1="10" x2="45" y2="45" stroke="currentColor" strokeWidth="1.5" />
            <line x1="45" y1="10" x2="10" y2="45" stroke="currentColor" strokeWidth="1.5" />
            <line x1="55" y1="10" x2="90" y2="45" stroke="currentColor" strokeWidth="1.5" />
            <line x1="90" y1="10" x2="55" y2="45" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="55" x2="45" y2="90" stroke="currentColor" strokeWidth="1.5" />
            <line x1="45" y1="55" x2="10" y2="90" stroke="currentColor" strokeWidth="1.5" />
            <line x1="55" y1="55" x2="90" y2="90" stroke="currentColor" strokeWidth="1.5" />
            <line x1="90" y1="55" x2="55" y2="90" stroke="currentColor" strokeWidth="1.5" />
            {/* Question mark in center */}
            <text x="50" y="58" textAnchor="middle" fill="currentColor" fontSize="24" fontWeight="bold">?</text>
          </svg>
        </div>

        {/* Error title */}
        <h1 className="text-[#98823a] text-lg font-medium mb-2 tracking-wide uppercase">
          {errorContent.title}
        </h1>
        
        {/* 404 subtitle */}
        <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">
          {errorContent.subtitle}
        </h2>
        
        {/* Message */}
        <p className="text-gray-300 mb-8 leading-relaxed text-base sm:text-lg">
          {errorContent.message}
        </p>

        {/* Action button */}
        <Link
          href="/?from=404"
          className="inline-flex items-center justify-center px-8 py-3 bg-[#98823a] text-white font-bold rounded-xl hover:bg-[#b39a4a] transition-colors text-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Home
        </Link>

        {/* Small footer text */}
        <p className="mt-8 text-gray-500 text-sm">
          StitchQueue • Business Management for Longarm Quilters
        </p>
      </div>
    </div>
  );
}