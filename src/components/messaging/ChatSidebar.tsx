import React, { useMemo, useState } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { FOCUS_OUTLINE } from '@/styles/tokens';

interface ChatSidebarProps {
  onShareCoordinate?: (coordinate: string) => void;
  coordinate?: string;
}

const TABS = [
  { id: 'alliance', label: 'Bande' },
  { id: 'direct', label: 'Direkt' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/**
 * Ephemeral chat sidebar offering alliance and direct message channels.
 */
const ChatSidebar: React.FC<ChatSidebarProps> = ({ onShareCoordinate, coordinate }) => {
  const { rooms, activeRoomId, messages, openRoom, sendMessage } = useMessageStore();
  const [tab, setTab] = useState<TabId>('alliance');
  const [draft, setDraft] = useState('');

  const roomsForTab = useMemo(() => rooms.filter((room) => room.type === tab), [rooms, tab]);
  const activeRoom = rooms.find((room) => room.id === activeRoomId);
  const activeMessages = messages[activeRoomId] ?? [];

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    if (!activeRoom) {
      return;
    }
    sendMessage(activeRoom.id, draft);
    setDraft('');
  };

  return (
    <aside className="flex h-full flex-col gap-3 rounded-2xl border border-yellow-800/40 bg-black/45 p-4 text-sm text-gray-100">
      <nav className="flex gap-2" aria-label="Chats">
        {TABS.map((entry) => {
          const isActive = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`flex-1 rounded-md border border-yellow-800/40 px-3 py-1 text-xs font-cinzel uppercase tracking-wide ${
                isActive ? 'bg-yellow-800/30 text-yellow-200' : 'text-gray-300'
              } ${FOCUS_OUTLINE.className}`}
              aria-current={isActive}
            >
              {entry.label}
            </button>
          );
        })}
      </nav>
      <div className="flex gap-2" role="tablist">
        {roomsForTab.map((room) => {
          const isActive = room.id === activeRoomId;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => openRoom(room.id)}
              className={`flex-1 rounded-md border border-yellow-800/30 px-3 py-1 text-xs ${
                isActive ? 'bg-yellow-800/30 text-yellow-100' : 'text-gray-300'
              } ${FOCUS_OUTLINE.className}`}
              aria-pressed={isActive}
            >
              {room.title}
            </button>
          );
        })}
        {roomsForTab.length === 0 && <span className="text-xs text-gray-500">Keine Kanäle</span>}
      </div>
      <div className="flex-1 overflow-y-auto rounded-xl border border-yellow-800/30 bg-black/40 p-3" aria-live="polite">
        <ul className="space-y-2">
          {activeMessages.map((message) => (
            <li key={message.id} className="space-y-1 rounded-lg bg-black/40 p-2">
              <p className="text-xs uppercase tracking-wide text-yellow-300">{message.authorId}</p>
              <p className="text-sm text-gray-100">{message.body}</p>
              <div className="flex items-center gap-2 text-[0.65rem] text-gray-500">
                <time dateTime={new Date(message.createdAt).toISOString()}>{new Date(message.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</time>
                {onShareCoordinate && coordinate && (
                  <button
                    type="button"
                    onClick={() => onShareCoordinate(coordinate)}
                    className={`rounded border border-yellow-800/30 px-1 py-0.5 text-[0.65rem] text-yellow-100 ${FOCUS_OUTLINE.className}`}
                  >
                    Koordinate teilen
                  </button>
                )}
              </div>
            </li>
          ))}
          {activeMessages.length === 0 && <li className="text-xs text-gray-500">Noch keine Nachrichten.</li>}
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-yellow-300" htmlFor="chat-draft">
          Nachricht
        </label>
        <textarea
          id="chat-draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          className={`w-full rounded-md border border-yellow-800/40 bg-black/40 px-3 py-2 text-sm text-yellow-100 placeholder:text-gray-500 ${FOCUS_OUTLINE.className}`}
          placeholder="Kurz koordinieren …"
        />
        <button
          type="submit"
          className={`w-full rounded-md border border-yellow-800/40 bg-yellow-800/30 px-3 py-2 text-sm text-yellow-100 ${FOCUS_OUTLINE.className}`}
        >
          Senden
        </button>
      </form>
    </aside>
  );
};

export default ChatSidebar;
