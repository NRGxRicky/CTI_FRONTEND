import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppSelector } from '../../lib/hooks';

const UserNavLeft = () => {
	const router = useRouter();
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

	// Referencia al contenedor scrollable
	const scrollContainerRef = useRef(null);
	// Estados para controlar si se muestra el fade en cada extremo
	const [fadeLeft, setFadeLeft] = useState(false);
	const [fadeRight, setFadeRight] = useState(false);

	// Función que revisa la posición del scroll
	const handleScroll = () => {
		if (scrollContainerRef.current) {
			const scrollLeft = scrollContainerRef.current.scrollLeft;
			const maxScrollLeft =
				scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
			setFadeLeft(scrollLeft > 0);
			setFadeRight(scrollLeft < maxScrollLeft);
		}
	};

	// Al montar el componente (y en redimensiones) se revisa el estado del scroll
	useEffect(() => {
		if (scrollContainerRef.current) {
			handleScroll();
		}
		window.addEventListener('resize', handleScroll);
		return () => {
			window.removeEventListener('resize', handleScroll);
		};
	}, []);

	// Efecto para desplazar el item activo al centro en móvil
	useEffect(() => {
		if (typeof window !== 'undefined' && window.innerWidth <= 960) {
			const activeElement = document.querySelector('.nav-left a.active');
			if (activeElement) {
				activeElement.scrollIntoView({
					behavior: 'smooth',
					inline: 'center',
					block: 'nearest'
				});
			}
		}
	}, [router.pathname]);

	return (
		// Se agregan clases condicionales al contenedor padre según el estado del scroll
		<div className={`nav-left ${!fadeLeft ? 'no-left-fade' : ''} ${!fadeRight ? 'no-right-fade' : ''}`}>
      <div className="nav-left-container" ref={scrollContainerRef} onScroll={handleScroll}>
        
        <Link href={`/profile/`} legacyBehavior>
          <a className={router.pathname === '/profile' ? 'text--off active' : 'text--off'}>
            <span>Mi cuenta</span>
          </a>
        </Link>

				<Link href={`/mis-compras/`} legacyBehavior>
					<a className={router.pathname === '/mis-compras' ? 'text--off active' : 'text--off'}>
						<span>Mis compras</span>
					</a>
				</Link>
				
				<Link href={`/profile/direcciones-y-facturacion/`} legacyBehavior>
					<a
						className={
							router.pathname === '/profile/direcciones-y-facturacion' ? 'text--off active' : 'text--off'
						}
					>
						<span>Direcciones de envió y Facturación</span>
					</a>
				</Link>
				<Link href={`/profile/mis-datos/`} legacyBehavior>
					<a className={router.pathname === '/profile/mis-datos' ? 'text--off active' : 'text--off'}>
						<span>Mis datos</span>
					</a>
				</Link>
				<Link href={`/profile/security/`} legacyBehavior>
					<a
						className={
							router.pathname === '/profile/security' ? 'text--off active' : 'text--off'
						}
					>
						<span>Seguridad</span>
					</a>
				</Link>
			</div>
			<style jsx>{`
        .nav-left {
          margin-top: 50px;
          width: 180px;
        }
        .nav-left-container {
          display: flex;
          flex-direction: column;
          margin-left: 20px;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          padding: 20px;
        }
        .nav-left a {
          margin-top: 20px;
        }
        .active {
          font-weight: 600;
        }

        @media only screen and (max-width: 60em) {
          /* Contenedor padre para el fade */
          .nav-left {
            margin-top: 0;
            border: 1px solid #eaeaea;
            background-color: #ffffff;
            width: 100%;
            position: relative;
            overflow: hidden;
          }
          /* Contenedor scrollable */
          .nav-left-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            line-height: 3;
            text-align: center;
            border: none;
            padding: 0 20px 0 0;
            overflow-x: scroll;
            -webkit-overflow-scrolling: touch;
          }
          .nav-left a {
            margin-top: 0;
            display: inline-block;
          }
          .nav-left a + a {
            margin-left: 20px;
          }
          .nav-left a span {
            white-space: nowrap;
          }
          .active {
            border-bottom: 2px solid var(--primary-color);
            color: var(--primary-color);
            cursor: default;
          }
          /* Pseudo-elementos para el degradado en los extremos */
          .nav-left::before,
          .nav-left::after {
            content: '';
            position: absolute;
            top: 0;
            width: 30px;
            height: 100%;
            pointer-events: none;
            z-index: 2;
          }
          .nav-left::before {
            left: 0;
            background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
          }
          .nav-left::after {
            right: 0;
            background: linear-gradient(to left, #ffffff, rgba(255, 255, 255, 0));
          }
          /* Si no hay scroll hacia la izquierda/derecha, se oculta el degradado */
          .nav-left.no-left-fade::before {
            display: none;
          }
          .nav-left.no-right-fade::after {
            display: none;
          }
        }
      `}</style>
		</div>
	);
};

export default UserNavLeft;

