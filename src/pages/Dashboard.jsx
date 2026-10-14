import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, Card, CardContent, LinearProgress, Skeleton, Typography, alpha } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2Outlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import PaidIcon from '@mui/icons-material/PaidOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import * as api from '../api.js';
import PageHeader from '../components/PageHeader.jsx';

function Stat({ label, value, icon, color, loading }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ width: 54, height: 54, borderRadius: 3, display: 'grid', placeItems: 'center', color: `${color}.main`, bgcolor: (t) => alpha(t.palette[color].main, 0.12) }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {loading ? <Skeleton width={80} height={36} /> : <Typography variant="h5">{value}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getAllProducts(), api.getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const prices = products.map((p) => Number(p.price) || 0);
    const total = prices.reduce((a, b) => a + b, 0);
    const counts = categories
      .map((c) => ({ id: c.id, name: c.name, count: products.filter((p) => p.category?.id === c.id).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    return {
      avg: prices.length ? total / prices.length : 0,
      max: prices.length ? Math.max(...prices) : 0,
      counts,
      maxCount: Math.max(1, ...counts.map((c) => c.count)),
      latest: [...products].sort((a, b) => b.id - a.id).slice(0, 5),
    };
  }, [products, categories]);

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="A quick look at your store." />
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3 }}>
        <Stat label="Total products" value={products.length} icon={<Inventory2Icon />} color="primary" loading={loading} />
        <Stat label="Categories" value={categories.length} icon={<CategoryIcon />} color="success" loading={loading} />
        <Stat label="Average price" value={`$${stats.avg.toFixed(2)}`} icon={<PaidIcon />} color="warning" loading={loading} />
        <Stat label="Highest price" value={`$${stats.max}`} icon={<TrendingUpIcon />} color="error" loading={loading} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' }, gap: 2.5 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Products by category</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Categories with the most products.</Typography>
            {loading
              ? [1, 2, 3, 4].map((i) => <Skeleton key={i} height={40} />)
              : stats.counts.map((c) => (
                  <Box key={c.id} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{c.count}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(c.count / stats.maxCount) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: '#eef1f6' }} />
                  </Box>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Latest products</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Most recently added items.</Typography>
            {loading
              ? [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={56} />)
              : stats.latest.map((p) => (
                  <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, borderTop: '1px solid #eef1f6' }}>
                    <Avatar variant="rounded" src={api.cleanImage(p.images)} alt={p.title} sx={{ width: 44, height: 44 }} />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{p.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.category?.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>${p.price}</Typography>
                  </Box>
                ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}