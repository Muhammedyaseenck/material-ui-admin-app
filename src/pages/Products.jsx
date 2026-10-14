import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Card, Chip, CircularProgress, IconButton, InputAdornment, MenuItem, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography, alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import Inventory2Icon from '@mui/icons-material/Inventory2Outlined';
import * as api from '../api.js';
import PageHeader from '../components/PageHeader.jsx';
import ProductDialog from '../components/ProductDialog.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Products() {
  const [rows, setRows] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Wait for the person to stop typing before searching
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Ask for one extra row so we know whether a next page exists (the API returns no total).
      const data = await api.getProducts(page * rowsPerPage, rowsPerPage + 1, { title: search, categoryId });
      setHasMore(data.length > rowsPerPage);
      setRows(data.slice(0, rowsPerPage));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, categoryId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.getCategories().then(setCategories).catch(() => {}); }, []);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p) => { setEditing(p); setFormOpen(true); };

  const save = async (payload) => {
    if (editing) {
      await api.updateProduct(editing.id, payload);
      setToast('Product updated');
    } else {
      await api.createProduct(payload);
      setToast('Product added');
    }
    setFormOpen(false);
    load();
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await api.deleteProduct(deleting.id);
      setToast('Product deleted');
      setDeleting(null);
      if (rows.length === 1 && page > 0) setPage(page - 1); else load();
    } catch (e) {
      setError(e.message);
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const from = page * rowsPerPage + 1;

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle="Add, edit and remove items in your store."
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add product</Button>}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #eef1f6' }}>
          <TextField
            size="small" placeholder="Search products" value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 300 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <TextField
            select size="small" label="Category" value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Box>

        <TableContainer sx={{ position: 'relative', minHeight: 240 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={72}>ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right" width={120}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ opacity: loading ? 0.45 : 1, transition: 'opacity .15s' }}>
              {rows.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>#{p.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar variant="rounded" src={api.cleanImage(p.images)} alt={p.title} sx={{ width: 48, height: 48, bgcolor: '#eef1f6' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 320 }}>{p.title}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap component="div" sx={{ maxWidth: 320 }}>{p.description}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={p.category?.name ?? '-'} sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2" fontWeight={700}>${p.price}</Typography></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(p)} aria-label={`Edit ${p.title}`} sx={{ '&:hover': { color: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.1) } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setDeleting(p)} aria-label={`Delete ${p.title}`} sx={{ ml: 0.5, '&:hover': { color: 'error.main', bgcolor: (t) => alpha(t.palette.error.main, 0.1) } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Inventory2Icon sx={{ fontSize: 44, color: '#c3cad6' }} />
                    <Typography fontWeight={600} sx={{ mt: 1 }}>No products found</Typography>
                    <Typography variant="body2" color="text.secondary">Try a different search or category, or add a new product.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {loading && <CircularProgress size={28} sx={{ position: 'absolute', top: '50%', left: '50%', mt: -1.5, ml: -1.5 }} />}
        </TableContainer>

        <TablePagination
          component="div"
          count={hasMore ? -1 : page * rowsPerPage + rows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          labelDisplayedRows={({ to }) => (rows.length ? `${from}-${to}${hasMore ? '' : ` of ${to}`}` : '0')}
          sx={{ borderTop: '1px solid #eef1f6' }}
        />
      </Card>

      <ProductDialog open={formOpen} product={editing} categories={categories} onClose={() => setFormOpen(false)} onSubmit={save} />
      <ConfirmDialog open={!!deleting} busy={deleteBusy} title="Delete product?"
        message={`"${deleting?.title ?? ''}" will be removed from the store. This can't be undone.`}
        onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}