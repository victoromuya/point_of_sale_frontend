import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { apiFetch } from '../utils/ApiFetch'

export default function SaleForm() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [selectedProductName, setSelectedProductName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [wharehouse, setWharehouse] = useState('')
  const [warehouses, setWarehouses] = useState([])
  const [taxPercentage, setTaxPercentage] = useState(0)
  const [amountPaid, setAmountPaid] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [credit, setCredit] = useState('paid')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/?Status=ACTIVE`)
        if (!response.ok) throw new Error('Failed to load products')
        setProducts(await response.json())
      } catch (err) {
        setError(err.message)
      }
    }
    const loadWarehouses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/warehouses/`)
        if (!response.ok) throw new Error('Failed to load warehouses')
        const data = await response.json()
        setWarehouses(data)
        if (data.length > 0) {
          setWharehouse((prev) => prev || data[0].location_name)
        }
      } catch (err) {
        setError(err.message)
      }
    }
    loadProducts()
    loadWarehouses()
  }, [])

  const selectedProduct = useMemo(() => products.find((p) => p.name === selectedProductName), [products, selectedProductName])

  const productStockInCart = useMemo(() => {
    if (!selectedProduct) return 0
    const item = cart.find((row) => row.productId === selectedProduct.id)
    return item?.quantity ?? 0
  }, [cart, selectedProduct])

  const availableStock = selectedProduct ? selectedProduct.quantity - productStockInCart : 0
  const unitPrice = selectedProduct?.price ?? 0
  const itemTotal = quantity * unitPrice

  const subtotal = cart.reduce((sum, line) => sum + line.total, 0)
  const taxAmount = (subtotal * Number(taxPercentage || 0)) / 100
  const grandTotal = subtotal + taxAmount
  const changeAmount = Number(amountPaid || 0) - grandTotal

  const addToCart = () => {
    if (!selectedProduct) {
      setError('Please choose a valid product from the list')
      return
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1')
      return
    }
    if (quantity > availableStock) {
      setError(`Quantity cannot exceed available stock (${availableStock})`)
      return
    }

    setError(null)
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === selectedProduct.id)
      if (existing) {
        const updated = prev.map((item) => {
          if (item.productId === selectedProduct.id) {
            const qty = item.quantity + quantity
            return { ...item, quantity: qty, total: qty * unitPrice }
          }
          return item
        })
        return updated
      }
      return [...prev, { productId: selectedProduct.id, name: selectedProduct.name, quantity, price: unitPrice, total: itemTotal }]
    })
    setQuantity(1)
    setSelectedProductName('')
  }

  const removeCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const clearCart = () => {
    setCart([])
    setError(null)
    setMessage(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (cart.length === 0) {
      setError('Add at least one product to the sale')
      return
    }
    if (!wharehouse) {
      setError('Wharehouse is required')
      return
    }
    if (amountPaid < 0) {
      setError('Amount paid must be valid')
      return
    }

    const payload = {
      product: 'Multiple products',
      wharehouse,
      sub_total: subtotal,
      grand_total: grandTotal,
      tax_amount: taxAmount,
      tax_percentage: taxPercentage,
      amount_payed: amountPaid,
      amount_change: changeAmount,
      payment_method: paymentMethod,
      credit,
    }

    try {
      const saleRes = await apiFetch(`${API_BASE_URL}/sales/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!saleRes.ok) {
        const text = await saleRes.text()
        throw new Error(text || 'Sale creation failed')
      }
      const saleData = await saleRes.json()

      await Promise.all(cart.map(async (item) => {
        await fetch(`${API_BASE_URL}/sale-details/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sale: saleData.id,
            product: item.productId,
            price: item.price,
            quantity: item.quantity,
            total_detail: item.total,
          }),
        })
      }))

      setMessage('Sale saved successfully!')
      setError(null)
      setCart([])
      setWharehouse('')
      setTaxPercentage(0)
      setAmountPaid(0)
      setPaymentMethod('cash')
      setCredit('paid')
      setQuantity(1)
      setSelectedProductName('')
      setTimeout(() => navigate('/sales'), 1000)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/sales')}>Back to sales</button>
      </div>

      <div className="card shadow mb-12">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Create New Sale</h6>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <div className="form-row align-items-end">
            <div className="form-group col-md-5">
              <label>Search product</label>
              <input
                list="product-list"
                className="form-control"
                value={selectedProductName}
                onChange={(e) => setSelectedProductName(e.target.value)}
                placeholder="Start typing product name..."
              />
              <datalist id="product-list">
                {products.map((p) => (
                  <option key={p.id} value={p.name}>{`${p.name} (stock: ${p.quantity})`}</option>
                ))}
              </datalist>
            </div>
            <div className="form-group col-md-2">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="form-group col-md-2">
              <label>Unit price</label>
              <input className="form-control" type="number" value={unitPrice} readOnly />
            </div>
            <div className="form-group col-md-2">
              <label>Current stock</label>
              <input className="form-control" type="number" value={availableStock} readOnly />
            </div>
            <div className="form-group col-md-1">
              <button type="button" className="btn btn-primary w-100" onClick={addToCart}>Add</button>
            </div>
          </div>

          <div className="mb-3">
            <button type="button" className="btn btn-danger" onClick={clearCart} disabled={!cart.length}>Delete all products</button>
          </div>

          <div className="table-responsive mb-3">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={item.productId}>
                    <td>{idx + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>{item.total}</td>
                    <td>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeCartItem(item.productId)}>Remove</button>
                    </td>
                  </tr>
                ))}
                {!cart.length && (
                  <tr><td colSpan="6" className="text-center">No products added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group col-md-3">
                <label>Wharehouse</label>
                {warehouses.length ? (
                  <select className="form-control" value={wharehouse} onChange={(e) => setWharehouse(e.target.value)} required>
                    <option value="" disabled hidden>Select warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.location_name}>{w.location_name}</option>
                    ))}
                  </select>
                ) : (
                  <input className="form-control" value={wharehouse} onChange={(e) => setWharehouse(e.target.value)} placeholder="No warehouses. Create one first" required />
                )}
              </div>
              <div className="form-group col-md-2">
                <label>Tax %</label>
                <input className="form-control" type="number" value={taxPercentage} onChange={(e) => setTaxPercentage(Number(e.target.value))} min="0" />
              </div>
              <div className="form-group col-md-2">
                <label>Amount paid</label>
                <input className="form-control" type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} min="0" />
              </div>
              <div className="form-group col-md-2">
                <label>Payment method</label>
                <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>
              <div className="form-group col-md-2">
                <label>Sale type</label>
                <select className="form-control" value={credit} onChange={(e) => setCredit(e.target.value)}>
                  <option value="paid">Paid</option>
                  <option value="on_credit">On Credit</option>
                </select>
              </div>
            </div>

            <div className="form-row mb-3">
              <div className="col-md-3"><strong>Subtotal:</strong> {subtotal.toFixed(2)}</div>
              <div className="col-md-3"><strong>Tax Amount:</strong> {taxAmount.toFixed(2)}</div>
              <div className="col-md-3"><strong>Grand Total:</strong> {grandTotal.toFixed(2)}</div>
              <div className="col-md-3"><strong>Change:</strong> {changeAmount.toFixed(2)}</div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={cart.length === 0}>Save sale</button>
          </form>
        </div>
      </div>
    </div>
  )
}
