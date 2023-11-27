import { useReducer, useEffect, useState } from 'react';
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';

const transitionTime = 400;
function threshold(target) {
	const width = target.clientWidth;
	return width / 3;
}
const limit = 1.2;
const elastic = `transform ${transitionTime}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
const smooth = `transform ${transitionTime}ms ease`;

const initialCarouselState = {
	offset: 0,
	desired: 0,
	active: 0,
};

function previous(length, current) {
	return (current - 1 + length) % length;
}

function next(length, current) {
	return (current + 1) % length;
}

function carouselReducer(state, action) {
	switch (action.type) {
		case 'jump':
			return {
				...state,
				desired: action.desired,
			};
		case 'next':
			return {
				...state,
				desired: next(action.length, state.active),
			};
		case 'prev':
			return {
				...state,
				desired: previous(action.length, state.active),
			};
		case 'done':
			return {
				...state,
				offset: NaN,
				active: state.desired,
			};
		case 'drag':
			return {
				...state,
				offset: action.offset,
			};
		default:
			return state;
	}
}

function swiped(e, dispatch, length, dir) {
	const t = threshold(e.event.target);
	const d = dir * -e.deltaX;
	if (d >= t) {
		dispatch(dir <= 0 ? { type: 'prev', length } : { type: 'next', length });
	} else {
		dispatch({
			type: 'drag',
			offset: 0,
		});
	}
}

export function useCarousel(length, interval, options = {}) {
	const { slidesPresented = 1 } = options;
	const shadowSlides = 2 * slidesPresented;
	const n = Math.max(1, Math.min(slidesPresented, length));
	const totalWidth = 100 / n;
	const [state, dispatch] = useReducer(carouselReducer, initialCarouselState);

	const handlers = useSwipeable({
		onSwiping(e) {
			e.velocity > 0.2 &&
				dispatch({
					type: 'drag',
					offset: e.deltaX,
				});
		},
		onSwipedLeft(e) {
			swiped(e, dispatch, length, 1);
		},
		onSwipedRight(e) {
			swiped(e, dispatch, length, -1);
		},
		trackMouse: true,
		trackTouch: true,
	});

	useEffect(() => {
		if (interval !== 0) {
			const id = setTimeout(() => dispatch({ type: 'next', length }), interval);
			return () => clearTimeout(id);
		}
	}, [state.offset, state.active]);

	useEffect(() => {
		const id = setTimeout(() => dispatch({ type: 'done' }), transitionTime);
		return () => clearTimeout(id);
	}, [state.desired]);

	const style = {
		transform: 'translateX(0)',
		width: `${totalWidth * (length + shadowSlides)}%`,
		left: `-${(state.active + slidesPresented) * totalWidth}%`,
	};

	if (state.desired !== state.active) {
		const dist = Math.abs(state.active - state.desired);
		const pref = Math.sign(state.offset || 0);
		const dir =
			(dist > length / 2 ? 1 : -1) * Math.sign(state.desired - state.active);
		const shift =
			(totalWidth * slidesPresented * (pref || dir)) / (length + shadowSlides);
		style.transition = smooth;
		style.transform = `translateX(${shift}%)`;
	} else if (!isNaN(state.offset)) {
		if (state.offset !== 0) {
			style.transform = `translateX(${state.offset}px)`;
		} else {
			style.transition = elastic;
		}
	}

	return [state.active, (n) => dispatch({ type: n, length }), handlers, style];
}
