import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, Package, User, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCNPJ, formatCurrency } from '@/services/formatters'
import TopNavigation from '@/components/TopNavigation'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type CartItem = {
  name: string
  quantity: number
  currentPrice: number
  price: number
}

type Client = {
  corporate_name: string
  cnpj: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
}

type Cart = {
  Client: Client
  Items: CartItem[]
}

const Cart = () => {
  const navigate = useNavigate()
  const [carts, setCarts] = useState<{ id: string; cart: Cart }[]>([])
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null)
  const [cartToDelete, setCartToDelete] = useState<string | null>(null)

  useEffect(() => {
    const savedCarts: { id: string; cart: Cart }[] = []
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('CartOrders-')) {
        const id = key.replace('CartOrders-', '')
        const value = JSON.parse(localStorage.getItem(key) || '{}')
        savedCarts.push({ id, cart: value })
      }
    }
    setCarts(savedCarts)
  }, [])

  const getTotalPrice = (items: CartItem[]) => {
    return items.reduce((total, item) => total + (item.currentPrice ?? item.price) * item.quantity, 0)
  }

  const getTotalItems = (items: CartItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const removeCart = (id: string) => {
    localStorage.removeItem(`CartOrders-${id}`)
    setCarts((prev) => prev.filter((c) => c.id !== id))
    setCartToDelete(null)
  }

  const continueOrder = (client: Client, items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items))
    localStorage.setItem('selectedClient', JSON.stringify(client))
    //navigate(`/catalog/${JSON.stringify(client)}`) corrigir
  }

  console.log(carts)

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Pedidos em Andamento</h2>
          <p className="text-muted-foreground">
            {carts.length} {carts.length === 1 ? 'carrinho encontrado' : 'carrinhos encontrados'}
          </p>
        </div>

        <div className="space-y-4">
          {carts.map(({ id, cart }) => (
            <Card key={id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cart.Client.corporate_name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">CNPJ:</span>
                    <span>{formatCNPJ(cart.Client.cnpj)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Itens:</span>
                    <span>
                      {getTotalItems(cart.Items)} {getTotalItems(cart.Items) === 1 ? 'produto' : 'produtos'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-bold text-lg">{formatCurrency(getTotalPrice(cart.Items))}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedCart(cart)} aria-label={`Ver detalhes do carrinho de ${cart.Client.corporate_name}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCartToDelete(id)} aria-label={`Excluir carrinho de ${cart.Client.corporate_name}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {carts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum carrinho encontrado</h3>
              <p className="text-muted-foreground mb-6">Realize seu primeiro pedido para vê-lo aqui</p>
              <Button onClick={() => navigate('/realizar-pedido')}>Realizar Novo Pedido</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedCart} onOpenChange={() => setSelectedCart(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Detalhes do Carrinho</DialogTitle>
            </div>
          </DialogHeader>
          {selectedCart && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <span className="text-sm font-medium">Cliente:</span>
                  <p className="text-sm text-muted-foreground">{selectedCart.Client.corporate_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">CNPJ:</span>
                  <p className="text-sm text-muted-foreground">{formatCNPJ(selectedCart.Client.cnpj)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Endereço:</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedCart.Client.street}, {selectedCart.Client.number} - {selectedCart.Client.neighborhood}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCart.Client.city} - {selectedCart.Client.state}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Produtos do Carrinho</h4>
                <div className="space-y-2">
                  {selectedCart.Items.map((item: CartItem, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 rounded hover:bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground">Quantidade: {item.quantity}</p>
                      </div>
                      <span className="font-medium">{formatCurrency(item.currentPrice ?? item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(getTotalPrice(selectedCart.Items))}</span>
                </div>
              </div>
              <Button onClick={() => continueOrder(selectedCart.Client, selectedCart.Items)} className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Continuar Pedido
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cartToDelete} onOpenChange={() => setCartToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este carrinho? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => cartToDelete && removeCart(cartToDelete)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Cart
