import { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js'
import { API_BASE_URL } from '../api'

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ customers: 0, products: 0, sales: 0, expenses: 0, warehouses: 0 })
  const [error, setError] = useState(null)
  const lineChartRef = useRef(null)
  const pieChartRef = useRef(null)
  const lineChartInstance = useRef(null)
  const pieChartInstance = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load dashboard metrics')
        const data = await res.json()
        setMetrics({
          customers: data.customers ?? 0,
          products: data.products ?? 0,
          sales: data.sales ?? 0,
          expenses: data.expenses ?? 0,
          warehouses: data.warehouses ?? 0,
        })
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!lineChartRef.current || !pieChartRef.current) return

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const earningsData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 1500) + 200)
    const expensesData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000) + 100)

    if (lineChartInstance.current) lineChartInstance.current.destroy()
    lineChartInstance.current = new Chart(lineChartRef.current, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { label: 'Sales', data: earningsData, borderColor: 'rgba(78,115,223,1)', backgroundColor: 'rgba(78,115,223,0.05)', fill: true, lineTension: 0.3 },
          { label: 'Expenses', data: expensesData, borderColor: 'rgba(28,200,138,1)', backgroundColor: 'rgba(28,200,138,0.05)', fill: true, lineTension: 0.3 },
        ],
      },
      options: { maintainAspectRatio: false, responsive: true, legend: { display: true }, scales: { xAxes: [{ gridLines: { display: false } }], yAxes: [{ ticks: { beginAtZero: true } }] } },
    })

    if (pieChartInstance.current) pieChartInstance.current.destroy()
    pieChartInstance.current = new Chart(pieChartRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Product 1', 'Product 2', 'Product 3'],
        datasets: [{ data: [45, 30, 25], backgroundColor: ['#4e73df','#1cc88a','#36b9cc'], hoverBackgroundColor: ['#2e59d9','#17a673','#2c9faf'], hoverBorderColor: 'rgba(234,236,244,1)' }],
      },
      options: { maintainAspectRatio: false, responsive: true, legend: { position: 'bottom' } },
    })

    return () => {
      if (lineChartInstance.current) lineChartInstance.current.destroy()
      if (pieChartInstance.current) pieChartInstance.current.destroy()
    }
  }, [metrics])

  const profitLoss = (metrics.sales - metrics.expenses).toFixed(2)

  return (
    <div>
      <section className="row">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Avg Sales / Month</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">N {(metrics.sales / 12).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Annual Sales</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">N {metrics.sales}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Monthly Expenses</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">N {metrics.expenses}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Monthly Profit/Loss</div>
                  <div className={`h5 mb-0 font-weight-bold ${profitLoss >= 0 ? 'text-gray-800' : 'text-danger'}`}>N {profitLoss}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="row">
        <div className="col-xl-8 col-lg-7">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Year Sales Overview</h6>
            </div>
            <div className="card-body">
              <div className="chart-area" style={{ minHeight: '250px' }}>
                <canvas ref={lineChartRef} id="myAreaChart" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-lg-5">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Best selling products</h6>
            </div>
            <div className="card-body">
              <div className="chart-pie pt-4 pb-2" style={{ minHeight: '250px' }}>
                <canvas ref={pieChartRef} id="myPieChart" />
              </div>
              <div className="mt-4 text-center small">
                <div className="mr-2">
                  <i className="fa fa-circle text-primary mr-2"></i>Product 1
                </div>
                <div className="mr-2 mt-2">
                  <i className="fa fa-circle text-success mr-2"></i>Product 2
                </div>
                <div className="mr-2 mt-2">
                  <i className="fa fa-circle text-info mr-2"></i>Product 3
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
