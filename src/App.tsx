import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '@/pages/Login'
import { Toaster } from 'sonner'
import Dashboard from '@/pages/Dashboard'
import Catalog from '@/pages/Catalog'
import Clients from '@/pages/Clients'
import FindClientAndStartOrder from '@/pages/FindClientAndStartOrder'
import { AuthProvider } from './context/AuthContext'
import SendOrder from '@/pages/SendOrder'
import Orders from '@/pages/Orders'
import Cart from '@/pages/Cart'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clients />} />
             <Route path="/pedidos" element={<Orders />} />
            <Route path="/realizar-pedido" element={<FindClientAndStartOrder />} />
            <Route path="/catalogo/:customerId" element={<Catalog />} />
            <Route path="/finalizar-pedido" element={<SendOrder />} />
            <Route path="/carrinho" element={<Cart />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </div>
  )
}

export default App
