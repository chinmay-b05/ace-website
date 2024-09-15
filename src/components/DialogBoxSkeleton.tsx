import React, { useState } from 'react';
import './DialogBoxSkeleton.css'; // Optional external CSS for styling
import { useStore } from '@nanostores/react';
import { isDialogOpen } from '../dialogStore';
import { Toaster } from 'sonner';

interface DialogBoxProps {
  children: React.ReactNode;
}

const DialogBoxSkeleton = ({ children }: DialogBoxProps) => {
  const $isDialogOpen = useStore(isDialogOpen);
  const onClose = () => {
    isDialogOpen.set(false);
  };
  if (!$isDialogOpen) return null; // If dialog is not open, render nothing

  return (
    <>
      <div className="dialog-backdrop w-[300px]">
        <div className="dialog-box sm:w-[500px] w-[325px]">
          <button className="close-button" onClick={onClose}>
            X
          </button>
          <div className="dialog-content">{children}</div>
        </div>
      </div>
    </>
  );
};

export default DialogBoxSkeleton;
