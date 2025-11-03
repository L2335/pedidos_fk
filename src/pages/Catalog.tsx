import { useState, useMemo, useEffect, useCallback, useTransition } from 'react'
import TopNavigation from '@/components/TopNavigation'
import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { useParams, useNavigate } from 'react-router-dom'
import { getProducts, type Product, type Customer } from '@/services/productService'
import { formatCNPJ } from '@/services/formatters'

const Catalog = () => {
  const [isPending, startTransition] = useTransition()
  const [products, setProducts] = useState<Product[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [bonusQuantities, setBonusQuantities] = useState<Record<string, number>>({})
  const { customerId } = useParams<{ customerId: string }>()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const cartOrder = localStorage.getItem(`CartOrders-${customerId}`)
  localStorage.setItem(`currentCustomerKey`, JSON.stringify(customerId))

  useEffect(() => {
    if (cartOrder) {
      setClient(JSON.parse(cartOrder))
    } else {
      setError('Cliente não selecionado. Volte e confirme o cliente antes de seguir para o catálogo.')
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!customerId) {
          setError('Cliente não selecionado.')
          setLoading(false)
          return
        }

        const data = await getProducts()

        if (!data) {
          throw new Error('Dados de produtos inválidos')
        }

        setProducts(data)

      } catch (err) {
        setError('Não foi possível carregar os produtos.')
        console.error('Erro ao carregar produtos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [customerId])


  const handlePriceUpdate = useCallback((productId: string, newPrice: number) => {
    setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, currentPrice: newPrice } : product)))
  }, [])

  const handleQuantityUpdate = useCallback((productId: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }))
  }, [])

  const handleBonusQuantityUpdate = useCallback((productId: string, bonusQuantity: number) => {
    setBonusQuantities((prev) => ({
      ...prev,
      [productId]: bonusQuantity,
    }))
  }, [])

  useEffect(() => {
    if (!customerId || !cartOrder) return

    const cartItems = products
      .map((product) => ({
        ...product,
        quantity: quantities[product.id] || 0,
        bonusQuantity: bonusQuantities[product.id] || 0,
      }))
      .filter((item) => item.quantity > 0 || item.bonusQuantity > 0)

    const parseCartOrder = JSON.parse(cartOrder)

    parseCartOrder.Items = cartItems

    localStorage.setItem(`CartOrders-${customerId}`, JSON.stringify(parseCartOrder))
  }, [quantities, bonusQuantities, products, customerId, cartOrder])

  const hasItemsInCart = useMemo(() => Object.values(quantities).some((qty) => qty > 0) || Object.values(bonusQuantities).some((qty) => qty > 0), [quantities, bonusQuantities])

  const handleFinishOrder = useCallback(() => {
    navigate('/finalizar-pedido')
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />
        <div className="container mx-auto px-4 py-4 max-w-md">
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <div className="container mx-auto px-4 py-4 max-w-md">
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-medium text-foreground">{client?.Client.corporate_name || 'Nome não disponível'}</h3>
            <p className="text-sm text-muted-foreground">{client?.Client.trade_name || 'Nome fantasia não informado'}</p>
            <p className="text-xs text-muted-foreground">CNPJ: {client?.Client.cnpj ? formatCNPJ(client.Client.cnpj).toString() : 'Não informado'}</p>
          </div>

          <div className={`space-y-3 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={quantities[product.id] || 0}
                  bonusQuantity={bonusQuantities[product.id] || 0}
                  onPriceUpdate={handlePriceUpdate}
                  onQuantityUpdate={handleQuantityUpdate}
                  onBonusQuantityUpdate={handleBonusQuantityUpdate}
                />
              ))
            ) : (
              <div className="text-center py-8">{loading ? <p>A carregar produtos...</p> : <p className="text-muted-foreground">Nenhum produto encontrado</p>}</div>
            )}
          </div>

          {hasItemsInCart && (
            <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
              <Button onClick={handleFinishOrder} className="w-full" size="lg">
                Finalizar Pedido
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Catalog
