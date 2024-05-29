import "styles/components/forms/popupform.scss";

import BasicButton from "components/inputs/BasicButton";
import PopupWindow from "components/popup/PopupWindow"
import { useCallback, useEffect } from "react";

const PopupForm = (props) => {
    const { children, visible, onVisibilityChange, onSave, onCancel, allowSaving } = props;

    const close = useCallback(() => {
        onVisibilityChange(false);
    }, [onVisibilityChange]);

    const cancel = useCallback(() => {
        if (onCancel) {
            onCancel();
        }

        close();
    }, [close, onCancel]);

    const save = useCallback(() => {
        if (!allowSaving || !onSave) {
            return;
        }

        onSave();
        close();
    }, [onSave, allowSaving, close]);

    const handleKeyDown = useCallback((event) => {
        const enterKeyCode = 13;
        const escKeyCode = 27;

        if (event.keyCode === enterKeyCode) {
            save();
        } else if (event.keyCode === escKeyCode) {
            cancel();
        }

    }, [save, cancel]);

    useEffect(() => {
        if (!visible) {
            return;
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown, visible]);


    return (
        <PopupWindow visible={visible} onVisibilityChange={cancel}>
            <div className="popup-form">
                {children}
                <div className="row">
                    <BasicButton disabled={!allowSaving} theme="add" onClick={save}>Save</BasicButton>
                    <BasicButton theme="warning" onClick={cancel}>Cancel</BasicButton>
                </div>
            </div>
        </PopupWindow>
    )
}

export default PopupForm