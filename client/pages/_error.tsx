import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

export default function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <main style={{ padding: '4rem', fontFamily: 'sans-serif' }}>
      <h1>Something went wrong</h1>
      <p>{statusCode ? `A ${statusCode} error occurred.` : 'An unexpected error occurred.'}</p>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 404;
  return { statusCode };
};
