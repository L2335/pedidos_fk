import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavigation from '@/components/TopNavigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Check, Package2, User, Gift, Loader2 } from 'lucide-react'
import { type Product } from '@/services/productService'
import { formatCNPJ, formatCEP } from '@/services/formatters'
import { sendOrderService } from '@/services/orderService.ts'

interface Customer {
  id: string
  cnpj: string
  state_registration: string
  corporate_name: string
  trade_name: string
  postal_code: string
  state: string
  city: string
  neighborhood: string
  number: string
  street: string
  salesperson?: string
  address_complement?: string
  payment_term: string
}

interface CartItem extends Product {
  quantity: number
  bonusQuantity?: number
}

interface CartOrderStorage {
  Client: Customer | string
  Items: CartItem[]
}

const SendOrder = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null)
  const [paymentTerm, setPaymentTerm] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let clientKey: string | null = localStorage.getItem('currentCustomerKey')

    if (!clientKey) {
      navigate('/realizar-pedido')
      return
    }

    const orderKey = `CartOrders-${clientKey.replace(/"/g, '')}`
    const stored = localStorage.getItem(orderKey)
    if (!stored) {
      navigate('/carrinho')
      return
    }

    let parsed: CartOrderStorage | null = null
    try {
      parsed = JSON.parse(stored)
    } catch {
      setError('Não foi possível ler os dados do pedido salvo.')
      navigate('/realizar-pedido')
      return
    }

    if (!parsed || !parsed.Client) {
      setError('Cliente não encontrado no pedido salvo.')
      navigate('/realizar-pedido')
      return
    }

    const client: Customer = typeof parsed.Client === 'string' ? JSON.parse(parsed.Client) : parsed.Client

    setSelectedClient(client)
    setPaymentTerm(client.payment_term || '')

    const items = Array.isArray(parsed.Items) ? parsed.Items : []
    if (items.length === 0) {
      setError('Adicione produtos para prosseguir com o pedido.')
      navigate(`/catalogo/${client.id}`)
      return
    }
    setCartItems(items)
  }, [navigate])

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.currentPrice || item.price) * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalBonusItems = () => {
    return cartItems.reduce((total, item) => total + (item.bonusQuantity || 0), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentTerm.trim()) {
      setError('O prazo de pagamento é obrigatório.')
      return
    }

    if (!selectedClient) {
      setError('Cliente não selecionado.')
      return
    }

    if (cartItems.length === 0) {
      setError('O carrinho está vazio.')
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const payload = {
        customer: selectedClient,
        total: getTotalPrice(),
        paymentTerm: paymentTerm,
        notes: notes,
        items: cartItems,
      }

      await sendOrderService(payload)

      const clientKey = selectedClient.id
      localStorage.removeItem(`CartOrders-${clientKey}`)
      localStorage.removeItem('currentCustomerKey')

      setShowConfirmation(true)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Ocorreu um erro ao enviar o pedido. Tente novamente.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewOrderRedirect = () => {
    setShowConfirmation(false)
    navigate('/realizar-pedido')
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation />

        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-success" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Pedido Enviado!</h2>
            <p className="text-muted-foreground mb-6">Seu pedido foi recebido e será processado em breve.</p>

            <Card className="mb-6 text-left">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedClient && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Razão Social:</span>
                      <span className="font-medium">{selectedClient.corporate_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nome Fantasia:</span>
                      <span className="font-medium">{selectedClient.trade_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CNPJ:</span>
                      <span className="font-medium">{formatCNPJ(selectedClient.cnpj)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Endereço:</span>
                      <span className="font-medium text-right">
                        {selectedClient.street}, {selectedClient.number} - {selectedClient.neighborhood}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">CEP:</span>
                      <span className="font-medium">{formatCEP(selectedClient.postal_code)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Cidade/UF:</span>
                      <span className="font-medium">
                        {selectedClient.city}/{selectedClient.state}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Prazo de Pagamento:</span>
                      <span className="font-medium">{paymentTerm}</span>
                      
                    <div className="border-t pt-3" />
                  </>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total de itens:</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                {getTotalBonusItems() > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Gift className="h-4 w-4 text-green-600" />
                      Bonificação:
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {getTotalBonusItems()} itens
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span className="text-primary">R$ {getTotalPrice().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleNewOrderRedirect} className="w-full" size="lg">
              Realizar Novo Pedido
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Finalizar Pedido</h2>
          <p className="text-sm text-muted-foreground">Complete as informações para confirmar seu pedido</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              Resumo do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div key={item.id} className={index < cartItems.length - 1 ? 'pb-3 border-b' : 'pb-3'}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">
                        {item.quantity}x R$ {(item.currentPrice || item.price).toFixed(2)}
                      </p>
                      {(item.bonusQuantity ?? 0) > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Gift className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">+{item.bonusQuantity} bonificação</span>
                        </div>
                      )}
                    </div>
                    <span className="font-medium">R$ {((item.currentPrice || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <div className="pt-3 space-y-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total de itens:</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                {getTotalBonusItems() > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Gift className="h-4 w-4 text-green-600" />
                      Bonificação:
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {getTotalBonusItems()} itens
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">R$ {getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedClient && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Razão Social:</span>
                  <span className="font-medium">{selectedClient.corporate_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nome Fantasia:</span>
                  <span className="font-medium">{selectedClient.trade_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CNPJ:</span>
                  <span className="font-medium">{formatCNPJ(selectedClient.cnpj)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-medium text-right">
                    {selectedClient.street}, {selectedClient.number} - {selectedClient.neighborhood}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">CEP:</span>
                  <span className="font-medium">{formatCEP(selectedClient.postal_code)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Cidade/UF:</span>
                  <span className="font-medium">
                    {selectedClient.city}/{selectedClient.state}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              Finalizar Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Prazo de Pagamento <span className="text-destructive">*</span>
                </Label>
                <Input id="deadline" type="text" value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} placeholder="Ex: 30 dias" required disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais sobre o pedido..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Confirmar Pedido
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SendOrder
