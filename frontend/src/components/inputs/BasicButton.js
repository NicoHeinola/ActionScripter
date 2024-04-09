import "styles/components/inputs/basicbutton.scss";

const BasicButton = (props) => {
    return (
        <button disabled={props.disabled} onClick={props.onClick} className={"basic-button" + ((props.disabled) ? " disabled" : "") + ((props.className) ? ` ${props.className}` : "")} style={props.style}>
            <div className="bg"></div>
            {(!props.icon) ? "" :
                <img alt="Some Icon" className="image" src={props.icon}></img>
            }
            {props.children}

        </button>
    );
}

export default BasicButton;