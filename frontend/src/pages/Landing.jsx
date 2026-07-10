import { Link } from 'react-router-dom';

const roles = [
  {
    id: 'customer',
    title: 'Customer',
    desc: 'Order clean water delivered to your home or business',
    icon: '👤',
    color: 'blue',
    features: ['Place water orders', 'Track deliveries', 'Pay on delivery'],
  },
  {
    id: 'supplier',
    title: 'Supplier',
    desc: 'Register your water station and serve your community',
    icon: '🏪',
    color: 'green',
    features: ['Manage water inventory', 'Receive orders', 'Grow your business'],
  },
  {
    id: 'waterman',
    title: 'Waterman',
    desc: 'Deliver water and earn from every trip',
    icon: '🚚',
    color: 'orange',
    features: ['View delivery jobs', 'Update delivery status', 'Track earnings'],
  },
  {
    id: 'admin',
    title: 'Admin',
    desc: 'Oversee the entire Water Tuffune ecosystem',
    icon: '⚙️',
    color: 'purple',
    features: ['Manage users', 'Monitor all orders', 'Platform analytics'],
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-water-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">WT</div>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Water Tuffune</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100">About</Link>
              <Link to="/login" className="text-sm px-4 py-2 bg-water-600 text-white rounded-lg hover:bg-water-700 transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-water-600 via-water-700 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Clean Water,<br />
              <span className="text-cyan-200">Delivered to Your Doorstep</span>
            </h1>
            <p className="text-lg md:text-xl text-water-100 mb-8 max-w-2xl">
              Water Tuffune connects customers with trusted water suppliers and delivery watermen across Uganda.
              Access safe, clean water anytime — online or offline.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="px-6 py-3 bg-white text-water-700 font-semibold rounded-xl hover:bg-water-50 transition-colors">
                Get Started
              </Link>
              <Link to="/about" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Who Are You?</h2>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-xl mx-auto">Select your role to get started with Water Tuffune</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Link key={role.id} to={`/login?role=${role.id}`}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-water-200 transition-all group">
              <div className="text-4xl mb-4">{role.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{role.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">{role.desc}</p>
              <ul className="space-y-1.5">
                {role.features.map((f) => (
                  <li key={f} className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Why Water Tuffune?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '💧', title: 'Safe & Clean Water', desc: 'All suppliers are verified to provide safe, treated water from approved sources.' },
              { icon: '📱', title: 'Works Offline Too', desc: 'Use USSD codes to order water even without internet access or a smartphone.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Watermen in your area pick up and deliver directly to your home or business.' },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 dark:text-gray-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-water-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">WT</div>
            <span className="text-white font-semibold">Water Tuffune</span>
          </div>
          <p className="text-sm">Connecting Uganda to clean water — one delivery at a time.</p>
          <p className="text-xs mt-4">© 2026 Water Tuffune. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
