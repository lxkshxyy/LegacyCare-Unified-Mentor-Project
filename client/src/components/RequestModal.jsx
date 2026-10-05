import { useState } from 'react';
import api, { errMsg } from '../api/client';
import { Modal, Textarea, Input, Spinner, useToast } from './ui';

export default function RequestModal({ open, onClose, planId, item, onSent }) {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [busy, setBusy] = useState(false);
  if (!item) return null;
  const send = async () => {
    setBusy(true);
    try {
      await api.post('/requests', { planId, serviceId: item.service._id, message, preferredDate: preferredDate || undefined });
      toast('Request sent to the provider');
      setMessage('');
      onSent && onSent();
      onClose();
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Request: ${item.service?.title}`}
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={send} disabled={busy}>{busy && <Spinner className="h-4 w-4 text-white" />} Send request</button></>}
    >
      <div className="space-y-4">
        <p className="text-sm text-ink-soft">The provider will be notified and can accept or decline. You can follow the status under Service requests.</p>
        <Textarea label="Message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share any details the provider should know" />
        <Input label="Preferred date (optional)" type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
      </div>
    </Modal>
  );
}
