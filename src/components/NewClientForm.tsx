import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { registerClient, type NewClientData, type LookedUpClientData } from '@/services/clientService'
import { formatCNPJ, formatCEP } from '@/services/formatters'

interface RegisterClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: LookedUpClientData | null
  onClientRegister: (cliente: any) => void
}

const RegisterClientForm = ({ open, onOpenChange, initialData, onClientRegister }: RegisterClientFormProps) => {
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [formData, setFormData] = useState<Partial<NewClientData>>({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.corporate_name || !formData.cnpj || !formData.postal_code) {
      toast.error('Razão Social, CNPJ e CEP são obrigatórios.')
      return
    }

    setLoadingSubmit(true)

    try {
      const finalClientData: NewClientData = {
        cnpj: String(formData.cnpj).replace(/\D/g, ''),
        corporate_name: formData.corporate_name,
        postal_code: String(formData.postal_code).replace(/\D/g, ''),
        state: formData.state || '',
        city: formData.city || '',
        neighborhood: formData.neighborhood || '',
        street: formData.street || '',
        number: formData.number || '',
        payment_term: formData.payment_term || 'A combinar',
        trade_name: formData.trade_name ?? '',
        address_complement: formData.address_complement ?? '',
      }

      const newClient = await registerClient(finalClientData)

      onClientRegister(newClient)
      onOpenChange(false)
      toast.success('Cliente cadastrado com sucesso!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar cliente.'
      toast.error(errorMessage)
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Cadastrar Novo Cliente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input id="cnpj" name="cnpj" value={formatCNPJ(formData.cnpj || '')} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state_registration">Inscrição Estadual</Label>
            <Input id="state_registration" name="state_registration" onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corporate_name">Razão Social *</Label>
            <Input id="corporate_name" name="corporate_name" value={formData.corporate_name || ''} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trade_name">Nome Fantasia</Label>
            <Input id="trade_name" name="trade_name" value={formData.trade_name || ''} onChange={handleInputChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">CEP *</Label>
              <Input id="postal_code" name="postal_code" value={formatCEP(formData.postal_code || '')} onChange={handleInputChange} maxLength={9} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input id="state" name="state" value={formData.state || ''} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" name="city" value={formData.city || ''} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input id="neighborhood" name="neighborhood" value={formData.neighborhood || ''} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input id="street" name="street" value={formData.street || ''} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input id="number" name="number" value={formData.number || ''} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_complement">Complemento</Label>
            <Input id="address_complement" name="address_complement" value={formData.address_complement || ''} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_term">Prazo de Pagamento *</Label>
            <Input id="payment_term" name="payment_term" value={formData.payment_term || ''} onChange={handleInputChange} required />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loadingSubmit} className="flex-1">
              {loadingSubmit ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RegisterClientForm
