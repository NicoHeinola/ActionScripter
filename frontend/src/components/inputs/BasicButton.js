import "styles/components/inputs/basicbutton.scss";

const BasicButton = (props) => {

    const { imageSize, children, centering, icon, disabled, onClick, className, theme } = props;

    // Validation checks
    const checkedImageSize = (imageSize) ? imageSize : "100%";
    const checkedChildren = (children) ? <p className="text">{children}</p> : <></>;
    const checkedCentering = (centering) ? centering : "center";
    const checkedTheme = (theme) ? `${theme}-theme` : "default-theme";

    return (
        <button style={{ justifyContent: checkedCentering }} disabled={disabled} onClick={onClick} className={"basic-button " + checkedTheme + ((disabled) ? " disabled" : "") + ((className) ? ` ${className}` : "")}>
            <div className="bg"></div>
            {(!props.icon) ? "" :
                <img alt="Some Icon" className="image" style={{ height: checkedImageSize }} src={icon}></img>
            }
            {checkedChildren}

        </button>
    );
}

export default BasicButton;