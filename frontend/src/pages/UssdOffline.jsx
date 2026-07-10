const ussdCodes = [
  { code: '*165*1#', desc: 'Place a new water order', role: 'customer' },
  { code: '*165*2#', desc: 'Check order status', role: 'customer' },
  { code: '*165*3#', desc: 'Track delivery', role: 'customer' },
  { code: '*165*4#', desc: 'View available suppliers', role: 'customer' },
  { code: '*165*5#', desc: 'Contact support', role: 'all' },
  { code: '*165*10#', desc: 'View pending orders (Supplier)', role: 'supplier' },
  { code: '*165*11#', desc: 'Accept order (Supplier)', role: 'supplier' },
  { code: '*165*20#', desc: 'View assigned deliveries (Waterman)', role: 'waterman' },
  { code: '*165*21#', desc: 'Update delivery status (Waterman)', role: 'waterman' },
];

const faqs = [
  { q: 'What is USSD?', a: 'USSD (Unstructured Supplementary Service Data) allows you to use Water Tuffune without internet. Dial the codes on any phone to order and track water deliveries.' },
  { q: 'Is there a charge for USSD?', a: 'Standard network charges apply based on your mobile provider. The Water Tuffune service itself is free to access via USSD.' },
  { q: 'Can I pay via mobile money?', a: 'Yes! We support MTN Mobile Money, Airtel Money, and cash on delivery. Select your preference when ordering.' },
  { q: 'What if I have no smartphone?', a: 'USSD works on any phone — basic or smartphone. No app download needed. Just dial *165# to get started.' },
  { q: 'How do I track my delivery offline?', a: 'Dial *165*3# and enter your order ID to receive an SMS with your current delivery status and estimated time.' },
];

export default function UssdOffline() {
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📱</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">USSD / Offline Mode</h1>
            <p className="text-gray-500 dark:text-gray-400">Access Water Tuffune without internet</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-water-600 to-water-800 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">📞</div>
          <div>
            <h2 className="text-lg font-bold">Dial *165# to get started</h2>
            <p className="text-water-100 text-sm">Works on any phone. No smartphone or internet required.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {['MTN Uganda', 'Airtel Uganda', 'Africell', 'LycaMobile'].map((op) => (
            <span key={op} className="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">{op}</span>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">USSD Codes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Dial these codes from your phone to access Water Tuffune services.</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Code</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-600 dark:text-gray-400">For</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ussdCodes.map((item) => (
                <tr key={item.code} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3">
                    <code className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono font-bold text-water-700">{item.code}</code>
                  </td>
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{item.desc}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">{item.role}</span>
                  </td>
                  <td className="py-3">
                    <button onClick={() => copyCode(item.code)}
                      className="text-xs px-3 py-1.5 bg-water-50 text-water-600 rounded-lg hover:bg-water-100 transition-colors">
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex items-center justify-between py-3 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-water-600">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="pb-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
