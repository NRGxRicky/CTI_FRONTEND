import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Router from 'next/router';
import Footer from '../components/Footer/Footer';
import { useEnv } from '../context/EnvContext';
import { useAuth } from '../hooks/auth';
import { Preloader, TailSpin } from 'react-preloader-icon';

const CalificarServicio = () => {
  const router = useRouter();
  const { orden } = router.query;

  const { storeName, metaDescription, titlePostDescription, apiUrl } =
    useEnv();

  const { isAuthenticated, loading: authLoading, accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);
  const [redirectingToGoogle, setRedirectingToGoogle] = useState(false);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!router.isReady || authLoading || !isAuthenticated) return;

    if (!orden) {
      setError('Falta el parámetro de orden en la URL');
      setLoading(false);
      return;
    }

    obtenerInfo();
  }, [router.isReady, orden, authLoading, isAuthenticated, accessToken]);

  const obtenerInfo = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await fetch(
        `${apiUrl}/rating/info/?orden=${orden}`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar la información');
      }

      const data = await response.json();
      setInfo(data);

      if (data.already_rated) {
        setEnviado(true);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al cargar la información');
      setLoading(false);
    }
  };

  const handleRatingClick = async (value) => {
    // Si cambia de cualquier valor a 5 estrellas, redirigir a Google
    if (value === 5 && info?.google_reviews_url) {
      setRating(value);
      setRedirectingToGoogle(true); // Mostrar mensaje de redirección inmediatamente

      try {
        await guardarCalificacion(
          5,
          'Cliente redirigido a Google Reviews por calificación de 5 estrellas',
          true
        );
        setTimeout(() => {
          window.open(info.google_reviews_url, '_blank', 'noopener,noreferrer');
          setEnviado(true);
          setRedirectingToGoogle(false);
        }, 1000);
      } catch (err) {
        setTimeout(() => {
          window.open(info.google_reviews_url, '_blank', 'noopener,noreferrer');
          setEnviado(true);
          setRedirectingToGoogle(false);
        }, 500);
      }
    } else {
      // Para cualquier otra calificación, solo actualizar el estado
      setRating(value);
      setRedirectingToGoogle(false);
    }
  };

  const guardarCalificacion = async (
    ratingValue,
    comentarioValue,
    redirectedToGoogle = false
  ) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await fetch(`${apiUrl}/rating/save/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orden_id: orden,
          rating: ratingValue,
          comentario: comentarioValue,
          redirected_to_google: redirectedToGoogle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar calificación');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await guardarCalificacion(rating, comentario, false);
      setEnviado(true);
    } catch (err) {
      setError(err.message || 'Error al enviar tu calificación');
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons
  const CheckIcon = () => (
    <svg width='80' height='80' viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='12' fill='var(--primary-color)' />
      <path
        d='M9 12.5l2.5 2.5 5-5'
        stroke='#FFFFFF'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );

  const AlertIcon = () => (
    <svg width='60' height='60' viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='12' fill='var(--primary-color)' />
      <path
        d='M12 8v4m0 4h.01'
        stroke='#FFFFFF'
        strokeWidth='2.5'
        strokeLinecap='round'
      />
    </svg>
  );

  const StarIcon = ({ filled }) => (
    <svg width='40' height='40' viewBox='0 0 24 24' fill={filled ? '#FFB116' : 'none'} stroke={filled ? '#FFB116' : '#ccc'} strokeWidth='2'>
      <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
    </svg>
  );

  // Loading
  if (authLoading || loading) {
    return (
      <div className='container'>
        <Head>
          <title>{`Calificar Servicio | ${storeName}: ${titlePostDescription}`}</title>
          <meta name='description' content={metaDescription} />
        </Head>
        <div className='loading-container'>
          <Preloader
            use={TailSpin}
            size={50}
            strokeWidth={8}
            strokeColor='var(--primary-color)'
            duration={900}
          />
        </div>
        <Footer />
        <style jsx>{`
					.container {
						margin-top: 0;
						min-height: 60dvh;
					}
					.loading-container {
						display: flex;
						justify-content: center;
						align-items: center;
						min-height: 50dvh;
					}
				`}</style>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className='container'>
        <Head>
          <title>{`Error | ${storeName}: ${titlePostDescription}`}</title>
          <meta name='description' content={metaDescription} />
        </Head>
        <div className='content-wrapper'>
          <div className='card'>
            <div className='card-content'>
              <div className='icon-container'>
                <AlertIcon />
              </div>
              <h2>Oops, algo salió mal</h2>
              <p>{error}</p>
              <button onClick={() => router.push('/')} className='btn-primary'>
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
        <Footer />
        <style jsx>{`
					.container {
						margin-top: 0;
						min-height: 60dvh;
						padding: 20px;
					}
					.content-wrapper {
						display: flex;
						align-items: center;
						justify-content: center;
						min-height: 50dvh;
					}
					.card {
						background: white;
						border: 1px solid #eaeaea;
						border-radius: 5px;
						padding: 0;
						max-width: 500px;
						width: 100%;
						text-align: center;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					}
					.card-content {
						padding: 40px 30px;
					}
					.icon-container {
						display: flex;
						justify-content: center;
						margin-bottom: 20px;
					}
					h2 {
						color: #333;
						margin-bottom: 15px;
						font-size: 20px;
					}
					p {
						color: #666;
						margin-bottom: 25px;
						line-height: 1.5;
					}
					.btn-primary {
						background: var(--primary-color);
						color: white;
						border: none;
						padding: 12px 30px;
						border-radius: 4px;
						cursor: pointer;
						font-size: 14px;
						transition: opacity 0.3s;
					}
					.btn-primary:hover {
						opacity: 0.9;
					}
				`}</style>
      </div>
    );
  }

  // Success
  if (enviado) {
    return (
      <div className='container'>
        <Head>
          <title>{`¡Gracias! | ${storeName}: ${titlePostDescription}`}</title>
          <meta name='description' content={metaDescription} />
        </Head>
        <div className='content-wrapper'>
          <div className='card'>
            <div className='card-content'>
              <div className='icon-container'>
                <CheckIcon />
              </div>
              <h2>¡Gracias por tu feedback!</h2>
              <p>
                Tu opinión es muy valiosa para nosotros y nos ayuda a mejorar
                continuamente nuestro servicio.
              </p>
              <button onClick={() => router.push('/')} className='btn-primary'>
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
        <Footer />
        <style jsx>{`
					.container {
						margin-top: 0;
						min-height: 60dvh;
						padding: 20px;
					}
					.content-wrapper {
						display: flex;
						align-items: center;
						justify-content: center;
						min-height: 50dvh;
					}
					.card {
						background: white;
						border: 1px solid #eaeaea;
						border-radius: 5px;
						padding: 0;
						max-width: 600px;
						width: 100%;
						text-align: center;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					}
					.card-content {
						padding: 40px 30px;
					}
					.icon-container {
						display: flex;
						justify-content: center;
						margin-bottom: 25px;
					}
					h2 {
						font-size: 24px;
						color: #333;
						margin-bottom: 15px;
					}
					p {
						font-size: 16px;
						color: #666;
						margin-bottom: 30px;
						line-height: 1.6;
					}
					.btn-primary {
						background: var(--primary-color);
						color: white;
						border: none;
						padding: 12px 30px;
						border-radius: 4px;
						cursor: pointer;
						font-size: 14px;
						font-weight: 600;
						transition: opacity 0.3s;
					}
					.btn-primary:hover {
						opacity: 0.9;
					}
					@media only screen and (max-width: 60em) {
						.card {
							padding: 0;
						}
						.card-content {
							padding: 30px 20px;
						}
						h2 {
							font-size: 20px;
						}
					}
				`}</style>
      </div>
    );
  }

  // Rating Form
  return (
    <div className='container'>
      <Head>
        <title>{`Cuéntanos tu experiencia | ${storeName}: ${titlePostDescription}`}</title>
        <meta name='description' content={metaDescription} />
      </Head>
      <div className='rating-wrapper'>
        <div className='card'>
          <div className='card-header'>
            <h2>¿Cómo fue tu experiencia?</h2>
            <p className='order-info'>Orden #{orden}</p>
          </div>

          <div className='card-body'>
            {rating === 0 ? (
              <>
                <p className='intro-text'>
                  Tu opinión es muy importante para nosotros
                </p>
                <p className='sub-text'>Por favor selecciona una calificación.</p>

                <div className='stars-container'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className='star-button'
                      onClick={() => handleRatingClick(star)}
                      type='button'
                    >
                      <StarIcon filled={false} />
                      <span className='star-number'>{star}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : redirectingToGoogle ? (
              <div className='redirecting'>
                <h3>¡Gracias por tu excelente calificación!</h3>
                <div className='stars-display'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={true} />
                  ))}
                </div>
                <p>
                  Te estamos redirigiendo a Google Reviews para que compartas tu
                  experiencia...
                </p>
                <div className='loader-container'>
                  <Preloader
                    use={TailSpin}
                    size={40}
                    strokeWidth={8}
                    strokeColor='var(--primary-color)'
                    duration={900}
                  />
                </div>
              </div>
            ) : (
              <>
                <p className='intro-text'>Gracias por tu calificación</p>

                <div className='stars-container'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star-button ${star <= rating ? 'selected' : ''}`}
                      onClick={() => handleRatingClick(star)}
                      type='button'
                    >
                      <StarIcon filled={star <= rating} />
                      <span className='star-number'>{star}</span>
                    </button>
                  ))}
                </div>

                <p className='sub-text'>¿Podrías contarnos qué podríamos mejorar?</p>

                <form onSubmit={handleSubmit} className='feedback-form'>
                  <div className='form-group'>
                    <label htmlFor='comentario'>Tu comentario</label>
                    <textarea
                      id='comentario'
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder='Por ejemplo: "El producto llegó bien pero el envío tardó más de lo esperado..."'
                      rows='6'
                      required
                    />
                    <p className='help-text'>
                      Tu opinión es confidencial y nos ayuda a mejorar
                    </p>
                  </div>

                  <div className='button-group'>
                    <button type='submit' className='btn-submit' disabled={loading}>
                      {loading ? 'Enviando...' : 'Enviar Comentario'}
                    </button>
                    <button
                      type='button'
                      onClick={() => router.push('/')}
                      className='btn-skip'
                    >
                      Omitir
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <style jsx>{`
				.container {
					margin-top: 0;
					min-height: 60dvh;
					padding: 20px;
				}
				.rating-wrapper {
					max-width: 700px;
					margin: 0 auto;
					min-height: 50dvh;
				}
				.card {
					background: transparent;
					border-radius: 5px;
					overflow: hidden;
          padding: 0;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
				}
				.card-header {
					background: var(--primary-color);
					color: white;
					padding: 30px 25px;
					text-align: center;
					border-radius: 5px 5px 0 0;
				}
				.card-header h2 {
					font-size: 22px;
					margin-bottom: 8px;
					font-weight: 600;
				}
				.order-info {
					font-size: 14px;
					opacity: 0.95;
				}
				.card-body {
					padding: 35px 25px;
					background: white;
					border: 1px solid #eaeaea;
					border-top: none;
					border-radius: 0 0 5px 5px;
				}
				.intro-text {
					font-size: 16px;
					color: #333;
					margin-bottom: 8px;
					font-weight: 500;
					text-align: center;
				}
				.sub-text {
					color: #666;
					font-size: 14px;
					margin-bottom: 30px;
					text-align: center;
				}
				.stars-container {
					display: flex;
					justify-content: center;
					gap: 15px;
					margin: 30px 0;
				}
				.star-button {
					background: #f5f5f5;
					border: 2px solid #eaeaea;
					border-radius: 8px;
					width: 70px;
					height: 70px;
					cursor: pointer;
					transition: all 0.2s;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 5px;
				}
				.star-button:hover {
					background: #fff8ee;
					border-color: #FFB116;
					transform: scale(1.05);
				}
				.star-button.selected {
					background: #fff8ee;
					border-color: #FFB116;
				}
				.star-number {
					font-size: 12px;
					color: #666;
					font-weight: 600;
				}
				.stars-display {
					display: flex;
					justify-content: center;
					gap: 5px;
					margin: 20px 0;
				}
				.redirecting {
					text-align: center;
					padding: 20px 0;
				}
				.redirecting h3 {
					color: #333;
					margin-bottom: 20px;
					font-size: 18px;
				}
				.redirecting p {
					color: #666;
					margin: 20px 0;
				}
				.loader-container {
					display: flex;
					justify-content: center;
					margin-top: 25px;
				}
				.feedback-form {
					margin-top: 25px;
				}
				.form-group {
					margin-bottom: 20px;
				}
				.form-group label {
					display: block;
					font-weight: 600;
					color: #333;
					margin-bottom: 10px;
					font-size: 14px;
				}
				.form-group textarea {
					width: 100%;
					padding: 12px;
					border: 1px solid #eaeaea;
					border-radius: 5px;
					font-size: 14px;
					font-family: inherit;
					resize: vertical;
					transition: border-color 0.2s;
				}
				.form-group textarea:focus {
					outline: none;
					border-color: var(--primary-color);
				}
				.help-text {
					font-size: 12px;
					color: #999;
					margin-top: 8px;
				}
				.button-group {
					display: flex;
					gap: 10px;
				}
				.btn-submit,
				.btn-skip {
					flex: 1;
					padding: 12px 20px;
					border-radius: 4px;
					font-size: 14px;
					font-weight: 600;
					cursor: pointer;
					transition: opacity 0.2s;
					border: none;
				}
				.btn-submit {
					background: var(--primary-color);
					color: white;
				}
				.btn-submit:hover:not(:disabled) {
					opacity: 0.9;
				}
				.btn-submit:disabled {
					opacity: 0.6;
					cursor: not-allowed;
				}
				.btn-skip {
					background: white;
					color: #666;
					border: 1px solid #eaeaea;
				}
				.btn-skip:hover {
					background: #f5f5f5;
				}

				@media only screen and (max-width: 60em) {
					.container {
						padding: 10px;
					}
					.card-header {
						padding: 25px 20px;
					}
					.card-header h2 {
						font-size: 18px;
					}
					.card-body {
						padding: 25px 20px;
					}
					.stars-container {
						gap: 8px;
					}
					.star-button {
						width: 55px;
						height: 55px;
					}
					.button-group {
						flex-direction: column;
					}
				}
			`}</style>
    </div>
  );
};

export default CalificarServicio;
