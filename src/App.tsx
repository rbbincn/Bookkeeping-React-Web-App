import { NavLink, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <header>
        <div className="container row" style={{justifyContent:'space-between'}}>
          <h1>Bookkeeping App</h1>
          <nav className="row">
            <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
            <NavLink to="/transactions" className={({isActive}) => isActive ? 'active' : ''}>Transactions</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
