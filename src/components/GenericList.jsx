import { useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../api'

export default function GenericList({ resource, label }) {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE_URL}/${resource}/`)
        if (!response.ok) throw new Error(`Failed to load ${label.toLowerCase()}`)
        setItems(await response.json())
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [resource, label])

  const fields = useMemo(() => {
    if (items.length === 0) return []
    return Object.keys(items[0]).filter((key) => key !== 'id')
  }, [items])

  return (
    <section>
      <h1>{label}</h1>
      {error && <p className="error">{error}</p>}
      <p>Total: {items.length}</p>
      <table>
        <thead>
          <tr>{fields.map((field) => <th key={field}>{field}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}> {fields.map((field) => <td key={field}>{String(item[field] ?? '')}</td>)} </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
