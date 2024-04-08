import { useEffect, useState } from "react";
import "styles/components/inputs/textinput.scss";

const TextInput = (props) => {
    const [value, setValue] = useState("");
    const [isInputActive, setIsInputActive] = useState(false);

    useEffect(() => {
        setValue(props.value);
    }, [props.value])

    const valueChanged = (e) => {
        let newValue = e.target.value;
        setValue(newValue);

        if (!props.onChange) {
            return;
        }

        props.onChange(e);
    }

    return (
        <div className={"text-input" + ((props.disabled) ? " disabled" : "") + ((props.className) ? ` ${props.className}` : "")}>
            <div className={"bg" + ((isInputActive) ? " active" : "")}></div>
            <div className="input-container">
                <input disabled={props.disabled === true} min={props.min} max={props.max} value={props.value} onFocus={() => setIsInputActive(true)} onBlur={() => setIsInputActive(false)} onChange={valueChanged} type={props.type} className="input" />
                <p className={"placeholder" + (((value !== "" && value !== null && value !== undefined) || isInputActive) ? " active-or-value" : "") + ((isInputActive) ? " active" : "")}>{props.placeholder}</p>
            </div>
            <div className="underlines">
                <div className="underline" ></div>
                <div className={"underline colorful" + ((isInputActive) ? " active" : "")} ></div>
            </div>
        </div>
    );
}

export default TextInput;