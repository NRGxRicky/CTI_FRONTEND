import React, { useEffect, useState } from 'react';

const GoogleRatings = ({ placeId, apiKey }) => {
	const [ratings, setRatings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchRatings = async () => {
			try {
				const response = await fetch(
					`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`
				);
				const data = await response.json();

				if (data.status === 'OK') {
					setRatings(data.result.reviews || []); // Obtener las calificaciones
				} else {
					setError('No se pudieron obtener las calificaciones');
				}
			} catch (err) {
				setError('Hubo un error al obtener los datos');
			} finally {
				setLoading(false);
			}
		};

		fetchRatings();
	}, [placeId, apiKey]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>;

	return (
		<div>
			<h3>Calificaciones</h3>
			{ratings.length > 0 ? (
				<ul>
					{ratings.map((review, index) => (
						<li key={index}>
							<strong>{review.author_name}</strong>
							<p>Rating: {review.rating} estrellas</p>
							<p>{review.text}</p>
						</li>
					))}
				</ul>
			) : (
				<p>No hay calificaciones disponibles.</p>
			)}
		</div>
	);
};

export default GoogleRatings;
