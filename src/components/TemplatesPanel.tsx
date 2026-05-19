import React, { useEffect, useState } from 'react';

interface Props<T> {
  /** localStorage key for this mode's templates */
  storageKey: string;
  /** the current setup config — what gets written when SAVE fires */
  currentValue: T;
  /** called with the stored value when LOAD fires; parent applies it */
  onLoad: (value: T) => void;
  /** optional label noun in the modal copy, e.g. "Tabata workout" */
  noun?: string;
}

const loadAll = <T,>(key: string): Record<string, T> => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const persistAll = <T,>(key: string, all: Record<string, T>) => {
  try {
    localStorage.setItem(key, JSON.stringify(all));
  } catch {}
};

export function TemplatesPanel<T>({ storageKey, currentValue, onLoad, noun = 'workout' }: Props<T>) {
  const [templates, setTemplates] = useState<Record<string, T>>(() => loadAll<T>(storageKey));
  const [selected, setSelected] = useState<string>('');

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveError, setSaveError] = useState('');

  const [overwriteOpen, setOverwriteOpen] = useState(false);
  const [overwriteName, setOverwriteName] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteName, setDeleteName] = useState('');

  // re-read from storage if the key changes (paranoid; usually stable per mount)
  useEffect(() => {
    setTemplates(loadAll<T>(storageKey));
    setSelected('');
  }, [storageKey]);

  const loadSelected = () => {
    if (!selected) return;
    const tpl = templates[selected];
    if (tpl !== undefined) onLoad(tpl);
  };

  const openSave = () => {
    setSaveName(selected);
    setSaveError('');
    setSaveOpen(true);
  };
  const closeSave = () => {
    setSaveOpen(false);
    setSaveError('');
  };

  const persistSave = (name: string) => {
    const next = { ...templates, [name]: currentValue };
    setTemplates(next);
    persistAll(storageKey, next);
    setSelected(name);
    setSaveOpen(false);
    setOverwriteOpen(false);
    setSaveError('');
  };
  const confirmSave = () => {
    const name = saveName.trim();
    if (!name) {
      setSaveError('Name required.');
      return;
    }
    if (templates[name] && name !== selected) {
      setOverwriteName(name);
      setOverwriteOpen(true);
      return;
    }
    persistSave(name);
  };
  const confirmOverwrite = () => persistSave(overwriteName);
  const cancelOverwrite = () => setOverwriteOpen(false);

  const openDelete = () => {
    if (!selected) return;
    setDeleteName(selected);
    setDeleteOpen(true);
  };
  const cancelDelete = () => setDeleteOpen(false);
  const confirmDelete = () => {
    if (!deleteName) return;
    const next = { ...templates };
    delete next[deleteName];
    setTemplates(next);
    persistAll(storageKey, next);
    setSelected('');
    setDeleteOpen(false);
  };

  // Escape closes the top-most modal
  useEffect(() => {
    if (!saveOpen && !overwriteOpen && !deleteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (deleteOpen) cancelDelete();
      else if (overwriteOpen) cancelOverwrite();
      else if (saveOpen) closeSave();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [saveOpen, overwriteOpen, deleteOpen]);

  const names = Object.keys(templates).sort();

  return (
    <>
      <div className="templates">
        <select
          className="templates__select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="select template"
        >
          <option value="">— SELECT TEMPLATE —</option>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {selected && (
          <button type="button" className="btn-ghost" onClick={loadSelected}>
            LOAD
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={openSave}>
          SAVE
        </button>
        {selected && (
          <button type="button" className="btn-ghost" onClick={openDelete}>
            DELETE
          </button>
        )}
      </div>

      {saveOpen && (
        <div className="modal-backdrop" onClick={closeSave} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
          >
            <h2 id="save-modal-title" className="modal__title">
              Save {noun}
            </h2>
            <p className="modal__body">
              Give this {noun} a name. You can load it again from the templates dropdown.
            </p>
            <form
              className="modal__form"
              onSubmit={(e) => {
                e.preventDefault();
                confirmSave();
              }}
            >
              <input
                type="text"
                className="modal__input"
                autoFocus
                value={saveName}
                onChange={(e) => {
                  setSaveName(e.target.value);
                  if (saveError) setSaveError('');
                }}
                placeholder="e.g. Wednesday strength"
                maxLength={64}
                aria-label="template name"
                aria-invalid={!!saveError}
              />
              {saveError && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    letterSpacing: '0.1em',
                    color: 'var(--alert)',
                  }}
                >
                  {saveError}
                </div>
              )}
              <div className="modal__actions">
                <button type="button" className="btn-cmd" onClick={closeSave}>
                  Cancel
                </button>
                <button type="submit" className="btn-cmd" disabled={!saveName.trim()}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {overwriteOpen && (
        <div className="modal-backdrop" onClick={cancelOverwrite} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="overwrite-modal-title"
          >
            <h2 id="overwrite-modal-title" className="modal__title">
              Replace template?
            </h2>
            <p className="modal__body">
              A template named <strong style={{ color: 'var(--fg)' }}>{overwriteName}</strong>{' '}
              already exists. Replace it with the current {noun}?
            </p>
            <div className="modal__actions">
              <button type="button" className="btn-cmd" onClick={cancelOverwrite}>
                Cancel
              </button>
              <button type="button" className="btn-cmd" onClick={confirmOverwrite} autoFocus>
                Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="modal-backdrop" onClick={cancelDelete} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <h2 id="delete-modal-title" className="modal__title">
              Delete template?
            </h2>
            <p className="modal__body">
              <strong style={{ color: 'var(--fg)' }}>{deleteName}</strong> will be removed
              permanently. This can't be undone.
            </p>
            <div className="modal__actions">
              <button type="button" className="btn-cmd" onClick={cancelDelete}>
                Cancel
              </button>
              <button type="button" className="btn-cmd" onClick={confirmDelete} autoFocus>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TemplatesPanel;
