import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { cleanImage } from '../api.js';

export default function CategoryDialog({ open, category, onClose, onSubmit }) {
  const editing = !!category;
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setApiError('');
    setName(category?.name ?? '');
    setImage(cleanImage(category?.image));
  }, [open, category]);

  const submit = async () => {
    const e = {};
    if (!name.trim()) e.name = 'Enter a name.';
    if (!/^https?:\/\/.+/.test(image.trim())) e.image = 'Enter a valid image URL starting with http(s).';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setApiError('');
    try {
      await onSubmit({ name: name.trim(), image: image.trim() });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Edit category' : 'Add category'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {apiError && <Alert severity="error">{apiError}</Alert>}
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={!!errors.name} helperText={errors.name} fullWidth />
          <TextField label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} error={!!errors.image}
            helperText={errors.image || 'For example https://placehold.co/600x400'} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={busy}>
          {busy ? 'Saving...' : editing ? 'Save changes' : 'Add category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}