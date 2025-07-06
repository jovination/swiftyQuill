# Offline Notes Management

This document explains the offline notes management features that provide users with clear indication and control over their offline notes.

## Overview

When notes are created offline or fail to sync, they are stored locally on the user's device. The app now provides multiple ways for users to discover, manage, and control these offline notes.

## Features Implemented

### 1. Offline Notes Counter
- **Location**: Top-right corner of the notes list
- **Display**: Shows count of offline notes (e.g., "3 offline")
- **Action**: "Manage" button appears when offline notes exist
- **Function**: Opens the Offline Notes Manager

### 2. Offline Notes Notification Banner
- **Location**: Top-center of the screen
- **Trigger**: Appears when offline notes are detected
- **Content**: 
  - Clear explanation of what offline notes are
  - Count of available offline notes
  - "Manage Notes" button
  - "Sync Now" button (when online)
- **Dismissible**: Users can close the notification

### 3. Offline Notes Manager Modal
- **Access**: Via notification banner, counter button, or keyboard shortcut
- **Features**:
  - List of all offline notes with details
  - Individual sync/delete actions for each note
  - Bulk sync all notes
  - Bulk delete all notes
  - Status indicators for each note
  - Educational information about offline notes

### 4. Keyboard Shortcuts
- **Ctrl/Cmd + Shift + O**: Open Offline Notes Manager
- **Ctrl/Cmd + K**: Search (placeholder for future)
- **Ctrl/Cmd + N**: New note (placeholder for future)

## User Experience Flow

### Scenario 1: User Creates Notes Offline
1. User creates notes while offline
2. Notes appear in the UI with offline indicators
3. Offline counter shows "X offline" with "Manage" button
4. Notification banner appears explaining the situation
5. User can click "Manage" to see all offline notes
6. User can sync individual notes or all at once
7. User can delete notes they don't want to keep

### Scenario 2: User Returns Online
1. App automatically attempts to sync offline notes
2. Successfully synced notes are removed from local storage
3. Failed syncs remain in offline storage
4. User can manually retry failed syncs via the manager

### Scenario 3: User Wants to Clean Up
1. User opens Offline Notes Manager
2. Reviews all offline notes
3. Can delete individual notes or all at once
4. Clear confirmation dialogs prevent accidental deletion

## Components

### OfflineNotesCounter
- Displays count of offline notes
- Shows "Manage" button when notes exist
- Integrates with existing sync status indicators

### OfflineNotesNotification
- Appears when offline notes are detected
- Provides clear explanation and actions
- Dismissible by user
- Shows different options based on online status

### OfflineNotesManager
- Modal interface for managing offline notes
- Lists all notes with sync status
- Individual and bulk actions
- Educational content about offline notes
- Real-time updates as notes are synced/deleted

### KeyboardShortcuts
- Global keyboard shortcuts
- Respects input fields (doesn't trigger when typing)
- Extensible for future shortcuts

## Technical Implementation

### State Management
- Uses React state to track offline notes
- Real-time updates via event listeners
- Optimistic UI updates for better UX

### Storage Integration
- Reads from both IndexedDB and localStorage
- Deduplicates notes across storage types
- Handles storage errors gracefully

### Sync Coordination
- Integrates with existing sync service
- Prevents conflicts during sync operations
- Provides feedback on sync success/failure

## Benefits

1. **Transparency**: Users always know what notes are offline
2. **Control**: Users can choose what to sync or delete
3. **Education**: Clear explanation of what offline notes are
4. **Safety**: Confirmation dialogs prevent accidental deletion
5. **Accessibility**: Multiple ways to access the manager
6. **Performance**: No unnecessary server requests for unsynced notes

## Usage Examples

### Opening the Manager
```typescript
// Via notification banner
<OfflineNotesNotification onManageClick={handleOpenManager} />

// Via counter button
<OfflineNotesCounter count={offlineCount} onManageClick={handleOpenManager} />

// Via keyboard shortcut
<KeyboardShortcuts onOpenOfflineManager={handleOpenManager} />
```

### Managing Notes
```typescript
// Sync individual note
await syncNote(note);

// Delete individual note
await deleteNote(note);

// Sync all notes
await syncAllNotes();

// Delete all notes
await deleteAllNotes();
```

## Future Enhancements

1. **Search within offline notes**: Filter and search offline notes
2. **Batch operations**: Select multiple notes for bulk actions
3. **Sync scheduling**: Schedule sync attempts at specific times
4. **Conflict resolution**: Handle conflicts when syncing
5. **Export options**: Export offline notes to different formats

## Testing

To test the offline notes management:

1. **Go offline** and create several notes
2. **Verify** the counter and notification appear
3. **Open manager** via different methods
4. **Test sync** individual and bulk operations
5. **Test delete** individual and bulk operations
6. **Go online** and verify automatic sync works
7. **Test keyboard shortcuts** in different contexts 