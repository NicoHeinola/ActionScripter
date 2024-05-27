import "styles/components/inputs/basicbutton.scss";

const BasicButton = (props) => {

    const imageSize = (props.imageSize) ? props.imageSize : "100%";

    const children = (props.children) ? <p className="text">{props.children}</p> : <></>;
    const centering = (props.centering) ? props.centering : "center";

    return (
        <button style={{ justifyContent: centering }} disabled={props.disabled} onClick={props.onClick} className={"basic-button" + ((props.disabled) ? " disabled" : "") + ((props.className) ? ` ${props.className}` : "")}>
            <div className="bg"></div>
            {(!props.icon) ? "" :
                <img alt="Some Icon" className="image" style={{ height: imageSize }} src={props.icon}></img>
            }
            {children}

        </button>
    );
}

export default BasicButton;