import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    image: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const name = sessionStorage.getItem('adminName');
    if (name) setAdminName(name);
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setChartData(data.chartData || []);
        setMonthlyChartData(data.monthlyChartData || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        return data.imageUrl;
      } else {
        alert('Gagal upload gambar: ' + data.message);
        return null;
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Terjadi kesalahan saat upload gambar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = productForm.image;

      // Upload image jika ada file baru
      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) return; // Stop jika upload gagal
        imageUrl = uploadedUrl;
      }

      const url = editingProduct 
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category,
        image: imageUrl
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(editingProduct ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!');
        await fetchProducts();
        resetProductForm();
      } else {
        alert(data.message || 'Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Terjadi kesalahan saat menyimpan produk');
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: '', price: '', category: '', image: '' });
    setEditingProduct(null);
    setShowProductForm(false);
    setSelectedFile(null);
    setImagePreview('');
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image
    });
    setImagePreview(product.image);
    setShowProductForm(true);
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Produk berhasil dihapus!');
        await fetchProducts();
      } else {
        alert(data.message || 'Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Terjadi kesalahan saat menghapus produk');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminName');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fbbf24',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        ⏳ Loading Dashboard...
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%); color: #f5f5f5; min-height: 100vh; }
        .dashboard-container { min-height: 100vh; }
        .header { background: rgba(31, 41, 55, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(251, 191, 36, 0.1); padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #ca8a04, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
        .header-title h1 { font-size: 24px; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px; }
        .header-title p { font-size: 13px; color: #9ca3af; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .admin-info { text-align: right; margin-right: 8px; }
        .admin-name { font-weight: 600; color: #fbbf24; font-size: 14px; }
        .admin-role { font-size: 12px; color: #9ca3af; }
        .logout-btn { padding: 10px 20px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.3s ease; }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.3); transform: translateY(-2px); }
        .main-content { padding: 32px; max-width: 1600px; margin: 0 auto; }
        .tabs { display: flex; gap: 8px; margin-bottom: 32px; border-bottom: 2px solid rgba(251, 191, 36, 0.1); padding-bottom: 0; }
        .tab { padding: 12px 24px; background: transparent; border: none; color: #9ca3af; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.3s ease; border-bottom: 3px solid transparent; margin-bottom: -2px; }
        .tab:hover { color: #fbbf24; }
        .tab.active { color: #fbbf24; border-bottom-color: #fbbf24; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .stat-card { background: rgba(31, 41, 55, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(251, 191, 36, 0.1); border-radius: 16px; padding: 24px; transition: all 0.3s ease; }
        .stat-card:hover { transform: translateY(-4px); border-color: rgba(251, 191, 36, 0.3); }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
        .stat-icon.revenue { background: rgba(34, 197, 94, 0.2); }
        .stat-icon.orders { background: rgba(59, 130, 246, 0.2); }
        .stat-icon.paid { background: rgba(168, 85, 247, 0.2); }
        .stat-icon.pending { background: rgba(251, 191, 36, 0.2); }
        .stat-label { font-size: 14px; color: #9ca3af; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .chart-container { background: rgba(31, 41, 55, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(251, 191, 36, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 32px; }
        .chart-title { font-size: 18px; font-weight: 600; color: #f9fafb; margin-bottom: 24px; }
        .orders-table { background: rgba(31, 41, 55, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(251, 191, 36, 0.1); border-radius: 16px; overflow: hidden; }
        .table-header { padding: 20px 24px; border-bottom: 1px solid rgba(251, 191, 36, 0.1); display: flex; justify-content: space-between; align-items: center; }
        .table-title { font-size: 18px; font-weight: 600; color: #f9fafb; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px 24px; font-weight: 600; font-size: 13px; color: #9ca3af; background: rgba(17, 24, 39, 0.5); text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 16px 24px; border-bottom: 1px solid rgba(251, 191, 36, 0.05); color: #e5e7eb; font-size: 14px; }
        tr:hover td { background: rgba(202, 138, 4, 0.05); }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status-paid { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .status-pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .product-card { background: rgba(31, 41, 55, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(251, 191, 36, 0.1); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; }
        .product-card:hover { transform: translateY(-4px); border-color: rgba(251, 191, 36, 0.3); }
        .product-image { width: 100%; height: 200px; object-fit: cover; }
        .product-info { padding: 16px; }
        .product-name { font-weight: 600; color: #f9fafb; margin-bottom: 8px; font-size: 16px; }
        .product-price { color: #fbbf24; font-weight: 700; font-size: 18px; margin-bottom: 8px; }
        .product-meta { display: flex; justify-content: flex-start; font-size: 13px; color: #9ca3af; margin-bottom: 12px; }
        .product-actions { display: flex; gap: 8px; }
        .btn-edit { flex: 1; padding: 8px; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s ease; }
        .btn-edit:hover { background: rgba(59, 130, 246, 0.3); }
        .btn-delete { flex: 1; padding: 8px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s ease; }
        .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }
        .add-product-btn { padding: 12px 24px; background: linear-gradient(135deg, #ca8a04, #d97706); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.3s ease; }
        .add-product-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(202, 138, 4, 0.3); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: rgba(31, 41, 55, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 20px; padding: 32px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-title { font-size: 20px; font-weight: 700; color: #fbbf24; }
        .close-btn { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 24px; padding: 4px; transition: color 0.3s ease; }
        .close-btn:hover { color: #f9fafb; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; color: #e5e7eb; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
        .form-input { width: 100%; padding: 12px; background: rgba(17, 24, 39, 0.8); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 8px; color: #f9fafb; font-size: 14px; transition: all 0.3s ease; }
        .form-input:focus { outline: none; border-color: rgba(251, 191, 36, 0.5); box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1); }
        .file-input-wrapper { position: relative; }
        .file-input-label { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: rgba(59, 130, 246, 0.2); border: 2px dashed rgba(59, 130, 246, 0.3); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; color: #60a5fa; font-weight: 600; }
        .file-input-label:hover { background: rgba(59, 130, 246, 0.3); border-color: rgba(59, 130, 246, 0.5); }
        .file-input { display: none; }
        .image-preview { margin-top: 12px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.2); }
        .preview-img { width: 100%; height: 200px; object-fit: cover; }
        .form-actions { display: flex; gap: 12px; margin-top: 24px; }
        .btn-submit { flex: 1; padding: 12px; background: linear-gradient(135deg, #ca8a04, #d97706); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.3s ease; }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(202, 138, 4, 0.3); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-cancel { flex: 1; padding: 12px; background: rgba(107, 114, 128, 0.2); border: 1px solid rgba(156, 163, 175, 0.3); color: #9ca3af; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.3s ease; }
        .btn-cancel:hover { background: rgba(107, 114, 128, 0.3); }
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px; color: #9ca3af; background: rgba(31, 41, 55, 0.6); border-radius: 16px; border: 1px solid rgba(251, 191, 36, 0.1); }
        @media (max-width: 768px) {
          .main-content { padding: 20px; }
          .stats-grid { grid-template-columns: 1fr; }
          .header { padding: 16px 20px; }
          .header-left { flex-direction: column; align-items: flex-start; gap: 8px; }
          .admin-info { display: none; }
          table { font-size: 12px; }
          th, td { padding: 12px; }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="header">
          <div className="header-left">
            <div className="logo-icon">📊</div>
            <div className="header-title">
              <h1>PHAMIE Admin</h1>
              <p>Dashboard Management System</p>
            </div>
          </div>
          <div className="header-right">
            <div className="admin-info">
              <div className="admin-name">👤 {adminName || 'Admin'}</div>
              <div className="admin-role">Administrator</div>
            </div>
            <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
          </div>
        </div>

        <div className="main-content">
          <div className="tabs">
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📈 Overview</button>
            <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>🛍 Orders</button>
            <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>📦 Products</button>
          </div>

          {activeTab === 'overview' && stats && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon revenue">💰</div>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">Rp{(stats?.totalRevenue ?? 0).toLocaleString('id-ID')}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orders">📊</div>
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-value">{stats.totalOrders}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon paid">✅</div>
                  <div className="stat-label">Paid Orders</div>
                  <div className="stat-value">{stats.paidOrders}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon pending">⏳</div>
                  <div className="stat-label">Pending Payment</div>
                  <div className="stat-value">{stats.pendingOrders}</div>
                </div>
              </div>

              {chartData.length > 0 && (
                <>
                  <div className="chart-container">
                    <h3 className="chart-title">📊 Daily Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(251, 191, 36, 0.1)" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{background: 'rgba(31, 41, 55, 0.95)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px'}} />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#fbbf24" strokeWidth={3} name="Revenue (Rp)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-container">
                    <h3 className="chart-title">📦 Orders by Day</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(251, 191, 36, 0.1)" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{background: 'rgba(31, 41, 55, 0.95)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px'}} />
                        <Legend />
                        <Bar dataKey="count" fill="#fbbf24" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {monthlyChartData.length > 0 && (
                <div className="chart-container">
                  <h3 className="chart-title">📅 Monthly Revenue Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(251, 191, 36, 0.1)" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{background: 'rgba(31, 41, 55, 0.95)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px'}} />
                      <Legend />
                      <Bar dataKey="total" fill="#10b981" name="Revenue (Rp)" />
                      <Bar dataKey="count" fill="#3b82f6" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <div className="orders-table">
              <div className="table-header">
                <h3 className="table-title">🛍 All Orders ({orders.length})</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>Belum ada order</td>
                    </tr>
                  ) : (
                    orders.map(order => {
                      const orderTotal = order.total || (order.items?.reduce((sum, item) => {
                        return sum + ((item.price || 0) * (item.quantity || 0));
                      }, 0) || 0);

                      return (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-6)}</td>
                          <td>{order.customerName}</td>
                          <td>
                            <div>{order.email}</div>
                            <div style={{fontSize: '12px', color: '#9ca3af'}}>{order.phone}</div>
                          </td>
                          <td>
                            {order.items?.map((item, i) => (
                              <div key={i} style={{fontSize: '13px'}}>
                                {item.name} x{item.quantity}
                                {item.price && <span style={{color: '#9ca3af'}}> (@Rp{item.price.toLocaleString('id-ID')})</span>}
                              </div>
                            ))}
                          </td>
                          <td style={{fontWeight: '600', color: '#fbbf24'}}>Rp{orderTotal.toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`status-badge ${order.status === 'paid' ? 'status-paid' : 'status-pending'}`}>
                              {order.status === 'paid' ? '✅ Paid' : '⏳ Waiting Payment'}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'products' && (
            <>
              <div className="table-header" style={{marginBottom: '24px'}}>
                <h3 className="table-title">📦 Product Management ({products.length})</h3>
                <button className="add-product-btn" onClick={() => setShowProductForm(true)}>➕ Add New Product</button>
              </div>

              <div className="products-grid">
                {products.length === 0 ? (
                  <div className="empty-state">
                    <div style={{fontSize: '48px', marginBottom: '16px'}}>📦</div>
                    <div style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>Belum ada produk</div>
                    <div style={{fontSize: '14px'}}>Klik tombol "Add New Product" untuk menambahkan produk pertama</div>
                  </div>
                ) : (
                  products.map(product => (
                    <div key={product._id} className="product-card">
                      <img src={product.image} alt={product.name} className="product-image" />
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">Rp{product.price.toLocaleString('id-ID')}</div>
                        <div className="product-meta">
                          <span>📂 {product.category}</span>
                        </div>
                        <div className="product-actions">
                          <button className="btn-edit" onClick={() => editProduct(product)}>✏ Edit</button>
                          <button className="btn-delete" onClick={() => deleteProduct(product._id)}>🗑 Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showProductForm && (
        <div className="modal-overlay" onClick={() => resetProductForm()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProduct ? '✏ Edit Product' : '➕ Add New Product'}</h3>
              <button className="close-btn" onClick={resetProductForm}>×</button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (Rp)</label>
                <input
                  type="number"
                  className="form-input"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  placeholder="e.g., Electronics, Fashion"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div className="file-input-wrapper">
                  <label htmlFor="file-upload" className="file-input-label">
                    <span>📁</span>
                    <span>{selectedFile ? selectedFile.name : 'Choose Image File'}</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </div>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" className="preview-img" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetProductForm}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? '⏳ Uploading...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}