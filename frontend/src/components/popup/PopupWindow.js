import "styles/components/popup/popupwindow.scss";

const PopupWindow = (props) => {

    const { visible, onVisibilityChange, className, children } = props;

    const closePopup = () => {
        if (!onVisibilityChange) {
            return;
        }

        onVisibilityChange(!visible);
    }


    return (
        <div className={"popup-window" + ((visible) ? " visible" : " hidden") + ((className) ? ` ${className}` : "")}>
            <div onClick={closePopup} className="bg"></div>
            <div className="items">
                {children}
            </div>
        </div>
    )
};

export default PopupWindow;