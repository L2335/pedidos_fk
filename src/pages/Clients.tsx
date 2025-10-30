import { useState } from 'react'
import TopNavigation from '@/components/TopNavigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Building2, Calendar, Clock, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { getClientByCnpj, type Client } from '@/services/clientService'
import { formatCNPJ, formatCEP, formatIE } from '@/services/formatters.ts'
import RegisterClientForm from '@/components/NewClientForm'
import { lookupCnpj, type LookedUpClientData } from '@/services/clientService'

const Clients = () => {
  const [cnpj, setCnpj] = useState('')
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [clientNotFound, setClientNotFound] = useState(false)
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [initialClientData, setInitialClientData] = useState<LookedUpClientData | null>(null)

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setCnpj(formatted)
    setClient(null)
    setClientNotFound(false)
  }

  const handleClientRegister = async (newClient: Client) => {
    setIsRegisterDialogOpen(false)
    setClientNotFound(false)
    const formattedCnpj = formatCNPJ(newClient.cnpj || '')
    setCnpj(formattedCnpj)

    try {
      setLoading(true)
      const cnpjNumbers = (newClient.cnpj || '').replace(/\D/g, '')
      const getClient = await getClientByCnpj(cnpjNumbers)
      setClient(getClient)
      toast.success('Cliente cadastrado com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao cadastrar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRegisterForm = async () => {
    const cnpjNumbers = cnpj.replace(/\D/g, '')
    if (cnpjNumbers.length !== 14) {
      toast.error('Digite um CNPJ válido com 14 dígitos.')
      return
    }
    setLoading(true)
    try {
      const clientData = await lookupCnpj(cnpjNumbers)
      setInitialClientData(clientData)
      setIsRegisterDialogOpen(true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Não foi possível buscar dados para este CNPJ.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
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
      const getClient = await getClientByCnpj(cnpjNumbers)
      setClient(getClient)
    } catch (error: any) {
      if (error.response?.status === 404) {
        setClientNotFound(true)
        toast.error('Cliente não encontrado!')
      } else {
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao buscar o cliente.'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Consultar Clientes</h1>
          <p className="text-muted-foreground">Consulte informações dos clientes cadastrados</p>
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
              <Input id="cnpj" placeholder="00.000.000/0000-00" value={cnpj} onChange={handleCNPJChange} maxLength={18} disabled={loading} />
            </div>
            <Button onClick={consultClient} disabled={loading} className="w-full">
              {loading ? 'Consultando...' : 'Consultar Cliente'}
            </Button>
            {clientNotFound && (
              <Button onClick={handleOpenRegisterForm} disabled={loading} variant="outline" className="w-full mt-4">
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Novo Cliente
              </Button>
            )}
            <RegisterClientForm open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen} initialData={initialClientData} onClientRegister={handleClientRegister} />
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Buscando cliente...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {client && !loading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium">Razão Social</Label>
                  <p className="text-sm text-muted-foreground">{client.corporate_name || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nome Fantasia</Label>
                  <p className="text-sm text-muted-foreground">{client.trade_name || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CNPJ</Label>
                  <p className="text-sm text-muted-foreground">{client.cnpj ? formatCNPJ(client.cnpj) : 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Inscrição Estadual</Label>
                  <p className="text-sm text-muted-foreground">{client.state_registration ? formatIE(client.state_registration) : 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CEP</Label>
                  <p className="text-sm text-muted-foreground">{client.postal_code ? formatCEP(client.postal_code) : 'Não informado'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <p className="text-sm text-muted-foreground">{client.state || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cidade</Label>
                    <p className="text-sm text-muted-foreground">{client.city || 'Não informado'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Bairro</Label>
                  <p className="text-sm text-muted-foreground">{client.neighborhood || 'Não informado'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Endereço</Label>
                    <p className="text-sm text-muted-foreground">{client.street || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Número</Label>
                    <p className="text-sm text-muted-foreground">{client.number || 'S/N'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Complemento</Label>
                  <p className="text-sm text-muted-foreground">{client.address_complement || 'Não informado'}</p>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium">Último Pedido</Label>
                        <p className="text-sm text-muted-foreground">-----</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium">Prazo de Pagamento</Label>
                        <p className="text-sm text-muted-foreground">{client.payment_term || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Clients
