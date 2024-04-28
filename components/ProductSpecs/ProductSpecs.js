import React from 'react';
import CarouselMediaFiles from '../Carousel/CarouselMediaFiles';

const ProductSpecs = ({ item = { specs: [] } }) => {
	return (
		<div className='product__content'>
			{item.descripcion && (
				<div className='description'>
					<h2 className='description__title'>Descripción</h2>
					<span>{item.descripcion}</span>
				</div>
			)}
			{Object.entries(item.specs).length > 0 && (
				<div className='specs'>
					<h2 className='description__title'>Ficha Técnica</h2>

					{Object.entries(item.specs).map(([key, value], index) => (
						<div key={`s-${index}`}>
							<h3 className='specs__title'>{key}</h3>
							<table className='specs__table'>
								<tbody>
									{Object.entries(value).map(([inkey, invalue], index2) => (
										<tr key={`${index}-${index2}`}>
											<td style={{ width: '50%', fontWeight: '600' }}>
												{inkey}
											</td>
											<td style={{ width: '50%' }}>{invalue}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					))}
				</div>
			)}
			{item.mediafiles.length > 0 && (
				<div className='product__media_files'>
					<h2 className='product__media_files__title'>Más Información</h2>
					<CarouselMediaFiles item={item} />
				</div>
			)}
			<style jsx>
				{`
					.product__media_files__title {
						margin: 20px 0px;
					}

					.product__media_files {
						padding: 10px;
						border: 1px solid #eaeaea;
					}
					.specs,
					.description {
						width: 100%;
						text-align: justify;
						margin-bottom: 20px;
					}

					.description span {
						line-height: 1.5;
					}

					.specs__title,
					.description__title {
						line-height: 3;
					}

					.specs tr {
						background-color: #f2f2f2;
					}

					.specs tr:nth-child(even) {
						background-color: #ffffff;
					}

					.specs__table {
						word-break: break-all;
						border-collapse: collapse;
						border-spacing: 0;
						width: 100%;
						margin-bottom: 20px;
						border: 1px solid #f2f2f2;
						border-radius: 2px;
					}

					.specs__table td {
						padding: 20px 0 20px 10px;
					}

					.product__content {
						background-color: #ffffff;
						padding: 10px 15px 30px 15px;
						border: 1px solid #eaeaea;
					}
					
				`}
			</style>
		</div>
	);
};

export default ProductSpecs;
