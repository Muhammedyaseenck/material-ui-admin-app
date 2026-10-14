import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { cleanImage } from '../api.js';

const EMPTY = { title: '', price: '', description: '', categoryId: '', image: '' };

export default function ProductDialog({ open, product, categories, onClose, onSubmit }) {
  const editing = !!product;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setApiError('');
    setForm(product ? {
      title: product.title,
      price: product.price,
      description: product.description,
      categoryId: product.category?.id ?? '',
      image: cleanImage(product.images),
    } : EMPTY);
  }, [open, product]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Enter a title.';
    if (form.price === '' || Number(form.price) <= 0) e.price = 'Enter a price greater than 0.';
    if (!form.description.trim()) e.description = 'Enter a description.';
    if (!form.categoryId) e.categoryId = 'Choose a category.';
    if (!/^https?:\/\/.+/.test(form.image.trim())) e.image = 'Enter a valid image URL starting with http(s).';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    setApiError('');
    try {
      await onSubmit({
        title: form.title.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        images: [form.image.trim()],
      });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {apiError && <Alert severity="error">{apiError}</Alert>}
          <TextField label="Title" value={form.title} onChange={set('title')} error={!!errors.title} helperText={errors.title} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Price" type="number" value={form.price} onChange={set('price')} error={!!errors.price} helperText={errors.price} fullWidth />
            <TextField select label="Category" value={form.categoryId} onChange={set('categoryId')} error={!!errors.categoryId} helperText={errors.categoryId} fullWidth>
              {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Stack>
          <TextField label="Description" value={form.description} onChange={set('description')} error={!!errors.description} helperText={errors.description} multiline minRows={3} fullWidth />
          <TextField label="Image URL" value={form.image} onChange={set('image')} error={!!errors.image}
            helperText={errors.image || 'For example https://placehold.co/600x400'} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={busy}>
          {busy ? 'Saving...' : editing ? 'Save changes' : 'Add product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}