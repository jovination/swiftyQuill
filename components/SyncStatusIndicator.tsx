"use client"

import React from 'react';
import { ImSpinner8 } from "react-icons/im";
import { IoCloudOfflineOutline, IoCloudDoneOutline, IoWarningOutline } from "react-icons/io5";

interface SyncStatusIndicatorProps {
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  isOnline: boolean;
  isTemp?: boolean; // Indicates if it's a temporary note (created offline, not yet saved to server)
  isOfflineNote?: boolean; // Indicates if it's explicitly an offline note (from IndexedDB/localStorage)
  className?: string;
}

export default function SyncStatusIndicator({ status, isOnline, isTemp, isOfflineNote, className = "" }: SyncStatusIndicatorProps) {
  const getStatusInfo = () => {
    // If it's a temporary note or explicitly an offline note, and it's pending, treat it as a local note.
    // This ensures consistency even if it briefly gets a 'pending' status before being saved.
    if ((isTemp || isOfflineNote) && status === 'pending') {
      return {
        icon: <IoCloudOfflineOutline className="w-4 h-4 text-orange-500" />,
        tooltip: 'Local (not yet synced)',
        color: 'text-orange-500',
        text: 'Local'
      };
    }

    switch (status) {
      case 'pending':
        return {
          icon: <IoCloudOfflineOutline className="w-4 h-4 text-orange-500" />,
          tooltip: isOnline ? 'Waiting to sync' : 'Will sync when online',
          color: 'text-orange-500',
          text: isOnline ? 'Pending' : 'Offline'
        };
      case 'syncing':
        return {
          icon: <ImSpinner8 className="w-4 h-4 text-blue-500 animate-spin" />,
          tooltip: 'Syncing to cloud...',
          color: 'text-blue-500',
          text: 'Syncing'
        };
      case 'synced':
        return {
          icon: <IoCloudDoneOutline className="w-4 h-4 text-green-500" />,
          tooltip: 'Synced to cloud',
          color: 'text-green-500',
          text: 'Synced'
        };
      case 'failed':
        return {
          icon: <IoWarningOutline className="w-4 h-4 text-red-500" />,
          tooltip: 'Sync failed - will retry',
          color: 'text-red-500',
          text: 'Failed'
        };
      default:
        return {
          icon: null,
          tooltip: '',
          color: '',
          text: ''
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (!statusInfo.icon) return null;

  return (
    <div 
      className={`flex items-center gap-1 ${className}`}
      title={statusInfo.tooltip}
    >
      {statusInfo.icon}
      <span className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
    </div>
  );
}

// Network status indicator
export function NetworkStatusIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs">
      {isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-orange-600">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>Offline</span>
        </div>
      )}
    </div>
  );
}

// Offline notes counter
export function OfflineNotesCounter({ count, onManageClick }: { count: number; onManageClick?: () => void }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
        <IoCloudOfflineOutline className="w-3 h-3" />
        <span>{count} offline</span>
      </div>
      {onManageClick && (
        <button
          onClick={onManageClick}
          className="text-xs text-orange-600 hover:text-orange-700 underline"
          title="Manage offline notes"
        >
          Manage
        </button>
      )}
    </div>
  );
} 
 