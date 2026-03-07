import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Grid,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { getTrade, updateTrade, deleteTrade } from '../../../services/api';

export default function TradeDetailDrawer({ tradeId, onClose, onSaved }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ result: 'open', pnl: 0, notes: '' });

  useEffect(() => {
    if (!tradeId) { setData(null); setEditing(false); return; }
    setLoading(true);
    getTrade(tradeId)
      .then((d) => {
        setData(d);
        const t = d?.trade;
        if (t) setEditForm({ result: t.result || 'open', pnl: t.pnl ?? 0, notes: t.notes || '' });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [tradeId]);

  const handleDelete = () => {
    if (!tradeId || !window.confirm('Delete this trade?')) return;
    setError('');
    deleteTrade(tradeId)
      .then(() => { onSaved && onSaved(); onClose(); })
      .catch((e) => setError(e.response?.data?.error || e.message || 'Delete failed'));
  };

  const handleSaveEdit = () => {
    if (!tradeId || !data?.trade) return;
    setError('');
    setSaving(true);
    const t = data.trade;
    const rMultiple = (editForm.pnl && t.risk_amount) ? Number(editForm.pnl) / Number(t.risk_amount) : 0;
    updateTrade(tradeId, {
      pair: t.pair,
      asset_id: t.asset_id,
      asset_class: t.asset_class,
      direction: t.direction,
      session: t.session,
      account_balance: t.account_balance,
      risk_percent: t.risk_percent,
      risk_amount: t.risk_amount,
      entry_price: t.entry_price,
      stop_loss: t.stop_loss,
      take_profit: t.take_profit,
      stop_loss_pips: t.stop_loss_pips,
      take_profit_pips: t.take_profit_pips,
      rr: t.rr,
      position_size: t.position_size,
      potential_profit: t.potential_profit,
      potential_loss: t.potential_loss,
      result: editForm.result,
      pnl: Number(editForm.pnl) || 0,
      r_multiple: rMultiple,
      checklist_score: t.checklist_score,
      checklist_total: t.checklist_total,
      checklist_percent: t.checklist_percent,
      trade_grade: t.trade_grade,
      notes: editForm.notes || null,
    })
      .then(() => { onSaved && onSaved(); setEditing(false); setData((prev) => (prev ? { ...prev, trade: { ...prev.trade, ...editForm, pnl: Number(editForm.pnl) || 0, r_multiple: rMultiple } } : null)); })
      .catch((e) => setError(e.response?.data?.error || e.message || 'Update failed'))
      .finally(() => setSaving(false));
  };

  const trade = data?.trade;
  const checklist = data?.checklist_items || [];

  return (
    <Drawer anchor="right" open={!!tradeId} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, bgcolor: '#1a1a2e' } }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#a78bfa' }}>Trade detail</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        {loading && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={20} /> Loading...</Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {trade && !loading && (
          <>
            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Result</InputLabel>
                  <Select value={editForm.result} label="Result" onChange={(e) => setEditForm((f) => ({ ...f, result: e.target.value }))}>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="win">Win</MenuItem>
                    <MenuItem value="loss">Loss</MenuItem>
                    <MenuItem value="breakeven">Breakeven</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth size="small" label="PnL" type="number" value={editForm.pnl} onChange={(e) => setEditForm((f) => ({ ...f, pnl: e.target.value }))} />
                <TextField fullWidth size="small" label="Notes" multiline rows={3} value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} disabled={saving} onClick={handleSaveEdit} sx={{ bgcolor: '#8B5CF6' }}>Save</Button>
                  <Button size="small" variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
                </Box>
              </Box>
            ) : (
              <>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">Pair</Typography><Typography>{trade.pair}</Typography></Grid>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">Direction</Typography><Typography>{trade.direction}</Typography></Grid>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">Session</Typography><Typography>{trade.session || '-'}</Typography></Grid>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">Result</Typography><Typography>{trade.result}</Typography></Grid>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">Entry</Typography><Typography>{Number(trade.entry_price).toFixed(5)}</Typography></Grid>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">Stop / TP</Typography><Typography>{Number(trade.stop_loss).toFixed(5)} / {Number(trade.take_profit).toFixed(5)}</Typography></Grid>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">PnL</Typography><Typography sx={{ color: (trade.pnl || 0) >= 0 ? '#22c55e' : '#f87171' }}>${Number(trade.pnl || 0).toFixed(2)}</Typography></Grid>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">R multiple</Typography><Typography>{Number(trade.r_multiple || 0).toFixed(2)}</Typography></Grid>
                  <Grid item xs={6}><Typography color="text.secondary" variant="caption">Grade</Typography><Typography>{trade.trade_grade || '-'}</Typography></Grid>
                  <Grid item xs={12}><Typography color="text.secondary" variant="caption">Notes</Typography><Typography>{trade.notes || '-'}</Typography></Grid>
                </Grid>
                {checklist.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#a78bfa', mb: 1 }}>Checklist</Typography>
                    {checklist.map((c) => (
                      <Typography key={c.id} variant="body2">{c.checklist_item_label}: {c.passed ? 'Yes' : 'No'}</Typography>
                    ))}
                  </Box>
                )}
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)}>Edit</Button>
                  <Button size="small" color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={handleDelete}>Delete</Button>
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
}
