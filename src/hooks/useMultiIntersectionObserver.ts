import { useCallback, useEffect, useRef, useState } from 'react';

// Defines the options for the useMultiIntersectionObserver hook.
type UseMultiIntersectionObserverOptions = {
  root?: Element | Document | null; // The element that is used as the viewport for checking visibility. Defaults to the browser viewport.
  rootMargin?: string; // Margin around the root. Can have values like "10px 20px 30px 40px" (top, right, bottom, left).
  threshold?: number | number[]; // A single number or an array of numbers indicating at what percentage of the target's visibility the observer's callback should be executed.
  freezeOnceVisible?: boolean; // If true, the observer will stop observing an element once it becomes visible.
  onIntersect?: (isIntersecting: boolean, entry: IntersectionObserverEntry, element: Element) => void; // Callback function called when an element's intersection status changes.
};

/**
 * A React hook that allows a single IntersectionObserver instance to observe multiple elements.
 * It returns a ref callback function that users can apply to any number of elements.
 * The onIntersect callback will fire for each element individually when its intersection status changes.
 *
 * @param {UseMultiIntersectionObserverOptions} options - Configuration options for the Intersection Observer.
 * @returns {[((node: Element | null) => void), Map<string, boolean>]} A tuple containing:
 * - A ref callback function to be applied to elements you want to observe.
 * - A Map where keys are element IDs (string) and values are their current intersection status (boolean).
 */
export function useMultiIntersectionObserver({
  root = null,
  rootMargin = '0%',
  threshold = 0,
  freezeOnceVisible = false,
  onIntersect,
}: UseMultiIntersectionObserverOptions = {}) {
  // Store a map of element IDs to their actual DOM Element nodes.
  // This helps manage which elements are currently being observed by this hook instance.
  const elementNodeMap = useRef(new Map<string, Element>());
  // Store the single IntersectionObserver instance.
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Store the current intersection status for each element (keyed by ID) to trigger re-renders in components.
  const [intersectionStates, setIntersectionStates] = useState<Map<string, boolean>>(() => new Map());

  // Use a ref for the onIntersect callback. This ensures the callback is always current
  // without re-creating the IntersectionObserver when the callback itself changes.
  const onIntersectCallbackRef = useRef(onIntersect);
  useEffect(() => {
    onIntersectCallbackRef.current = onIntersect;
  }, [onIntersect]);

  // The ref callback function. This is what you assign to the 'ref' prop of your elements.
  // When an element mounts, this function is called with the DOM node.
  // When an element unmounts, this function is called with null.
  const setRef = useCallback((node: Element | null) => {
    const observer = observerRef.current;

    if (!node) {
      // If node is null, it means an element is unmounting.
      // In this multi-ref setup, we primarily rely on `freezeOnceVisible` to unobserve individual elements
      // or the overall `disconnect` in the cleanup effect.
      // Explicitly handling `null` for unobserving here is complex without knowing which specific element unmounted.
      // The current approach works because IntersectionObserver handles elements removed from DOM gracefully,
      // and the `disconnect` in useEffect cleanup covers the rest.
      return;
    }

    // Ensure elements have a unique ID, which is crucial for tracking their state in the map.
    if (!node.id) {
      console.error('Elements observed by useMultiIntersectionObserver must have a unique `id` attribute.');
      return;
    }

    // If the element is not yet in our map, add it and tell the IntersectionObserver to observe it.
    if (!elementNodeMap.current.has(node.id)) {
      elementNodeMap.current.set(node.id, node);
      if (observer) {
        observer.observe(node);
      }
    }
  }, []); // Dependencies are empty because the internal refs (elementNodeMap, observerRef) are stable.

  // Effect to initialize and clean up the single IntersectionObserver instance.
  useEffect(() => {
    // Check for browser support for IntersectionObserver.
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver is not supported in this browser.');
      return;
    }

    // Create the IntersectionObserver instance.
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const currentOnIntersect = onIntersectCallbackRef.current; // Get the latest callback
        setIntersectionStates((prevStates) => {
          const newStates = new Map(prevStates); // Create a new map for state update

          entries.forEach((entry) => {
            // Determine if the element is currently intersecting based on the threshold.
            const isIntersecting =
              entry.isIntersecting &&
              (Array.isArray(threshold)
                ? threshold.some((t) => entry.intersectionRatio >= t)
                : entry.intersectionRatio >= threshold);

            // Update the intersection status for this element in our state map.
            newStates.set(entry.target.id, isIntersecting);

            // Call the user's provided callback if it exists.
            if (currentOnIntersect) {
              currentOnIntersect(isIntersecting, entry, entry.target);
            }

            // If 'freezeOnceVisible' is true and the element is now intersecting, stop observing it.
            // This prevents the callback from firing again for this specific element.
            if (isIntersecting && freezeOnceVisible) {
              observer.unobserve(entry.target);
              // Also remove it from our internal tracking map.
              elementNodeMap.current.delete(entry.target.id);
            }
          });
          return newStates; // Update the React state with the new map.
        });
      },
      { root, rootMargin, threshold }, // Pass observer options.
    );

    // Store the observer instance in a ref.
    observerRef.current = observer;

    // Observe all elements that were registered via 'setRef' before this useEffect ran.
    // This is important for initial renders where elements might mount before the observer is fully set up.
    elementNodeMap.current.forEach((element) => {
      observer.observe(element);
    });

    // Cleanup function: disconnect the observer when the component using this hook unmounts.
    return () => {
      observer.disconnect(); // Stop observing all elements.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      elementNodeMap.current.clear(); // Clear internal element tracking.
      setIntersectionStates(new Map()); // Reset intersection states.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, rootMargin, JSON.stringify(threshold), freezeOnceVisible]); // Re-create observer if these options change.

  // Return the ref callback and the map of intersection states.
  return [setRef, intersectionStates] as const;
}
