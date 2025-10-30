import { ShoppingCart, Users, Package, Menu, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const TopNavigation = () => {
  const navigate = useNavigate()

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary cursor-pointer" onClick={() => navigate('/')} />
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex flex-col items-center gap-1 p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex flex-col items-center gap-1 p-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs">Carrinho</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')} className="flex flex-col items-center gap-1 p-2">
            <Users className="h-4 w-4" />
            <span className="text-xs">Clientes</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex flex-col items-center gap-1 p-2">
            <Menu className="h-4 w-4" />
            <span className="text-xs">Menu</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation
