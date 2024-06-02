import useClickOutside from "hooks/useClickOutside";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import "styles/components/contextmenu/contextmenu.scss";

const ContextMenu = forwardRef((props, ref) => {
    const clickRef = useRef();
    const [isOpen, setIsOpen] = useState(false);

    const [positionX, setPositionX] = useState(0)
    const [positionY, setPositionY] = useState(0)

    const { onOpenChange, onClose, className, items: propItems } = props;
    const items = (propItems) ? propItems : [];

    const setOpen = useCallback((newIsOpen) => {
        if (newIsOpen === isOpen) {
            return;
        }

        setIsOpen(newIsOpen);

        if (onOpenChange) {
            onOpenChange(newIsOpen);
        }
    }, [isOpen, onOpenChange]);

    const setPosition = useCallback((x, y) => {
        const rect = clickRef.current.getBoundingClientRect();

        // Calculate how many pixels the menu goes outside of the view
        const overRightAmount = Math.max(0, (x + rect.width) - window.innerWidth)
        const overBottomAmount = Math.max(0, (y + rect.height) - window.innerHeight)

        // Move the menu into view
        x -= overRightAmount;
        y -= overBottomAmount;

        setPositionX(x);
        setPositionY(y);
    }, []);

    const onClickOutside = useCallback(() => {
        setOpen(false);

        if (onClose) {
            onClose(false);
        }
    }, [setOpen, onClose]);

    useClickOutside([
        { "refs": [clickRef], "handler": onClickOutside, "preCheck": () => isOpen === true },
    ]);

    useImperativeHandle(ref, () => ({
        setOpen,
        setPosition,
        isOpen
    }));

    const onItemClicked = useCallback((item) => {
        if (item.disabled === true) {
            return;
        }

        if (item.onClick) {
            item.onClick();
        }
    }, []);

    return (
        <div ref={clickRef} className={"context-menu" + ((isOpen) ? " open" : " closed") + ((className) ? ` ${className}` : "")} style={{ left: positionX, top: positionY }}>
            <div className="items">
                {items.map(item =>
                    <div onClick={() => onItemClicked(item)} className={((item.type === "separator") ? "separator" : "item") + ((item.disabled === true) ? " disabled" : "")} key={`context-menu-item-${item.name}`} >
                        <p className="text">{item.text}</p>
                    </div>
                )}
            </div>
        </div>
    )
});

export default ContextMenu;