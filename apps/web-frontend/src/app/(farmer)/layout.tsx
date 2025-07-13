'use client';

import React from 'react';
import Navbar from '../component/Navbar';

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
    </>
  );
}