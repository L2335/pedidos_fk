import { useState, useMemo, useEffect, useCallback, useTransition } from 'react'
import TopNavigation from '@/components/TopNavigation'
import SearchBar from '@/components/SearchBar'
import AdvancedFilters from '@/components/AdvancedFilter'
import ProductCard from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCustomerCatalogById, getProducts, type Product, type Customer } from '@/services/productService'
import { formatCNPJ } from '@/services/formatters'

const Catalog = () => {
  const [isPending, startTransition] = useTransition()
  const [products, setProducts] = useState<Product[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState({
    name: '',
    category: 'Todos',
    apparence: 'Todos',
    capacity: 'Todos',
    internal_code: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [bonusQuantities, setBonusQuantities] = useState<Record<string, number>>({})
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [selectedNewProduct, setSelectedNewProduct] = useState('')
  const { customerId } = useParams<{ customerId: string }>()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const availableCategories = useMemo(() => [...new Set(products.map((p) => p.product_category ?? ''))].filter(Boolean), [products])
  const availableApparences = useMemo(() => [...new Set(products.map((p) => p.appearance ?? ''))].filter(Boolean), [products])
  const availableCapacities = useMemo(() => [...new Set(products.map((p) => p.capacity ?? ''))].filter(Boolean), [products])

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

        const data = await getCustomerCatalogById(customerId!)
        const availableProductsToAdd = await getProducts()

        if (!data || !data.products) {
          throw new Error('Dados de produtos inválidos')
        }

        setProducts(data.products)

        const existingProductIds = new Set(data.products.map((p) => p.id))
        const filteredAvailableProducts = availableProductsToAdd.filter((product) => !existingProductIds.has(product.id))
        setAvailableProducts(filteredAvailableProducts)
      } catch (err) {
        setError('Não foi possível carregar os produtos.')
        console.error('Erro ao carregar produtos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [customerId])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const nameMatch = !filters.name || (product.name?.toLowerCase() || '').includes(filters.name.toLowerCase())
      const categoryMatch = filters.category === 'Todos' || product.product_category === filters.category
      const apparenceMatch = filters.apparence === 'Todos' || product.appearance === filters.apparence
      const capacityMatch = filters.capacity === 'Todos' || product.capacity === filters.capacity
      const codeMatch = !filters.internal_code || (product.internal_code?.toLowerCase() || '').includes(filters.internal_code.toLowerCase())
      return nameMatch && categoryMatch && apparenceMatch && capacityMatch && codeMatch
    })
  }, [products, filters])

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

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    startTransition(() => {
      setFilters(newFilters)
    })
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

  const handleAddNewProduct = useCallback(() => {
    if (!selectedNewProduct) return
    const productTemplate = availableProducts.find((p) => p.id === selectedNewProduct)
    if (!productTemplate) return
    const newProduct: Product = {
      ...productTemplate,
      id: productTemplate.id,
      currentPrice: productTemplate.price,
    }
    setProducts((prev) => [...prev, newProduct])
    setAvailableProducts((prev) => prev.filter((p) => p.id !== selectedNewProduct))
    setSelectedNewProduct('')
    setIsAddProductOpen(false)
  }, [availableProducts, selectedNewProduct])

  const filteredAvailableProducts = useMemo(() => {
    if (!searchTerm) return availableProducts
    const search = searchTerm.toLowerCase()
    return availableProducts.filter((produto) => (produto.name?.toLowerCase() || '').includes(search) || (produto.internal_code?.toLowerCase() || '').includes(search))
  }, [availableProducts, searchTerm])

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
          <AdvancedFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableCategories={availableCategories}
            availableApparance={availableApparences}
            availableCapacity={availableCapacities}
          />
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Produto ({availableProducts.length} disponíveis)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedNewProduct} onValueChange={setSelectedNewProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nome, código ou descrição..." />
                    {filteredAvailableProducts.length === 0 && <div className="p-2 text-sm text-muted-foreground">Nenhum produto encontrado</div>}
                    {filteredAvailableProducts.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.name} {produto.internal_code ? `- ${produto.internal_code}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button disabled={!selectedNewProduct} onClick={handleAddNewProduct}>
                    Adicionar
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className={`space-y-3 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
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
