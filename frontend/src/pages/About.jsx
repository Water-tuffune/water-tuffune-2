import { Link } from 'react-router-dom';

const steps = [
  { icon: '📱', title: '1. Place Your Order', desc: 'Order through the app or dial *165# on any phone. Select your water type, quantity, and delivery address.' },
  { icon: '🏪', title: '2. Supplier Prepares', desc: 'A nearby water station receives your order and prepares clean, safe water from approved sources.' },
  { icon: '🚚', title: '3. Waterman Delivers', desc: 'A delivery waterman picks up your order and brings it directly to your doorstep.' },
  { icon: '💧', title: '4. Enjoy Clean Water', desc: 'Pay on delivery via cash or mobile money. Fresh water delivered right to you!' },
];

const roles = [
  {
    title: 'Customers',
    icon: '👤',
    desc: 'Individuals, households, and businesses who need clean water delivered to their location.',
    benefits: ['Order from any phone', 'Track delivery in real-time', 'Pay cash or mobile money', 'No minimum order'],
  },
  {
    title: 'Suppliers',
    icon: '🏪',
    desc: 'Water station owners with treated, safe water ready for distribution to the community.',
    benefits: ['Receive orders digitally', 'Manage your inventory', 'Grow your customer base', 'Set your own prices'],
  },
  {
    title: 'Watermen',
    icon: '🚚',
    desc: 'Delivery riders and drivers who transport water from suppliers to customers.',
    benefits: ['Flexible working hours', 'Earn per delivery', 'Choose your service area', 'Get paid weekly'],
  },
];

const values = [
  { icon: '💧', title: 'Safe Water', desc: 'All water sources are verified and treated to meet health standards.' },
  { icon: '🌍', title: 'For All Uganda', desc: 'Serving urban and rural communities across all districts.' },
  { icon: '🤝', title: 'Local Economy', desc: 'Supporting local water businesses and creating delivery jobs.' },
  { icon: '📱', title: 'No Internet Needed', desc: 'USSD access ensures everyone can order, regardless of connectivity.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-water-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">WT</div>
            <span className="font-bold text-gray-900 dark:text-gray-100">Water Tuffune</span>
          </Link>
          <Link to="/login" className="text-sm px-4 py-2 bg-water-600 text-white rounded-lg hover:bg-water-700 transition-colors">Get Started</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">How Water Tuffune Works</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
            Water Tuffune is a platform that connects customers, water suppliers, and delivery watermen
            across Uganda to ensure everyone has access to clean, safe water.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">From Order to Doorstep</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Who We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-3xl mb-3">{role.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{role.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">{role.desc}</p>
                <ul className="space-y-1.5">
                  {role.benefits.map((b) => (
                    <li key={b} className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                      <span className="text-green-500">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <div className="text-3xl mb-2">{v.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center bg-gradient-to-r from-water-600 to-water-800 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-water-100 mb-6 max-w-md mx-auto">Join Water Tuffune today and be part of bringing clean water to every doorstep in Uganda.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/login?role=customer" className="px-6 py-3 bg-white text-water-700 font-semibold rounded-xl hover:bg-water-50 transition-colors">I Need Water</Link>
            <Link to="/login?role=supplier" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-colors">I'm a Supplier</Link>
            <Link to="/login?role=waterman" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-colors">I'm a Waterman</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
