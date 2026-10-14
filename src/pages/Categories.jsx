import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, IconButton, Snackbar,
  TablePagination, Tooltip, Typography, alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import * as api from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import CategoryDialog from '../components/CategoryDialog.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Categories() {
  const [all, setAll] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAll(await api.getCategories());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // The categories endpoint has no paging, so page on the client.
  const rows = all.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const save = async (payload) => {
    if (editing) {
      await api.updateCategory(editing.id, payload);
      setToast('Category updated');
    } else {
      await api.createCategory(payload);
      setToast('Category added');
    }
    setFormOpen(false);
    load();
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await api.deleteCategory(deleting.id);
      setToast('Category deleted');
      setDeleting(null);
      load();
    } catch (e) {
      setError(e.message);
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Categories"
        subtitle="Group your products so shoppers can find them."
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>Add category</Button>}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ position: 'relative', minHeight: 200 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2.5, opacity: loading ? 0.45 : 1, transition: 'opacity .15s' }}>
          {rows.map((c) => (
            <Card key={c.id} sx={{ overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="150"
                image={api.cleanImage(c.image) || api.FALLBACK_IMG}
                alt={c.name}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = api.FALLBACK_IMG; }}
                sx={{ objectFit: 'cover', bgcolor: '#eef1f6' }}
              />
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700} noWrap>{c.name}</Typography>
                    <Chip size="small" label={`ID ${c.id}`} sx={{ mt: 0.5, bgcolor: '#f1f3f9', fontWeight: 600 }} />
                  </Box>
                  <Box sx={{ flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => { setEditing(c); setFormOpen(true); }} aria-label={`Edit ${c.name}`} sx={{ '&:hover': { color: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.1) } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`} sx={{ ml: 0.5, '&:hover': { color: 'error.main', bgcolor: (t) => alpha(t.palette.error.main, 0.1) } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {!loading && all.length === 0 && (
          <Card sx={{ py: 8, textAlign: 'center' }}>
            <CategoryIcon sx={{ fontSize: 44, color: '#c3cad6' }} />
            <Typography fontWeight={600} sx={{ mt: 1 }}>No categories yet</Typography>
            <Typography variant="body2" color="text.secondary">Add your first category to get started.</Typography>
          </Card>
        )}
        {loading && <CircularProgress size={28} sx={{ position: 'absolute', top: 80, left: '50%', ml: -1.5 }} />}
      </Box>

      <TablePagination
        component="div" count={all.length} page={page} rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[4, 8, 12]}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
        sx={{ mt: 1 }}
      />

      <CategoryDialog open={formOpen} category={editing} onClose={() => setFormOpen(false)} onSubmit={save} />
      <ConfirmDialog open={!!deleting} busy={deleteBusy} title="Delete category?"
        message={`"${deleting?.name ?? ''}" will be removed. Categories that still have products may not be deletable.`}
        onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}