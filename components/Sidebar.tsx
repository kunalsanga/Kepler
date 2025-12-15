'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X, MessageSquare, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    onNewChat: () => void
}

export function Sidebar({ isOpen, onClose, onNewChat }: SidebarProps) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed md:static inset-y-0 left-0 z-50 md:z-auto",
                "w-[260px] bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col border-r border-zinc-200 dark:border-white/10",
                "transform transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                "h-screen"
            )}>
                {/* New Chat Button */}
                <div className="p-3 mb-2">
                    <div className="flex items-center justify-between gap-2 md:hidden mb-2">
                        <span className="font-semibold px-2">Menu</span>
                        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-zinc-200 dark:hover:bg-white/10">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <Button
                        onClick={() => {
                            onNewChat()
                            if (window.innerWidth < 768) onClose()
                        }}
                        className="w-full justify-start gap-3 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-sm h-10 px-3 rounded-lg transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">New chat</span>
                    </Button>
                </div>

                {/* Conversation History List */}
                <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-hide">
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-500">
                        Recent
                    </div>
                    {/* Placeholder for history items */}
                    <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-white/5 rounded-lg transition-colors text-left group">
                        <MessageSquare className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300" />
                        <span className="truncate">Previous conversation...</span>
                    </button>
                </div>

                {/* User Profile / Settings */}
                <div className="p-3 border-t border-zinc-200 dark:border-white/10 mt-auto">
                    <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-white/5 rounded-lg transition-colors text-left">
                        <div className="h-8 w-8 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <User className="h-4 w-4 text-zinc-500" />
                        </div>
                        <div className="font-medium">User</div>
                    </button>
                </div>
            </aside>
        </>
    )
}
