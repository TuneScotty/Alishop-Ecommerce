// About page showcasing brand story, company values, and technology stack
import Image from 'next/image';
import Layout from '../components/Layout';

/**
 * About page showcasing brand story, company values, and technology stack
 * @returns JSX.Element - Complete about page with hero, mission, tech stack, and CTA sections
 * Purpose: Provides company information, mission statement, technology details, and brand story
 * to build trust and showcase the platform's capabilities to potential customers
 */
export default function AboutPage() {
  return (
    <Layout title="About Us – AliShop" description="Learn about our mission, team and technology">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-20">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Story</h1>
          <p className="text-lg opacity-90">
            AliShop started as a weekend side-project and grew into a full-stack e-commerce
            platform focused on performance, accessibility and delightful UX.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary-dark dark:text-primary-light">Our Mission</h2>
            <p className="mb-4 text-neutral-700 dark:text-neutral-300">
              Empower entrepreneurs with a lightning-fast, modern storefront that scales
              from first sale to global audience without vendor lock-in.
            </p>
            <ul className="space-y-3 list-disc list-inside text-neutral-700 dark:text-neutral-300">
              <li>Performance-first design (Core Web Vitals in the green)</li>
              <li>Open source &amp; developer friendly</li>
              <li>Fair pricing — host anywhere, no SaaS tax</li>
            </ul>
          </div>
          <div className="relative w-full h-64 md:h-80 shadow-xl rounded-lg overflow-hidden">
            <Image src="/hero-store.jpg" alt="Storefront preview" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="py-16 bg-white dark:bg-neutral-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-8 text-primary-dark dark:text-primary-light">Built with modern tech</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {['Next.js', 'React 19', 'TypeScript', 'MongoDB', 'Tailwind CSS', 'Docker'].map((t) => (
              <span key={t} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-full text-sm font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-accent-teal text-white text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to explore?</h2>
          <p className="mb-8 opacity-90">Browse our catalog or contribute on GitHub.</p>
          <a href="/products" className="btn btn-primary btn-large inline-block">Shop now</a>
        </div>
      </section>
    </Layout>
  );
}
