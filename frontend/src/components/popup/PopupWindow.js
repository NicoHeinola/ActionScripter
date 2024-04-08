import { useState, forwardRef, useImperativeHandle } from "react";
import "styles/components/popup/popupwindow.scss";

const PopupWindow = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);

    // Expose customFunction via ref
    useImperativeHandle(ref, () => ({
        setVisible
    }));

    const closePopup = () => {
        setVisible(false);

        if (!props.onManualClose) {
            return;
        }

        props.onManualClose();
    }


    return (
        <div className={"popup-window" + ((visible) ? " visible" : " hidden") + ((props.className) ? ` ${props.className}` : "")}>
            <div onClick={closePopup} className="bg"></div>
            <div className="items">
                {props.children}
            </div>
        </div>
    )
});

export default PopupWindow;