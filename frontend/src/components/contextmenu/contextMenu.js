import useClickOutside from "hooks/useClickOutside";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import "styles/components/contextmenu/contextmenu.scss";

const ContextMenu = forwardRef((props, ref) => {
    const clickRef = useRef();
    const [isOpen, setIsOpen] = useState(false);

    const [positionX, setPositionX] = useState(0)
    const [positionY, setPositionY] = useState(0)

    const setOpen = (newIsOpen) => {
        if (newIsOpen === isOpen) {
            return;
        }

        setIsOpen(newIsOpen);

        if (props.onOpenChange) {
            props.onOpenChange(newIsOpen);
        }
    }

    const setPosition = (x, y) => {
        const rect = clickRef.current.getBoundingClientRect();

        // Calculate how many pixels the menu goes outside of the view
        const overRightAmount = Math.max(0, (x + rect.width) - window.innerWidth)
        const overBottomAmount = Math.max(0, (y + rect.height) - window.innerHeight)

        // Move the menu into view
        x -= overRightAmount;
        y -= overBottomAmount;

        setPositionX(x);
        setPositionY(y);
    }

    const onClickOutside = () => {
        setOpen(false);

        if (props.onClose) {
            props.onClose();
        }
    }

    useClickOutside([
        { "refs": [clickRef], "handler": onClickOutside, "preCheck": () => isOpen === true },
    ]);


    useImperativeHandle(ref, () => ({
        setOpen,
        setPosition,
        isOpen
    }));

    const onItemClicked = (item) => {
        if (item.disabled === true) {
            return;
        }

        if (item.onClick) {
            item.onClick();
        }
    }

    return (
        <div ref={clickRef} className={"context-menu" + ((isOpen) ? " open" : " closed") + ((props.className) ? ` ${props.className}` : "")} style={{ left: positionX, top: positionY }}>
            <div className="items">
                {props.items.map(item =>
                    <div onClick={() => onItemClicked(item)} className={((item.type === "separator") ? "separator" : "item") + ((item.disabled === true) ? " disabled" : "")} key={`context-menu-item-${item.name}`} >
                        <p className="text">{item.text}</p>
                    </div>
                )}
            </div>
        </div>
    )
});

export default ContextMenu;