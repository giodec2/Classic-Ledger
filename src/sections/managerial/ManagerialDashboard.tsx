import { useState } from 'react';
import { BookOpen, FileText, Plus } from 'lucide-react';
import { useNavigation } from '@/hooks/NavigationContext';
import { useManagerialContext } from '@/hooks/ManagerialContext';
import { createManagerialExampleInput, managerialExamples } from '@/lib/managerialExamples';
import type { ManagerialExampleSource } from '@/types/managerial';
import { ManagerialSaveNotice } from './ManagerialSaveNotice';
import { ManagerialSelect } from './ManagerialSelect';
import './ManagerialPractice.css';

export function ManagerialDashboard() {
  const { navigate } = useNavigation();
  const { workbooks, createWorkbook, renameWorkbook, deleteWorkbook, loading } = useManagerialContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<'blank' | ManagerialExampleSource>('blank');
  const [editing, setEditing] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  function create() {
    setError('');
    try {
      const input = source === 'blank' ? {} : createManagerialExampleInput(source);
      const id = createWorkbook(name.trim() || (source === 'blank' ? 'Untitled cash-flow workbook' : `${managerialExamples[source].name} — practice`), { ...input, ...(description.trim() ? { description: description.trim() } : {}) });
      navigate(source === 'auto-supply' ? 'cashflow-indirect' : 'cashflow-direct', { workbookId: id });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not create workbook. Please try again.'); }
  }
  function rename(id: string) {
    if (!editedName.trim()) { setError('Enter a workbook title before saving.'); return; }
    try { renameWorkbook(id, editedName); setEditing(null); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not rename workbook.'); }
  }
  async function remove(id: string) {
    setBusy(true); setError('');
    try {
      const result = await deleteWorkbook(id);
      setMessage(result.pending ? result.error || 'Removed from this device; cloud deletion is pending. Use Retry to finish.' : 'Workbook deleted.');
      setDeleting(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Deletion failed. Try again.'); }
    finally { setBusy(false); }
  }
  return <section className="managerial-practice mp-dashboard">
    <header className="mp-page-header"><p className="mp-eyebrow">Managerial accounting · Chapter 13</p><h1>Cash-flow studio</h1><p>Learn the signs. Build the statement. Make cash reconcile.</p></header>
    <div className="mp-learning-links">
      <button type="button" className="mp-learning-card" onClick={() => navigate('cashflow-learning')}><BookOpen aria-hidden="true" size={22} /><span><strong>Learn both methods</strong><small>Visual sign grids, formulas & worked examples</small></span><span aria-hidden="true">→</span></button>
      <button type="button" className="mp-learning-card" onClick={() => navigate('cashflow-cheat-sheet')}><FileText aria-hidden="true" size={22} /><span><strong>Exam cheatsheet</strong><small>Two printable pages of formulas & exam traps</small></span><span aria-hidden="true">→</span></button>
    </div>
    <section className="mp-panel"><div className="mp-section-heading"><h2>Start a practice workbook</h2><span className="mp-chip">Separate from Financial</span></div>
      <div className="mp-create-fields">
        <label>Workbook title<input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Chapter 13 revision" /></label>
        <ManagerialSelect label="Practice source" value={source} onChange={setSource} options={[{ value: 'blank', label: 'Blank — your own assignment' }, { value: 'allison', label: 'Allison — direct + indirect ($000)' }, { value: 'auto-supply', label: 'Auto Supply — indirect only ($000)' }]} />
        <label className="mp-wide">Description (optional)<input value={description} onChange={event => setDescription(event.target.value)} placeholder="Add your assignment or revision goal" /></label>
      </div>
      <p className="mp-help">{source === 'blank' ? 'You choose every line title, section and direction. No automatic classification.' : `${managerialExamples[source].citation}. Given cash balances and net income are supplied; row amounts start blank. Source data and optional solutions stay separate from your work.`}</p>
      <button type="button" className="mp-primary" onClick={create}><Plus aria-hidden="true" size={18} />Create practice workbook</button>
    </section>
    <ManagerialSaveNotice />
    {error && <p className="mp-alert" role="alert">{error}</p>}{message && <p className="mp-notice" role="status">{message}</p>}
    <section className="mp-panel"><div className="mp-section-heading"><h2>Your managerial workbooks</h2><span className="mp-chip">{workbooks.length} workbook{workbooks.length === 1 ? '' : 's'}</span></div>
      {loading && <p className="mp-help">Loading cloud workbooks… Local practice remains available.</p>}
      {!workbooks.length && <p className="mp-empty">No managerial workbooks yet. Start blank or practice from the professor’s source data above.</p>}
      <div className="mp-workbook-list">{workbooks.map(workbook => <article className="mp-workbook-card" key={workbook.id}>
        {editing === workbook.id ? <div className="mp-rename"><label>New title for {workbook.name}<input value={editedName} onChange={event => setEditedName(event.target.value)} autoFocus /></label><div className="mp-actions"><button type="button" onClick={() => rename(workbook.id)}>Save title</button><button type="button" onClick={() => setEditing(null)}>Cancel rename</button></div></div> : <h3>{workbook.name}</h3>}
        {workbook.description && <p>{workbook.description}</p>}
        <small>{workbook.sourceExample ? `${managerialExamples[workbook.sourceExample].name} · $000 · ${workbook.exampleMode === 'reveal' ? 'Solved copy' : 'Practice'}` : 'Custom assignment · enter one consistent currency unit'}</small>
        <ManagerialSaveNotice workbookId={workbook.id} />
        <div className="mp-actions"><button type="button" className="mp-primary" onClick={() => navigate(workbook.sourceExample === 'auto-supply' ? 'cashflow-indirect' : 'cashflow-direct', { workbookId: workbook.id })}>Open workbook</button><button type="button" aria-label={`Rename ${workbook.name}`} onClick={() => { setEditedName(workbook.name); setEditing(workbook.id); }}>Rename</button><button type="button" className="mp-danger" aria-label={`Delete ${workbook.name}`} onClick={() => setDeleting(workbook.id)}>Delete</button></div>
        {deleting === workbook.id && <div className="mp-confirm" role="group" aria-label={`Confirm deletion of ${workbook.name}`}><p>Delete “{workbook.name}”? This removes both methods and cannot be undone. Cloud deletion may wait for a connection.</p><div className="mp-actions"><button type="button" className="mp-danger" disabled={busy} onClick={() => void remove(workbook.id)}>{busy ? 'Deleting…' : 'Confirm delete'}</button><button type="button" disabled={busy} onClick={() => setDeleting(null)}>Keep workbook</button></div></div>}
      </article>)}</div>
    </section>
  </section>;
}
