import { useEffect, useRef, useState } from "react";
import "styles/components/inputs/selectbox.scss";

const SelectBox = (props) => {
    const [selectedText, setSelectedText] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [optionsYOffset, setOptionsYOffset] = useState(0);
    const optionsSubContainerRef = useRef(null);

    // Calculate offset only when options change
    useEffect(() => {
        let optionsRect = optionsSubContainerRef.current.getBoundingClientRect();
        let bottomPosition = optionsRect.height + optionsRect.top;
        let offsetY = 0;
        if (window.innerHeight < bottomPosition) {
            offsetY = bottomPosition - window.innerHeight;
        }
        setOptionsYOffset(offsetY);
    }, [props.options]);

    const selectOption = (option) => {
        if (props.onSelect) {
            props.onSelect(option.value);
        }
        setSelectedText(option.text);
    };

    return (
        <div className={"select-box" + ((props.className) ? ` ${props.className}` : "")}>
            <div className={"bg" + ((isOpen) ? " open" : "")}></div>
            <div className="input-container">
                <input onClick={() => setIsOpen(!isOpen)} onBlur={() => setIsOpen(false)} className="hidden-input"></input>
                <p className="selected-value-text">{selectedText}</p>
                <p className={"placeholder" + ((selectedText !== null) ? " value" : "") + ((isOpen) ? " open" : "")}>{props.placeholder}</p>
                <div className="arrow-container">
                    <img className={"image" + ((isOpen) ? " open" : "")} src="images/icons/arrow-down.png" alt="arrow-down" />
                </div>
            </div>
            <div className="underlines">
                <div className="underline" ></div>
                <div className={"underline colorful" + ((isOpen) ? " open" : "")} ></div>
            </div>
            <div className={"options" + ((!isOpen) ? ' hidden' : '')}>
                <div ref={optionsSubContainerRef} style={{ top: `-${optionsYOffset}px` }} className={"options-sub-container"}>
                    {props.options.map(option =>
                        <div onMouseDown={() => selectOption(option)} key={"opt-" + option.value} className="option">
                            <p className="text">{option.text}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectBox;
