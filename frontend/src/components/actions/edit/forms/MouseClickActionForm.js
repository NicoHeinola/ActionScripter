import GroupBox from "components/boxes/GroupBox";
import RadioButton from "components/inputs/RadioButton";
import TextInput from "components/inputs/TextInput";
import "styles/components/actions/edit/forms/mouseclickactionform.scss";

const MouseClickActionForm = (props) => {
    const actionData = props.actionData;
    const clickType = actionData["click-button"];

    const handleClickPositionTypeChange = (newValue) => {
        props.dataChanged("click-position-type", newValue);
    }

    const handleClickTypeChange = (newValue) => {
        props.dataChanged("click-button", newValue);
    }

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
                    <TextInput onChange={newValue => props.dataChanged("click-x", newValue)} type="number" disabled={actionData["click-position-type"] !== "click-at-coordinates"} value={actionData["click-x"]} placeholder="X-coordinate" />
                    <TextInput onChange={newValue => props.dataChanged("click-y", newValue)} type="number" disabled={actionData["click-position-type"] !== "click-at-coordinates"} value={actionData["click-y"]} placeholder="Y-coordinate" />
                </div>
            </GroupBox>
        </div>
    )
}

export default MouseClickActionForm;