import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Package, Calendar, User, Eye, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import OrderFilter, { type FilterState } from '@/components/OrderFilter'
import { getOrderService } from '@/services/orderService'
import { formatCNPJ, formatCurrency } from '@/services/formatters'

type Product = {
  name: string
  quantity: number
  price: number
}

type Order = {
  id: string | number
  created_at?: string | null
  status?: string | null
  corporate_name?: string | null
  cnpj?: string | null
  city?: string | null
  state?: string | null
  street?: string | null
  number?: string | number | null
  total?: number
  products: Product[]
}

const Orders = () => {
  const navigate = useNavigate()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    cnpj: '',
    startDate: undefined,
    endDate: undefined,
    status: 'Todos',
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Entregue':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'Pendente':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'Em Rota':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'Cancelado':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const groupOrders = useCallback((rawOrders: any[]): Order[] => {
    const orderMap: Record<string, Order> = {}

    rawOrders.forEach((row) => {
      const id = row.order_id ?? row.id
      if (!orderMap[id]) {
        orderMap[id] = {
          id,
          created_at: row.created_at,
          status: row.status,
          corporate_name: row.corporate_name,
          cnpj: row.cnpj,
          city: row.city,
          state: row.state,
          street: row.street,
          number: row.number,
          total: row.total !== undefined ? Number(row.total) : 0,
          products: [],
        }
      }
      if (row.product_name) {
        orderMap[id].products.push({
          name: row.product_name,
          quantity: row.quantity !== undefined ? Number(row.quantity) : 0,
          price: row.product_price !== undefined ? Number(row.product_price) : 0,
        })
      }
    })

    return Object.values(orderMap)
  }, [])

  useEffect(() => {
    let mounted = true

    const params: any = {
      cnpj: filters.cnpj || undefined,
      status: filters.status && filters.status !== 'Todos' ? filters.status : undefined,
      startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
      endDate: filters.endDate ? filters.endDate.toISOString() : undefined,
    }

    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getOrderService(params)
        if (!mounted) return
        const grouped = groupOrders(Array.isArray(data) ? data : [])
        setOrders(grouped)
      } catch (err: any) {
        if (!mounted) return
        const errorMessage = err.response?.data?.message || err.message || 'Erro ao buscar pedidos'
        setError(errorMessage)
        console.error('Erro ao buscar pedidos:', err)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    fetchOrders()

    return () => {
      mounted = false
    }
  }, [filters, groupOrders])

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} aria-label="Voltar para página inicial">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Package className="h-6 w-6 text-eco-green" />
            <h1 className="text-lg font-semibold">Consultar Pedidos</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Histórico de Pedidos</h2>
          <p className="text-muted-foreground">{loading ? 'Carregando...' : `${orders.length} ${orders.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}`}</p>
        </div>

        <OrderFilter onFilterChange={setFilters} />

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                    <Badge className={getStatusColor(order.status ?? undefined)}>{order.status || 'Sem status'}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Cliente:</span>
                      <span>{order.corporate_name || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">CNPJ:</span>
                      <span>{order.cnpj ? formatCNPJ(order.cnpj) : 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Data:</span>
                      <span>{order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Itens:</span>
                      <span>{order.products.length ? `${order.products.length} ${order.products.length === 1 ? 'produto' : 'produtos'}` : 'Nenhum produto'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-bold text-lg">{formatCurrency(Number(order.total ?? 0))}</span>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} aria-label={`Ver detalhes do pedido ${order.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {orders.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros ou realize seu primeiro pedido</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null)
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <span className="text-sm font-medium">Cliente:</span>
                  <p className="text-sm text-muted-foreground">{selectedOrder.corporate_name || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">CNPJ:</span>
                  <p className="text-sm text-muted-foreground">{selectedOrder.cnpj ? formatCNPJ(selectedOrder.cnpj) : 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Data:</span>
                  <p className="text-sm text-muted-foreground">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={`ml-2 ${getStatusColor(selectedOrder.status ?? undefined)}`}>{selectedOrder.status || 'Sem status'}</Badge>
                </div>
                <div className="border-t pt-3">
                  <span className="text-sm font-medium block mb-2">Endereço de Entrega:</span>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      {selectedOrder.street || 'Não informado'}, {selectedOrder.number || 'S/N'}
                    </p>
                    <p>
                      {selectedOrder.city || 'Não informado'} - {selectedOrder.state || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Produtos do Pedido</h4>
                {selectedOrder.products && selectedOrder.products.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.products.map((product: Product, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm p-2 rounded hover:bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-muted-foreground">Quantidade: {product.quantity}</p>
                        </div>
                        <span className="font-medium">{formatCurrency(Number(product.price ?? 0))}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto neste pedido</p>
                )}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between items-center">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(Number(selectedOrder.total ?? 0))}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders
