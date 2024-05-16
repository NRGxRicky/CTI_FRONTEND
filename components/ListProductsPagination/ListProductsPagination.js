import React from 'react';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';

const ListProductsPagination = ({ pages, pageActive, refreshPage }) => {
	const router = useRouter();

	const dictPages = [];
	let minimun = 1;
	let maximun = parseInt(pages);

	if (parseInt(pageActive) > 4) {
		minimun = parseInt(pageActive) - 3;
	}

	let difference = parseInt(pages) - parseInt(pageActive);
	if (difference > 4) {
		maximun = parseInt(pageActive) + 3;
	}

	for (let i = minimun; i < pageActive; i++) {
		let n = +i;
		dictPages.push(n);
	}

	if (difference > 0) {
		for (let i = pageActive; i <= maximun; i++) {
			let n = +i;
			dictPages.push(n);
		}
	} else {
		dictPages.push(pageActive);
	}

	let lastElement = dictPages[dictPages.length - 1];
	let firstElement = dictPages[0];

	if (parseInt(dictPages.length) < 2) {
		return <div></div>;
	}

	return (
		<div>
			<div className='pagination'>
				{pageActive > 1 && (
					<div
						onClick={() => {
							refreshPage(parseInt(pageActive) - 1);
						}}
						className='pagination__item text--ligth'
					>
						Anterior
					</div>
				)}
				{firstElement > 1 && (
					<div
						onClick={() => {
							refreshPage('1');
						}}
						className='pagination__item text--off'
					>
						<a>
							<div>1</div>
						</a>
					</div>
				)}
				{firstElement > 1 && (
					<div className='pagination__continue text--off'>...</div>
				)}
				{dictPages.map((page, index) => {
					if (parseInt(page) !== parseInt(pageActive)) {
						return (
							<div
								onClick={() => {
									refreshPage(page);
								}}
								key={index}
								className='pagination__item text--off'
							>
								<a>
									<div>{page}</div>
								</a>
							</div>
						);
					} else {
						return (
							<div className='pagination__item pagination__current' key={index}>
								<a>
									<div>{page}</div>
								</a>
							</div>
						);
					}
				})}
				{parseInt(lastElement) < parseInt(pages) && (
					<div className='pagination__continue text--off'>...</div>
				)}
				{parseInt(lastElement) < parseInt(pages) && (
					<div
						onClick={() => {
							refreshPage(parseInt(pages));
						}}
						className='pagination__item text--off'
					>
						<a>
							<div>{parseInt(pages)}</div>
						</a>
					</div>
				)}
				{pageActive < parseInt(pages) && (
					<div
						onClick={() => {
							refreshPage(parseInt(pageActive) + 1);
						}}
						className='pagination__item text--ligth'
					>
						Siguiente
					</div>
				)}
			</div>
			<style jsx>
				{`
					.pagination__continue {
						padding: 7px 15px;
						margin: 2px;
					}

					.pagination__item {
						border: 1px solid #eaeaea;
						padding: 7px 15px;
						border-radius: 5px;
						margin: 2px;
						cursor: pointer;
						background-color: #ffffff;
					}

					.pagination {
						margin-top: 50px;
						width: 100%;
						border-top: 1px solid #eaeaea;
						display: flex;
						align-items: center;
						justify-content: center;
						height: 36px;
						padding: 40px;
					}

					.pagination__current {
						color: #ffffff;
						background-color: #ff002c;
						border-color: #ff002c;
					}

					.pagination__current a:hover {
						color: #ffffff;
					}
				`}
			</style>
		</div>
	);
};

export default ListProductsPagination;
