import Layout from '../../components/Layout';

export default function Contact() {
  return (
    <Layout>
      <section className="bg-gray-50 p-10 rounded-xl shadow-md">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Contact Us
        </h2>
        <p className="mb-8 text-gray-700 leading-relaxed">
          We’d love to hear from you! For questions, partnerships, or more information, fill out the form below or email us directly at{' '}
          <a href="mailto:info@mattisfoundation.org" className="text-accent hover:underline">
            info@mattisfoundation.org
          </a>.
        </p>

        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 rounded-lg bg-accent text-black font-semibold hover:opacity-90 transition"
          >
            Submit
          </button>
        </form>
      </section>
    </Layout>
  );
}
