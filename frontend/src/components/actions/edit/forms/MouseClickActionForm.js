import GroupBox from "components/boxes/GroupBox";
import RadioButton from "components/inputs/RadioButton";
import TextInput from "components/inputs/TextInput";
import "styles/components/actions/edit/forms/mouseclickactionform.scss";

const MouseClickActionForm = (props) => {
    const actionData = props.actionData;

    const handleClickPositionTypeChange = (e) => {
        const value = e.target.value;
        props.dataChanged("click-position-type", value);
    }

    const radioButtonName = `click-position-type-${actionData.id}`;

    return (
        <div className="mouse-click-action-form">
            <GroupBox title="Click position" className="box">
                <div className="row">
                    <RadioButton value={"click-at-coordinates"} currentValue={actionData["click-position-type"]} text="Click at coordinates" onChange={handleClickPositionTypeChange} type="radio" name={radioButtonName} />
                    <RadioButton value={"click-at-mouse-position"} currentValue={actionData["click-position-type"]} text="Click at mouse position" onChange={handleClickPositionTypeChange} type="radio" name={radioButtonName} />
                </div>
                <div className="row">
                    <TextInput onChange={e => props.dataChanged("click-x", e.target.value)} type="number" disabled={actionData["click-position-type"] !== "click-at-coordinates"} value={actionData["click-x"]} placeholder="X-coordinate" />
                    <TextInput onChange={e => props.dataChanged("click-y", e.target.value)} type="number" disabled={actionData["click-position-type"] !== "click-at-coordinates"} value={actionData["click-y"]} placeholder="Y-coordinate" />
                </div>
            </GroupBox>
        </div>
    )
}

export default MouseClickActionForm;