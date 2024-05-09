import "styles/components/inputs/checkboxinput.scss";

const CheckboxInput = (props) => {
    const isChecked = props.checked === true;

    const onClicked = () => {
        if (props.onChecked) {
            props.onChecked(!isChecked);
        }
    }

    return (
        <div className={"checkbox-input" + ((props.className) ? ` ${props.className}` : "") + ((isChecked) ? " checked" : "")}>
            <div className="input-container" onClick={onClicked}>
                <div className="bg"></div>
                <div className="ball"></div>
            </div>
            <p className="label">{props.label ? props.label : ""}</p>

        </div>
    )
}

export default CheckboxInput;