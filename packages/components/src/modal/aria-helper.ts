const LIVE_REGION_ARIA_ROLES = new Set( [
	'alert',
	'status',
	'log',
	'marquee',
	'timer',
] );

const hiddenElementsByDepth: Element[][] = [];

/**
 * Hides all elements in the body element from screen-readers except
 * the provided element and elements that should not be hidden from
 * screen-readers.
 *
 * The reason we do this is because `aria-modal="true"` currently is bugged
 * in Safari, and support is spotty in other browsers overall. In the future
 * we should consider removing these helper functions in favor of
 * `aria-modal="true"`.
 *
 * @param modalElement The element that should not be hidden.
 */
export function modalize( modalElement?: HTMLDivElement ) {
	const elements = Array.from( document.body.children );
	const hiddenElements: Element[] = [];
	hiddenElementsByDepth.push( hiddenElements );
	for ( const element of elements ) {
		if ( element === modalElement ) {
			continue;
		}

		if ( elementShouldBeHidden( element ) ) {
			element.setAttribute( 'aria-hidden', 'true' );
			hiddenElements.push( element );
		}
	}
}

/**
 * Determines if the passed element should not be hidden from screen readers.
 *
 * @param element The element that should be checked.
 *
 * @return Whether the element should not be hidden from screen-readers.
 */
export function elementShouldBeHidden( element: Element ) {
	// If the element has the 'hidden' attribute, it should already be hidden from assistive tech
	if ( element.hasAttribute( 'hidden' ) ) {
		return false;
	}

	// Check for role or aria attributes
	const role = element.getAttribute( 'role' );

	// Elements to skip applying aria-hidden
	return ! (
		(
			element.tagName === 'SCRIPT' || // Skip <script> tags
			element.hasAttribute( 'aria-hidden' ) || // Skip elements already marked as aria-hidden
			element.hasAttribute( 'aria-live' ) || // Skip live regions
			( role && LIVE_REGION_ARIA_ROLES.has( role ) )
		) // Skip elements with live region roles
	);
}

/**
 * Accessibly reveals the elements hidden by the latest modal.
 */
export function unmodalize() {
	const hiddenElements = hiddenElementsByDepth.pop();
	if ( ! hiddenElements ) {
		return;
	}

	for ( const element of hiddenElements ) {
		element.removeAttribute( 'aria-hidden' );
	}
}
