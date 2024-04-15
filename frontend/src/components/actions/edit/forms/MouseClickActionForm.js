import GroupBox from "components/boxes/GroupBox";
import BasicButton from "components/inputs/BasicButton";
import RadioButton from "components/inputs/RadioButton";
import TextInput from "components/inputs/TextInput";
import { useEffect, useState } from "react";
import "styles/components/actions/edit/forms/mouseclickactionform.scss";
import utilAPI from "apis/utilAPI";
import socket from "socket/socketManager";

const MouseClickActionForm = (props) => {
    const actionData = props.actionData;
    const clickType = actionData["click-button"];

    const countDownStartTime = 3;
    const [pickButtonCountdown, setPickButtonCountdown] = useState(countDownStartTime);
    const [pickButtonCountdownStarted, setPickButtonCountdownStarted] = useState(false);

    const handleClickPositionTypeChange = (newValue) => {
        props.dataChanged({ "click-position-type": newValue });
    }

    const handleClickTypeChange = (newValue) => {
        props.dataChanged({ "click-button": newValue });
    }

    const startPickButtonCountdown = () => {
        setPickButtonCountdownStarted(true);
        setPickButtonCountdown(countDownStartTime);
        utilAPI.startMousePositionPickerCountdown(countDownStartTime);
    }

    useEffect(() => {
        if (!pickButtonCountdownStarted) {
            return;
        }

        const interval = setInterval(() => {
            if (pickButtonCountdown <= 0) {
                setPickButtonCountdownStarted(false);
                clearInterval(interval);
                return
            }

            setPickButtonCountdown(prevCountdown => prevCountdown - 1);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [pickButtonCountdownStarted, pickButtonCountdown])

    useEffect(() => {
        if (!pickButtonCountdownStarted) {
            return;
        }

        const onPickedMousePosition = (data) => {
            const mouseX = data["mouse-x"];
            const mouseY = data["mouse-y"];
            props.dataChanged({ "click-y": mouseY, "click-x": mouseX });
        }

        socket.on("picked-mouse-position", onPickedMousePosition);

        return () => {
            socket.off("picked-mouse-position", onPickedMousePosition);
        };
    }, [pickButtonCountdownStarted]);

    const nameClickPositionType = `click-position-type-${actionData.id}`;
    const nameClickType = `click-button-${actionData.id}`;

    return (
        <div className="mouse-click-action-form">
            <GroupBox title="Click button" className="box">
                <div className="row">
                    <RadioButton value={"left"} currentValue={clickType} text="Left" onChange={handleClickTypeChange} type="radio" name={nameClickType} />
                    <RadioButton value={"middle"} currentValue={clickType} text="Middle" onChange={handleClickTypeChange} type="radio" name={nameClickType} />
                    <RadioButton value={"right"} currentValue={clickType} text="Right" onChange={handleClickTypeChange} type="radio" name={nameClickType} />
                </div>
            </GroupBox>
            <GroupBox title="Click position" className="box">
                <div className="row">
                    <RadioButton value={"click-at-coordinates"} currentValue={actionData["click-position-type"]} text="Coordinates" onChange={handleClickPositionTypeChange} type="radio" name={nameClickPositionType} />
                    <RadioButton value={"click-at-mouse-position"} currentValue={actionData["click-position-type"]} text="Current position" onChange={handleClickPositionTypeChange} type="radio" name={nameClickPositionType} />
                </div>
                <div className="row">
                    <TextInput onChange={newValue => props.dataChanged({ "click-x": newValue })} type="number" disabled={actionData["click-position-type"] !== "click-at-coordinates"} value={actionData["click-x"]} placeholder="X-coordinate" />
                    <TextInput onChange={newValue => props.dataChanged({ "click-y": newValue })} type="number" disabled={actionData["click-position-type"] !== "click-at-coordinates"} value={actionData["click-y"]} placeholder="Y-coordinate" />
                    <BasicButton disabled={actionData["click-position-type"] !== "click-at-coordinates"} onClick={startPickButtonCountdown} className="pick-button" icon={(!pickButtonCountdownStarted) ? "images/icons/mouse-selector.png" : ""}>{(pickButtonCountdownStarted) ? `${pickButtonCountdown}` : ""}</BasicButton>
                </div>
            </GroupBox>
        </div>
    )
}

export default MouseClickActionForm;