
'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
            <div ref={modalRef} className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-gray-900/5 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-200 transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
