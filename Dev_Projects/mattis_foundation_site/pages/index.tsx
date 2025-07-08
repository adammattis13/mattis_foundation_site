import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <h2 className="text-3xl font-semibold text-gray-900 mb-4">
        Welcome to The Mattis Foundation
      </h2>
      <p className="mb-6 text-gray-700">
        Reinforcing the power of education, the strength of community, and the lifelong impact of service.
      </p>
      <a
        href="/programs"
        className="btn bg-accent text-black"
      >
        Explore Our Programs
      </a>
    </Layout>
  );
}
