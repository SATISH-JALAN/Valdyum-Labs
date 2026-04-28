import Link from 'next/link';

const FOOTER_COLS = [
  {
    heading: 'Protocol',
    links: [
      { label: 'How it works', href: '/docs' },
      { label: '0x402 Spec', href: '/docs/402' },
      { label: 'QStash Events', href: '/docs/events' },
      { label: 'Soroban Contracts', href: '/docs/contracts' },
    ],
  },
  {
    heading: 'Build',
    links: [
      { label: 'Agent SDK', href: '/devs' },
      { label: 'Templates', href: '/build' },
      { label: 'Marketplace', href: '/agents' },
      { label: 'Faucet', href: '/faucet' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/docs/api' },
      { label: 'Rust SDK Guide', href: '/docs/sdk' },
      { label: 'Changelog', href: '/docs/changelog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Discord', href: 'https://discord.com' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#F5F6F8] border-t border-[#E2E8F0]">
      <div className="max-w-content mx-auto px-6 pt-16 pb-10">

        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E2E8F0]">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="font-editorial text-2xl font-semibold text-[#0A0E27] mb-3">Valdyum</div>
            <p className="text-sm text-[#475569] leading-relaxed max-w-[200px]">
              The Web3-native AI agent marketplace on Stellar.
            </p>
          </div>

          {/* Link cols */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#475569] hover:text-[#0A0E27] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs text-[#94a3b8]">
            © {new Date().getFullYear()} Valdyum. Built on Stellar.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-[#94a3b8] hover:text-[#475569] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-[#94a3b8] hover:text-[#475569] transition-colors">
              Terms
            </Link>
            <Link href="https://github.com" className="text-xs text-[#94a3b8] hover:text-[#475569] transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
