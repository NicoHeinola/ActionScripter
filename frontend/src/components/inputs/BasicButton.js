import "styles/components/inputs/basicbutton.scss";

const BasicButton = (props) => {
    return (
        <button onClick={props.onClick} className={"basic-button" + ((props.className) ? ` ${props.className}` : "")} style={props.style}>
            {props.children}
        </button>
    );
}

export default BasicButton;