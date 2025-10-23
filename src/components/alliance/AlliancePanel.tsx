import React, { useMemo, useState } from 'react';
import { useAllianceStore } from '@/store/allianceStore';
import { useDirectoryStore } from '@/store/directoryStore';
import { FOCUS_OUTLINE, CARD_MIN_HEIGHT } from '@/styles/tokens';

/**
 * Top-level alliance panel showing the current band or onboarding actions.
 */
const AlliancePanel: React.FC = () => {
  const { alliances, myAllianceId, invites, createAlliance, joinAlliance, leaveAlliance, setAllianceColor, addNote, addPact } =
    useAllianceStore();
  const players = useDirectoryStore((state) => state.players);
  const openProfile = useDirectoryStore((state) => state.openPlayerProfile);
  const [tag, setTag] = useState('NEU');
  const [name, setName] = useState('Neue Bande');
  const [color, setColor] = useState('#facc15');
  const [inviteCode, setInviteCode] = useState('');
  const [note, setNote] = useState('');
  const [pactTarget, setPactTarget] = useState('');
  const [pactType, setPactType] = useState<'nap' | 'ally'>('ally');

  const myAlliance = useMemo(() => alliances.find((alliance) => alliance.id === myAllianceId), [alliances, myAllianceId]);
  const inviteForAlliance = useMemo(
    () =>
      myAllianceId
        ? Object.entries(invites).find(([, allianceId]) => allianceId === myAllianceId)?.[0] ?? `${myAlliance?.tag ?? 'ALLY'}-JOIN`
        : undefined,
    [invites, myAllianceId, myAlliance?.tag],
  );

  const memberEntries = useMemo(() => {
    if (!myAlliance) {
      return [];
    }
    return myAlliance.members.map((memberId, index) => {
      const player = players.find((entry) => entry.id === memberId);
      return {
        id: memberId,
        name: player?.name ?? memberId,
        role: index === 0 ? 'Leader' : 'Mitglied',
        color: player?.color ?? '#facc15',
      };
    });
  }, [myAlliance, players]);

  return (
    <section className="space-y-6">
      {myAlliance ? (
        <>
          <header className="space-y-1">
            <h2 className="text-[clamp(1.8rem,1vw+1.4rem,2.3rem)] font-cinzel text-yellow-200">Bandenkommando</h2>
            <p className="text-sm text-gray-300">Koordiniere Mitglieder, Pakte und Einsatznotizen.</p>
          </header>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <article className="space-y-4 rounded-2xl border border-yellow-800/40 bg-black/45 p-5" style={{ minHeight: CARD_MIN_HEIGHT.lg }}>
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-300">{myAlliance.tag}</p>
                  <h3 className="text-[clamp(1.4rem,1vw+1.1rem,1.9rem)] font-cinzel" style={{ color: myAlliance.color }}>
                    {myAlliance.name}
                  </h3>
                  <p className="text-xs text-gray-400">{memberEntries.length} Mitglieder</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <label className="flex items-center gap-2 text-gray-300">
                    Farbe
                    <input
                      type="color"
                      value={myAlliance.color}
                      onChange={(event) => setAllianceColor(event.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border border-yellow-800/30 bg-black/30"
                      aria-label="Bandenfarbe einstellen"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={leaveAlliance}
                    className={`rounded-md border border-red-800/40 bg-red-900/30 px-3 py-1 text-xs text-red-200 ${FOCUS_OUTLINE.className}`}
                  >
                    Bande verlassen
                  </button>
                </div>
              </header>
              <section className="rounded-xl border border-yellow-800/30 bg-black/50 p-4">
                <h4 className="text-xs font-cinzel uppercase tracking-wider text-yellow-200">Einladungslink</h4>
                <p className="mt-1 text-sm text-gray-300">{inviteForAlliance}</p>
              </section>
              <section className="space-y-2">
                <h4 className="text-xs font-cinzel uppercase tracking-wider text-yellow-200">Mitglieder</h4>
                <ul className="space-y-2">
                  {memberEntries.map((member) => (
                    <li key={member.id} className="flex items-center justify-between rounded-lg border border-yellow-800/30 bg-black/40 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-yellow-800/40" style={{ color: member.color }} aria-hidden>
                          {member.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-cinzel text-yellow-100">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openProfile(member.id)}
                        className={`rounded-md border border-yellow-800/40 px-2 py-1 text-xs text-yellow-100 ${FOCUS_OUTLINE.className}`}
                      >
                        Profil
                      </button>
                    </li>
                  ))}
                  {memberEntries.length === 0 && <li className="text-xs text-gray-500">Keine Mitglieder registriert.</li>}
                </ul>
              </section>
            </article>
            <article className="space-y-4 rounded-2xl border border-yellow-800/40 bg-black/45 p-5" style={{ minHeight: CARD_MIN_HEIGHT.md }}>
              <section>
                <h4 className="text-xs font-cinzel uppercase tracking-wider text-yellow-200">Pakte</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-200">
                  {myAlliance.pacts.map((pact) => (
                    <li key={pact.id} className="flex items-center justify-between rounded-md border border-yellow-800/30 bg-black/40 px-3 py-2">
                      <span>{pact.type === 'ally' ? 'Allianz' : 'NAP'} · {pact.targetAllianceId}</span>
                    </li>
                  ))}
                  {myAlliance.pacts.length === 0 && <li className="text-xs text-gray-500">Keine Pakte vorhanden.</li>}
                </ul>
                <form
                  className="mt-3 flex flex-wrap items-center gap-2 text-xs"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!pactTarget) {
                      return;
                    }
                    addPact(pactType, pactTarget);
                    setPactTarget('');
                  }}
                >
                  <select
                    value={pactType}
                    onChange={(event) => setPactType(event.target.value as 'nap' | 'ally')}
                    className={`rounded-md border border-yellow-800/40 bg-black/40 px-2 py-1 ${FOCUS_OUTLINE.className}`}
                  >
                    <option value="ally">Allianz</option>
                    <option value="nap">Nichtangriff</option>
                  </select>
                  <input
                    type="text"
                    value={pactTarget}
                    onChange={(event) => setPactTarget(event.target.value)}
                    placeholder="Ziel-Allianz-ID"
                    className={`min-w-[140px] flex-1 rounded-md border border-yellow-800/40 bg-black/40 px-2 py-1 text-xs text-yellow-100 placeholder:text-gray-500 ${FOCUS_OUTLINE.className}`}
                  />
                  <button
                    type="submit"
                    className={`rounded-md border border-yellow-800/40 px-3 py-1 text-xs text-yellow-100 ${FOCUS_OUTLINE.className}`}
                  >
                    Hinzufügen
                  </button>
                </form>
              </section>
              <section>
                <h4 className="text-xs font-cinzel uppercase tracking-wider text-yellow-200">Notizbuch</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-200">
                  {myAlliance.notes.map((entry, index) => (
                    <li key={`${entry}-${index}`}>{entry}</li>
                  ))}
                  {myAlliance.notes.length === 0 && <li className="text-xs text-gray-500">Noch keine Notizen.</li>}
                </ul>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!note.trim()) {
                      return;
                    }
                    addNote(note.trim());
                    setNote('');
                  }}
                >
                  <input
                    type="text"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Neue Notiz"
                    className={`flex-1 rounded-md border border-yellow-800/40 bg-black/40 px-3 py-2 text-sm text-yellow-100 placeholder:text-gray-500 ${FOCUS_OUTLINE.className}`}
                  />
                  <button
                    type="submit"
                    className={`rounded-md border border-yellow-800/40 px-3 py-2 text-sm text-yellow-100 ${FOCUS_OUTLINE.className}`}
                  >
                    Speichern
                  </button>
                </form>
              </section>
            </article>
          </div>
        </>
      ) : (
        <article className="space-y-6 rounded-2xl border border-yellow-800/40 bg-black/45 p-6" style={{ minHeight: CARD_MIN_HEIGHT.lg }}>
          <header>
            <h2 className="text-[clamp(1.8rem,1vw+1.4rem,2.3rem)] font-cinzel text-yellow-200">Keine Bande aktiv</h2>
            <p className="text-sm text-gray-300">Trete mit einem Einladungscode bei oder gründe eine neue Bande.</p>
          </header>
          <form
            className="flex flex-wrap items-end gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              joinAlliance(inviteCode.trim());
              setInviteCode('');
            }}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide text-yellow-300" htmlFor="invite-code">
                Einladungscode
              </label>
              <input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="TAG-JOIN"
                className={`min-w-[200px] rounded-md border border-yellow-800/40 bg-black/40 px-3 py-2 text-sm text-yellow-100 placeholder:text-gray-500 ${FOCUS_OUTLINE.className}`}
              />
            </div>
            <button
              type="submit"
              className={`rounded-md border border-yellow-800/40 bg-yellow-800/20 px-4 py-2 text-sm text-yellow-100 ${FOCUS_OUTLINE.className}`}
            >
              Beitreten
            </button>
          </form>
          <form
            className="grid gap-3 rounded-xl border border-yellow-800/30 bg-black/40 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              createAlliance({ tag: tag.trim().toUpperCase(), name: name.trim(), color });
            }}
          >
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-yellow-300" htmlFor="alliance-tag">
                Tag
                <input
                  id="alliance-tag"
                  type="text"
                  value={tag}
                  maxLength={3}
                  onChange={(event) => setTag(event.target.value)}
                  className={`w-24 rounded-md border border-yellow-800/40 bg-black/40 px-3 py-2 text-sm text-yellow-100 placeholder:text-gray-500 ${FOCUS_OUTLINE.className}`}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-yellow-300" htmlFor="alliance-name">
                Name
                <input
                  id="alliance-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={`min-w-[220px] flex-1 rounded-md border border-yellow-800/40 bg-black/40 px-3 py-2 text-sm text-yellow-100 placeholder:text-gray-500 ${FOCUS_OUTLINE.className}`}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-yellow-300">
                Farbe
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-12 w-16 cursor-pointer rounded border border-yellow-800/30 bg-black/30"
                />
              </label>
            </div>
            <button
              type="submit"
              className={`justify-self-start rounded-md border border-yellow-800/40 bg-emerald-900/30 px-4 py-2 text-sm text-emerald-200 ${FOCUS_OUTLINE.className}`}
            >
              Bande gründen
            </button>
          </form>
        </article>
      )}
    </section>
  );
};

export default AlliancePanel;
