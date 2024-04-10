import { useRef } from "react";
import "styles/components/inputs/radiobutton.scss";

const RadioButton = (props) => {
    const radioInput = useRef(null);
    const isChecked = props.value === props.currentValue;

    return (
        <div onClick={() => radioInput.current.click()} className={"radio-button" + ((isChecked) ? " checked" : "") + ((props.className) ? ` ${props.className}` : "")}>
            <div className="bg"></div>
            <input ref={radioInput} value={props.value} checked={isChecked} onChange={e => props.onChange(e.target.value)} className="input" type="radio" name={props.name} />
            <p className="text">{props.text}</p>
        </div>
    );
}

export default RadioButton;