import { useState, memo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Edit2, Check, X, Package2, Plus, Minus, Gift } from 'lucide-react'
import type { Product } from '@/services/productService'

interface ProductCardProps {
  product: Product
  quantity: number
  bonusQuantity?: number
  onPriceUpdate: (productId: string, newPrice: number) => void
  onQuantityUpdate: (productId: string, newQuantity: number) => void
  onBonusQuantityUpdate?: (productId: string, bonusQuantity: number) => void
}

const ProductCardComponent = memo(({ product, quantity, bonusQuantity = 0, onPriceUpdate, onQuantityUpdate, onBonusQuantityUpdate }: ProductCardProps) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [editPrice, setEditPrice] = useState((product.currentPrice ?? product.price ?? 0).toString())

  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  const [editQuantity, setEditQuantity] = useState(quantity.toString())

  const [isEditingBonus, setIsEditingBonus] = useState(false)
  const [editBonusQuantity, setEditBonusQuantity] = useState(bonusQuantity.toString())
  const [showBonusSection, setShowBonusSection] = useState(bonusQuantity > 0)

  useEffect(() => {
    setEditPrice((product.currentPrice ?? product.price ?? 0).toString())
  }, [product.currentPrice, product.price])

  useEffect(() => {
    setEditQuantity(quantity.toString())
  }, [quantity])

  useEffect(() => {
    setEditBonusQuantity(bonusQuantity.toString())
    if (bonusQuantity > 0) {
      setShowBonusSection(true)
    }
  }, [bonusQuantity])

  const handleSavePrice = () => {
    const newPrice = parseFloat(editPrice || '0')
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceUpdate(product.id, newPrice)
      setIsEditingPrice(false)
    }
  }

  const handleCancelEdit = () => {
    setEditPrice((product.currentPrice ?? product.price ?? 0).toString())
    setIsEditingPrice(false)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      onQuantityUpdate(product.id, newQuantity)
    }
  }

  const handleSaveQuantity = () => {
    const newQuantity = parseInt(editQuantity || '0')
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onQuantityUpdate(product.id, newQuantity)
      setIsEditingQuantity(false)
    }
  }

  const handleCancelQuantityEdit = () => {
    setEditQuantity(quantity.toString())
    setIsEditingQuantity(false)
  }

  const handleBonusQuantityChange = (newBonusQuantity: number) => {
    if (newBonusQuantity >= 0 && onBonusQuantityUpdate) {
      onBonusQuantityUpdate(product.id, newBonusQuantity)
    }
  }

  const handleSaveBonusQuantity = () => {
    const newBonusQuantity = parseInt(editBonusQuantity || '0')
    if (!isNaN(newBonusQuantity) && newBonusQuantity >= 0 && onBonusQuantityUpdate) {
      onBonusQuantityUpdate(product.id, newBonusQuantity)
      setIsEditingBonus(false)
    }
  }

  const handleCancelBonusEdit = () => {
    setEditBonusQuantity(bonusQuantity.toString())
    setIsEditingBonus(false)
  }

  const isPriceModified = product.currentPrice !== undefined && product.currentPrice !== product.price

  return (
    <Card className="w-full border border-border bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package2 className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-card-foreground truncate">{product.name}</h3>
              <Badge variant="default">Tapete Higienico</Badge>
            </div>
            <div className="flex gap-2 mb-2">
              {product.capacity && <Badge variant="outline">{product.capacity}</Badge>}
              {product.appearance && <Badge variant="outline">{product.appearance}</Badge>}
            </div>
            <div className="text-xs text-muted-foreground mb-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Código:</span>
                <span>{product.internal_code}</span>
                <span>•</span>
                <span>{product.pack_quantity} un/fardo</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {isEditingPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">R$</span>
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-20 h-8 text-sm" step="0.01" min="0" />
                  <Button size="sm" variant="ghost" onClick={handleSavePrice}>
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isPriceModified ? (
                    <>
                      <span className="text-lg font-semibold text-foreground">R$ {product.currentPrice!.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground line-through">R$ {product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-lg font-semibold text-foreground">R$ {(product.currentPrice ?? product.price ?? 0).toFixed(2)}</span>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingPrice(true)} className="ml-2 p-1">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Quantidade:</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 0} className="h-8 w-8 p-0">
                  <Minus className="h-4 w-4" />
                </Button>
                {isEditingQuantity ? (
                  <div className="flex items-center gap-1">
                    <Input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} className="w-16 h-8 text-center text-sm" min="0" />
                    <Button size="sm" variant="ghost" onClick={handleSaveQuantity}>
                      <Check className="h-3 w-3 text-success" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelQuantityEdit}>
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <span
                    className="min-w-[32px] text-center text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1"
                    onClick={() => setIsEditingQuantity(true)}
                  >
                    {quantity}
                  </span>
                )}
                <Button size="sm" variant="outline" onClick={() => handleQuantityChange(quantity + 1)} className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {onBonusQuantityUpdate && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Bonificação:</span>
                  {!showBonusSection && (
                    <Button size="sm" variant="ghost" onClick={() => setShowBonusSection(true)} className="h-7 px-2">
                      <Gift className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>

                {showBonusSection && (
                  <div className="w-full p-2 bg-accent/5 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        <Gift className="h-3 w-3 mr-1" />
                        Grátis
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowBonusSection(false)
                          if (bonusQuantity > 0) {
                            onBonusQuantityUpdate(product.id, 0)
                          }
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleBonusQuantityChange(bonusQuantity - 1)} disabled={bonusQuantity <= 0} className="h-8 w-8 p-0">
                        <Minus className="h-4 w-4" />
                      </Button>

                      {isEditingBonus ? (
                        <div className="flex items-center gap-1">
                          <Input type="number" value={editBonusQuantity} onChange={(e) => setEditBonusQuantity(e.target.value)} className="w-16 h-8 text-center text-sm" min="0" />
                          <Button size="sm" variant="ghost" onClick={handleSaveBonusQuantity}>
                            <Check className="h-3 w-3 text-success" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelBonusEdit}>
                            <X className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <span
                          className="min-w-[32px] text-center text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 py-1"
                          onClick={() => setIsEditingBonus(true)}
                        >
                          {bonusQuantity}
                        </span>
                      )}

                      <Button size="sm" variant="outline" onClick={() => handleBonusQuantityChange(bonusQuantity + 1)} className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ProductCardComponent.displayName = 'ProductCard'

export default ProductCardComponent
