import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { getChecklists } from '../../services/api';

export default function ChecklistsPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChecklists()
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, color: '#a78bfa' }}>Checklists</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Trade grade: 100% = A+, 80–99% = A, 60–79% = B, below 60% = C. Complete the checklist when entering a trade.
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        templates.map((t) => (
          <Card key={t.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ color: '#a78bfa', mb: 1 }}>{t.name}</Typography>
              {t.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{t.description}</Typography>}
              <List dense>
                {(t.items || []).map((item, i) => (
                  <ListItem key={item.id}>
                    <ListItemText primary={`${i + 1}. ${item.label}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
