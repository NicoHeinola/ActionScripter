import { useState, useEffect } from "react";
import "styles/components/popup/popupwindow.scss";

const PopupWindow = (props) => {
    const [visible, setVisible] = useState(props.visible);

    useEffect(() => {
        setVisible(props.visible);
    }, [props.visible])

    const { onVisibilityChange } = props;


    const closePopup = () => {
        if (!onVisibilityChange) {
            return;
        }

        onVisibilityChange(!visible);
    }


    return (
        <div className={"popup-window" + ((visible) ? " visible" : " hidden") + ((props.className) ? ` ${props.className}` : "")}>
            <div onClick={closePopup} className="bg"></div>
            <div className="items">
                {props.children}
            </div>
        </div>
    )
};

export default PopupWindow;