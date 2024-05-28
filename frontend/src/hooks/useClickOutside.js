import { useEffect } from 'react';

const useClickOutside = (refHandlers) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            let mouseClientX = event.clientX;
            let mouseClientY = event.clientY;

            const handlersToRun = [];

            // Loop through each handler
            for (const { refs, handler, preCheck } of refHandlers) {
                if (preCheck !== null && preCheck !== undefined && !preCheck()) {
                    return;
                }

                // Check that if we are outside any element
                for (const ref of refs) {
                    let rect = ref.current.getBoundingClientRect();

                    // If mouse is outside of the element
                    const isOutside = (
                        mouseClientX < rect.x ||
                        mouseClientX > rect.x + rect.width ||
                        mouseClientY < rect.y ||
                        mouseClientY > rect.y + rect.height
                    );

                    if (isOutside) {
                        handlersToRun.push(handler);
                        break;
                    }
                }
            }

            // Run the handler functions
            for (let handler of handlersToRun) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [refHandlers]);
};

export default useClickOutside;
