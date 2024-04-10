import { useEffect, useState } from "react";
import "styles/components/inputs/textinput.scss";

const TextInput = (props) => {
    const propValue = props.value;

    const [value, setValue] = useState((propValue !== undefined) ? propValue : "");
    const [isInputActive, setIsInputActive] = useState(false);


    useEffect(() => {
        if (propValue === value || propValue === undefined) {
            return
        }

        setValue(propValue);
    }, [propValue, value])

    const valueChanged = (e) => {
        let newValue = e.target.value;

        if (props.pattern) {
            let regex = new RegExp(props.pattern);
            let passes = regex.test(newValue.toString());
            if (!passes) {
                return;
            }
        }

        if (props.type === "number") {
            newValue = Number(newValue);

            // Min and max number checks
            let minNumber = Number(props.min)
            let maxNumber = Number(props.min)
            if (props.min && newValue < minNumber) {
                newValue = minNumber;
            } else if (props.max && newValue > maxNumber) {
                newValue = maxNumber;
            }
        }

        setValue(newValue);

        if (!props.onChange) {
            return;
        }

        props.onChange(newValue);
    }

    return (
        <div className={"text-input" + ((props.disabled) ? " disabled" : "") + ((props.className) ? ` ${props.className}` : "")}>
            <div className={"bg" + ((isInputActive) ? " active" : "")}></div>
            <div className="input-container">
                <input value={value} onChange={valueChanged} disabled={props.disabled === true} min={props.min} max={props.max} onFocus={() => setIsInputActive(true)} onBlur={() => setIsInputActive(false)} type={props.type} className="input" />
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