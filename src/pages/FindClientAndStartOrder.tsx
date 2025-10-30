import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavigation from '@/components/TopNavigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Building2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getClientByCnpj, type Client } from '@/services/clientService'
import { formatCNPJ, formatCEP, formatIE } from '@/services/formatters'
import { useAuth } from '@/context/AuthContext'

const FindClientAndStartOrder = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [cnpj, setCnpj] = useState('')
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [clientNotFound, setClientNotFound] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cnpjFormatted = formatCNPJ(e.target.value)
    setCnpj(cnpjFormatted)
  }

  const consultClient = async () => {
    const cnpjNumbers = cnpj.replace(/\D/g, '')
    if (cnpjNumbers.length !== 14) {
      toast.error('Digite um CNPJ válido com 14 dígitos.')
      return
    }

    setLoading(true)
    setClient(null)
    setClientNotFound(false)

    try {
      const foundClient = await getClientByCnpj(cnpjNumbers)
      setClient(foundClient)
      toast.success('Cliente encontrado com sucesso!')
    } catch (error: any) {
      setClient(null)
      if (error.response?.status === 404) {
        setClientNotFound(true)
        toast.error('Cliente não cadastrado. Cadastre-o na página de "Cadastro e consulta de clientes".')
      } else {
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao buscar o cliente.'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmClientAndProceed = () => {
    if (!client) return

    let orders = JSON.parse(localStorage.getItem('CartOrders') || '[]')
    const newOrder = { Client: client, Items: [] }

    orders.push(newOrder)

    localStorage.setItem(`CartOrders-${client.id}`, JSON.stringify(newOrder))

    toast.success(`Cliente "${client.trade_name || client.corporate_name}" confirmado!`)
    navigate(`/catalogo/${client.id}`)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Realizar Pedido</h1>
          <p className="text-muted-foreground">Consulte o cliente pelo CNPJ para iniciar o pedido</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Consultar Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" value={cnpj} onChange={handleCNPJChange} maxLength={18} />
            </div>
            <Button onClick={consultClient} disabled={loading} className="w-full">
              {loading ? 'Consultando...' : 'Consultar Cliente'}
            </Button>
            {clientNotFound && <p className="text-sm text-destructive text-center mt-2">Cliente não encontrado. Vá para a página de "Cadastrar clientes" para cadastrá-lo.</p>}
          </CardContent>
        </Card>

        {client && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium">Razão Social</Label>
                  <p className="text-sm text-muted-foreground">{client.corporate_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nome Fantasia</Label>
                  <p className="text-sm text-muted-foreground">{client.trade_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CNPJ</Label>
                  <p className="text-sm text-muted-foreground">{formatCNPJ(client.cnpj)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Inscrição Estadual</Label>
                  <p className="text-sm text-muted-foreground">{formatIE(client.state_registration)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CEP</Label>
                  <p className="text-sm text-muted-foreground">{formatCEP(client.postal_code)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <p className="text-sm text-muted-foreground">{client.state}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cidade</Label>
                    <p className="text-sm text-muted-foreground">{client.city}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Bairro</Label>
                  <p className="text-sm text-muted-foreground">{client.neighborhood}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Endereço</Label>
                    <p className="text-sm text-muted-foreground">{client.street}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Número</Label>
                    <p className="text-sm text-muted-foreground">{client.number}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Complemento</Label>
                  <p className="text-sm text-muted-foreground">{client.address_complement || ''}</p>
                </div>
              </div>
              <Button onClick={confirmClientAndProceed} className="w-full mt-6">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Cliente e Selecionar Produtos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FindClientAndStartOrder
