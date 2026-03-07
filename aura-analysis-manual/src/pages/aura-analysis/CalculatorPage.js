import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import { getAssets } from '../../services/api';
import { createTrade } from '../../services/api';
import * as calc from '../../utils/auraAnalysisCalculations';

const SESSIONS = ['Asian', 'London', 'New York', 'London/NY Overlap'];
const ASSET_CLASSES = ['forex', 'metals', 'indices', 'crypto', 'commodities'];

export default function CalculatorPage() {
  const [assets, setAssets] = useState([]);
  const [pair, setPair] = useState('EURUSD');
  const [assetClass, setAssetClass] = useState('forex');
  const [direction, setDirection] = useState('buy');
  const [balance, setBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entry, setEntry] = useState(1.085);
  const [stopLoss, setStopLoss] = useState(1.083);
  const [takeProfit, setTakeProfit] = useState(1.09);
  const [session, setSession] = useState('London');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    getAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  const outputs = useMemo(() => {
    const riskAmount = calc.calcRiskAmount(balance, riskPercent);
    const slPips = calc.calcStopLossDistance(entry, stopLoss, pair, assets);
    const tpPips = calc.calcTakeProfitDistance(entry, takeProfit, pair, assets);
    const rr = calc.calcRR(entry, stopLoss, takeProfit);
    const positionSize = calc.calcPositionSize({ balance, riskPercent, entry, stop: stopLoss, symbol: pair, assets });
    const potentialProfit = calc.calcPotentialProfit(entry, takeProfit, positionSize, pair, assets);
    const potentialLoss = calc.calcPotentialLoss(entry, stopLoss, positionSize, pair, assets);
    const checklistTotal = 7;
    const checklistScore = 7;
    const checklistPercent = calc.calcChecklistPercent(checklistScore, checklistTotal);
    const tradeGrade = calc.calcTradeGrade(checklistPercent);
    return {
      riskAmount,
      stopLossPips: slPips,
      takeProfitPips: tpPips,
      rr,
      positionSize,
      potentialProfit,
      potentialLoss,
      checklistPercent,
      tradeGrade,
    };
  }, [balance, riskPercent, entry, stopLoss, takeProfit, pair, assets]);

  const handleSave = () => {
    setMessage({ type: '', text: '' });
    createTrade({
      pair,
      asset_class: assetClass,
      direction,
      session,
      account_balance: balance,
      risk_percent: riskPercent,
      risk_amount: outputs.riskAmount,
      entry_price: entry,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      stop_loss_pips: outputs.stopLossPips,
      take_profit_pips: outputs.takeProfitPips,
      rr: outputs.rr,
      position_size: outputs.positionSize,
      potential_profit: outputs.potentialProfit,
      potential_loss: outputs.potentialLoss,
      result: 'open',
      pnl: 0,
      r_multiple: 0,
      checklist_score: 7,
      checklist_total: 7,
      checklist_percent: outputs.checklistPercent,
      trade_grade: outputs.tradeGrade,
      notes: notes || null,
    })
      .then(() => setMessage({ type: 'success', text: 'Trade saved.' }))
      .catch((e) => setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to save' }));
  };

  const handleReset = () => {
    setPair('EURUSD');
    setAssetClass('forex');
    setDirection('buy');
    setBalance(10000);
    setRiskPercent(1);
    setEntry(1.085);
    setStopLoss(1.083);
    setTakeProfit(1.09);
    setSession('London');
    setNotes('');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Trade Calculator</Typography>
      {message.text && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>{message.text}</Alert>}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#a78bfa', mb: 1 }}>Inputs</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Pair</InputLabel>
                    <Select value={pair} label="Pair" onChange={(e) => setPair(e.target.value)}>
                      {assets.length ? assets.map((a) => <MenuItem key={a.id} value={a.symbol}>{a.symbol}</MenuItem>) : <MenuItem value={pair}>{pair}</MenuItem>}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Asset class</InputLabel>
                    <Select value={assetClass} label="Asset class" onChange={(e) => setAssetClass(e.target.value)}>
                      {ASSET_CLASSES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Direction</InputLabel>
                    <Select value={direction} label="Direction" onChange={(e) => setDirection(e.target.value)}>
                      <MenuItem value="buy">Buy</MenuItem>
                      <MenuItem value="sell">Sell</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Account balance" type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Risk %" type="number" value={riskPercent} onChange={(e) => setRiskPercent(Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Entry" type="number" value={entry} onChange={(e) => setEntry(Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Stop loss" type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Take profit" type="number" value={takeProfit} onChange={(e) => setTakeProfit(Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Session</InputLabel>
                    <Select value={session} label="Session" onChange={(e) => setSession(e.target.value)}>
                      {SESSIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Notes" multiline rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#a78bfa', mb: 1 }}>Outputs</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>Risk amount: ${Number(outputs.riskAmount).toFixed(2)}</Typography>
                <Typography>Stop loss pips: {Number(outputs.stopLossPips).toFixed(2)}</Typography>
                <Typography>Take profit pips: {Number(outputs.takeProfitPips).toFixed(2)}</Typography>
                <Typography>Risk/Reward: {Number(outputs.rr).toFixed(2)}</Typography>
                <Typography>Position size: {Number(outputs.positionSize).toFixed(4)}</Typography>
                <Typography sx={{ color: '#22c55e' }}>Potential profit: ${Number(outputs.potentialProfit).toFixed(2)}</Typography>
                <Typography sx={{ color: '#f87171' }}>Potential loss: ${Number(outputs.potentialLoss).toFixed(2)}</Typography>
                <Typography>Checklist grade: {outputs.tradeGrade}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" sx={{ mr: 1, bgcolor: '#8B5CF6' }} onClick={handleSave}>Save as trade</Button>
              <Button variant="outlined" onClick={handleReset}>Reset</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
