import React from 'react';
import Link from 'next/link';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';
import { useEnv } from '../context/EnvContext';

export default function Custom404() {

  const { storeName, metaDescription, titlePostDescription } = useEnv();


  return (
    <>
      <Head>
        <title>{`Página no encontrada | ${storeName}: ${titlePostDescription}`}</title>
        <meta name="description" content={`${metaDescription}`} />
      </Head>
      <div className="error-container">
        <h1>404 - Página no encontrada</h1>
        <p>Lo sentimos, la página que buscas no existe o se ha movido de lugar.</p>
        <Link href="/" legacyBehavior>
          <a className="error-link">Volver al inicio</a>
        </Link>
      </div>
      <Footer />

      <style jsx>{`
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: 20px;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 10px;
          color: var(--primary-color);
        }
        p {
          font-size: 1rem;
          margin-bottom: 20px;
          color: #555;
        }
        .error-link {
          text-decoration: none;
          background-color: var(--primary-color);
          color: #fff;
          padding: 10px 20px;
          border-radius: 5px;
          transition: background-color 0.2s ease;
        }
      `}</style>

    </>
  );
}
