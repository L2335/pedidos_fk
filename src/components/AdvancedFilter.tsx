import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Filter, X } from 'lucide-react'

interface Filters {
  name: string
  category: string
  apparence: string
  capacity: string
  internal_code: string
}

interface AdvancedFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  availableCategories: string[]
  availableApparance: string[]
  availableCapacity: string[]
}

const AdvancedFilters = ({ filters, onFiltersChange, availableCategories = [], availableApparance = [], availableCapacity = [] }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<Filters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    const clearedFilters: Filters = {
      name: '',
      category: 'Todos',
      apparence: 'Todos',
      capacity: 'Todos',
      internal_code: '',
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setIsOpen(false)
  }

  const hasActiveFilters =
    localFilters.name || localFilters.category !== 'Todos' || localFilters.apparence !== 'Todos' || localFilters.capacity !== 'Todos' || localFilters.internal_code

  const categoryOptions = useMemo(() => availableCategories.filter((cat) => cat && cat !== 'Todos'), [availableCategories])
  const appearanceOptions = useMemo(() => availableApparance.filter((a) => a && a !== 'Todos'), [availableApparance])
  const capacityOptions = useMemo(() => availableCapacity.filter((c) => c && c !== 'Todos'), [availableCapacity])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="filter-nome" className="text-sm font-medium mb-2 block">
              Nome do Produto
            </label>
            <Input id="filter-nome" placeholder="Digite o nome..." value={localFilters.name} onChange={(e) => setLocalFilters({ ...localFilters, name: e.target.value })} />
          </div>

          <div>
            <label htmlFor="filter-categoria" className="text-sm font-medium mb-2 block">
              Categoria
            </label>
            <Select value={localFilters.category} onValueChange={(value) => setLocalFilters({ ...localFilters, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="filter-cor" className="text-sm font-medium mb-2 block">
              Cor
            </label>
            <Select value={localFilters.apparence} onValueChange={(value) => setLocalFilters({ ...localFilters, apparence: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {appearanceOptions.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="filter-capacity" className="text-sm font-medium mb-2 block">
              Litragem
            </label>
            <Select value={localFilters.capacity} onValueChange={(value) => setLocalFilters({ ...localFilters, capacity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {capacityOptions.map((volume) => (
                  <SelectItem key={volume} value={volume}>
                    {volume}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="filter-codigo" className="text-sm font-medium mb-2 block">
              Código
            </label>
            <Input
              id="filter-codigo"
              placeholder="Digite o código..."
              value={localFilters.internal_code}
              onChange={(e) => setLocalFilters({ ...localFilters, internal_code: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleApplyFilters} className="flex-1">
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={handleClearFilters} className="flex-1" disabled={!hasActiveFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdvancedFilters
