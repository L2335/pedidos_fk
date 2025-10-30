import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, ShoppingCart, FileText, LogOut, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { logoutUser } from '@/services/authService'


const Dashboard = () => {
  const navigate = useNavigate()

  const { user, setUser } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = async () => {
    try {
      await logoutUser()
      toast.success('Logout realizado. Até logo!')
    } catch (error) {
      toast.error('Ocorreu um erro ao tentar sair.')
    } finally {
      setUser(null)
      navigate('/login')
    }
  }

  if (!user) {
    return null
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-eco-green" />
            <h1 className="text-lg font-semibold">Painel do Vendedor</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo, {user?.username || 'Vendedor'}!</h2>
          <p className="text-muted-foreground">Gerencie seus clientes e pedidos</p>
        </div>

        <div className="grid gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-eco-green/10 rounded-lg">
                  <Plus className="h-5 w-5 text-eco-green" />
                </div>
                Novo Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Criar um novo pedido para um cliente</p>
              <Button className="w-full" onClick={() => navigate('/realizar-pedido')}>
                Realizar Pedido
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                Consultar Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Visualizar ou cadastrar Clientes</p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/clientes')}>
                Ver Clientes
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-500" />
                </div>
                Consultar Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Visualizar histórico de pedidos realizados</p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/pedidos')}>
                Ver Pedidos
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-purple-500" />
                </div>
                Carrinho Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Ver itens no carrinho de compras</p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/carrinho')}>
                Ver Carrinho
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
