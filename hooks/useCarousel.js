import { useReducer, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';

const transitionTime = 400;
function threshold(target) {
	const width = target.clientWidth;
	return width / 3;
}
// const limit = 1.2; // not used currently
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

function swiped(e, dispatch, length, dir, containerWidth) {
	const t = containerWidth / 3;
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
	const { slidesPresented = 1, peekPercent = 0, initialActive = 0 } = options;
	const shadowSlides = 2 * slidesPresented;
	const n = Math.max(1, Math.min(slidesPresented, length));
	// When peekPercent > 0, each slide will not occupy the full viewport width
	// We compute the visible width of a single slide in percentage of the viewport
	const slideWidthPercent = Math.max(0, Math.min(100, 100 - 2 * (peekPercent || 0)));
	// Backwards-compatible value used when peekPercent == 0
	const totalWidth = peekPercent ? slideWidthPercent : 100 / n;
	const normalizedInitialActive = Math.max(
		0,
		Math.min(initialActive, Math.max(0, length - 1))
	);
	const containerWidthRef = useRef(1);
	const [state, dispatch] = useReducer(
		carouselReducer,
		initialCarouselState,
		(s) => ({ ...s, active: normalizedInitialActive, desired: normalizedInitialActive })
	);

	const handlers = useSwipeable({
		onSwiping(e) {
			if (typeof window !== 'undefined') {
				const container = e.event.currentTarget || document.querySelector('.carousel__container');
				if (container) {
					containerWidthRef.current = container.clientWidth || 1;
				}
			}
			e.velocity > 0.2 &&
				dispatch({
					type: 'drag',
					offset: e.deltaX,
				});
		},
		onSwipedLeft(e) {
			swiped(e, dispatch, length, 1, containerWidthRef.current);
		},
		onSwipedRight(e) {
			swiped(e, dispatch, length, -1, containerWidthRef.current);
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
		transform: 'translate3d(0,0,0)',
		width: `${totalWidth * (length + shadowSlides)}%`,
		willChange: 'transform',
	};

	// Calculate base left offset. If peekPercent > 0 we center the active slide
	// so that both previous and next slides are partially visible.
	if (peekPercent) {
		const sideGap = (100 - slideWidthPercent) / 2; // percentage
		style.left = `calc(-${(state.active + slidesPresented) * slideWidthPercent}% + ${sideGap}%)`;
	} else {
		style.left = `-${(state.active + slidesPresented) * totalWidth}%`;
	}

	if (state.desired !== state.active) {
		const dist = Math.abs(state.active - state.desired);
		const pref = Math.sign(state.offset || 0);
		const dir =
			(dist > length / 2 ? 1 : -1) * Math.sign(state.desired - state.active);
		// Shift by exact slide count relative to container width (percent of self)
		const shift = (100 * slidesPresented * (pref || dir)) / (length + shadowSlides);
		style.transition = smooth;
		style.transform = `translate3d(${shift}%,0,0)`;
	} else if (!isNaN(state.offset)) {
		if (state.offset !== 0) {
			// Convert pixel drag to percentage of container width using cached ref to prevent forced reflow
			const percent = (state.offset / containerWidthRef.current) * 100;
			style.transform = `translate3d(${percent}%,0,0)`;
		} else {
			style.transition = elastic;
		}
	}

	return [state.active, (n) => dispatch({ type: n, length }), handlers, style];
}
