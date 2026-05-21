import { Routes, Route } from 'react-router-dom';
import Home from './components/customer/Home';
import ProductCatalog from './components/customer/ProductCatalog';
import Cart from './components/customer/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './components/customer/OrderHistory';
import Dashboard from './components/admin/Dashboard';
import ProductList from './components/admin/ProductList';
import AddProduct from './components/admin/AddProduct';
import AdminPage from './pages/AdminPage';
import DeliveryDashboard from './components/delivery/DeliveryDashboard';
import UpdateStatus from './components/delivery/UpdateStatus';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Profile from './pages/Profile';
import InvoicePage from './pages/InvoicePage';
import NotFound from './pages/NotFound';

function AppRoutes() {
  return (
    <Routes>
      {/* Customer */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductCatalog />} />
      <Route path="/shop" element={<ProductCatalog />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<OrderHistory />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/products" element={<ProductList />} />
      <Route path="/admin/products/new" element={<AddProduct />} />

      {/* Delivery */}
      <Route path="/delivery" element={<DeliveryDashboard />} />
      <Route path="/delivery/update" element={<UpdateStatus />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* About */}
      <Route path="/about" element={<About />} />

      {/* Account */}
      <Route path="/profile" element={<Profile />} />

      {/* Invoice */}
      <Route path="/invoice/:orderId" element={<InvoicePage />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;

