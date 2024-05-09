import { useEffect } from 'react';

const useClickOutside = (ref, handler, preCheck = null) => {
    useEffect(() => {
        if (preCheck !== null && (!preCheck || !preCheck())) {
            return;
        }

        const handleClickOutside = (event) => {
            let mouseClientX = event.clientX;
            let mouseClientY = event.clientY;
            let rect = ref.current.getBoundingClientRect();

            if (mouseClientX < rect.x || mouseClientX > rect.x + rect.width || mouseClientY < rect.y || mouseClientY > rect.y + rect.height) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, handler, preCheck]);
};

export default useClickOutside;
