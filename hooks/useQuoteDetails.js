import { useEffect, useState } from 'react';
import { useAuth } from './auth';

export function useQuoteDetails(quoteId) {
  const { accessToken } = useAuth();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quoteId || !accessToken) return;

    const fetchQuote = async () => {
      try {
        setLoading(true);
        const url = `https://api.pccdnapi.com/quotes/${quoteId}/`;
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!resp.ok) {
          throw new Error('Error al obtener la cotización');
        }

        const data = await resp.json();
        setQuote(data);
      } catch (err) {
        setError(err.message || 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId, accessToken]);

  return { quote, loading, error };
} 