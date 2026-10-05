import { useState } from 'react';
import { useManagerialContext } from '@/hooks/ManagerialContext';

export function ManagerialSaveNotice({ workbookId }: { workbookId?: string }) {
  const { cloudAvailable, storageWarning, loadError, loading, saveStatuses, saveErrors, pendingDeletions, retry } = useManagerialContext();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');
  const status = workbookId ? saveStatuses[workbookId] : undefined;
  const detail = workbookId ? saveErrors[workbookId] : undefined;
  const label = storageWarning && !cloudAvailable ? 'Changes in this session — local recovery is not confirmed'
    : status === 'error' ? 'Save failed — changes retained in this session'
    : status === 'pending-deletion' ? 'Deletion pending cloud confirmation'
    : status === 'saving' ? 'Saving to cloud…'
    : status === 'pending' ? (cloudAvailable ? 'Changes pending cloud save' : 'Cloud save pending — this device only')
    : cloudAvailable && status === 'saved' ? 'Cloud saved'
    : loading ? 'Checking cloud storage…' : cloudAvailable ? 'Cloud connected' : 'Local copy — cloud not confirmed';
  async function handleRetry() {
    setRetrying(true);
    setError('');
    try { await retry(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Retry failed. Keep this page open and try again.'); }
    finally { setRetrying(false); }
  }
  return <div className="mp-save" aria-live="polite">
    <span>{label}</span>
    {(detail || storageWarning || loadError || !cloudAvailable || pendingDeletions.length > 0 || status === 'error') && <button type="button" onClick={() => void handleRetry()} disabled={retrying || loading}>{retrying ? 'Retrying…' : 'Retry cloud sync'}</button>}
    {detail && <p role="alert">{detail}</p>}
    {storageWarning && <p role="alert">{storageWarning}</p>}
    {loadError && loadError.kind !== 'missing-table' && <p role="alert">{loadError.message}</p>}
    {pendingDeletions.length > 0 && <p>{pendingDeletions.length} deletion(s) pending cloud confirmation. Deleted workbooks stay hidden on this device.</p>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
