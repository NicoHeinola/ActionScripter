import { useState } from "react";
import "styles/components/inputs/textinput.scss";

const TextInput = (props) => {
    const { value, pattern, type, min, max, onChange, placeholder, step, disabled, className, allowTyping, icons } = props;

    const realValue = (value !== undefined) ? value : "";
    const isDisabled = disabled === true || allowTyping === false;

    const [isInputActive, setIsInputActive] = useState(false);

    const valueChanged = (e) => {
        let newValue = e.target.value;

        if (pattern) {
            let regex = new RegExp(pattern);
            let passes = regex.test(newValue.toString());
            if (!passes) {
                return;
            }
        }

        if (type === "number") {
            newValue = Number(newValue);

            // Min and max number checks
            let minNumber = Number(min)
            let maxNumber = Number(min)
            if (min && newValue < minNumber) {
                newValue = minNumber;
            } else if (max && newValue > maxNumber) {
                newValue = maxNumber;
            }
        }

        if (!onChange) {
            return;
        }

        onChange(newValue);
    }

    return (
        <div className={"text-input" + ((disabled) ? " disabled" : "") + ((className) ? ` ${className}` : "")}>
            <div className={"bg" + ((isInputActive) ? " active" : "")}></div>
            <div className="input-container">
                <input step={step} value={realValue} onChange={valueChanged} disabled={isDisabled} min={min} max={max} onFocus={() => setIsInputActive(true)} onBlur={() => setIsInputActive(false)} type={type} className="input" />
                <p className={"placeholder" + (((realValue !== "" && realValue !== null && realValue !== undefined) || isInputActive) ? " active-or-value" : "") + ((isInputActive) ? " active" : "")}>{placeholder}</p>
            </div>
            <div className="button-container">
                {
                    (icons) ?
                        icons.map(icon =>
                            <img key={icon.id} alt={icon.id} className="icon" onClick={icon.onClick} src={icon.src} />
                        )
                        :
                        <></>
                }
            </div>
            <div className="underlines">
                <div className="underline" ></div>
                <div className={"underline colorful" + ((isInputActive) ? " active" : "")} ></div>
            </div>
        </div>
    );
}

export default TextInput;