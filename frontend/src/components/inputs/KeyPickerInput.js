import "styles/components/inputs/keypickerinput.scss";
import TextInput from "./TextInput";
import { useCallback, useEffect, useState } from "react";
import { connect } from 'react-redux';
import socket from "socket/socketManager";

const KeyPickerInput = (props) => {

    const [isListening, setIsListening] = useState(false);
    const [listeningTimeLeft, setListeningTimeLeft] = useState(0);
    const [pickedKeyCodes, setPickedKeyCodes] = useState([]);
    const [pickedKeyValue, setPickedKeyValue] = useState(props.value ? props.value : "");

    const placeholder = isListening ? `Listening for ${listeningTimeLeft.toFixed(1)}s...` : props.placeholder;
    const duration = (props.duration) ? Number(props.duration) : 2;
    const onChangePropCall = props.onChange;

    const propValue = props.value;

    useEffect(() => {
        setPickedKeyValue(propValue);
    }, [propValue, setPickedKeyValue])

    useEffect(() => {
        if (!isListening) {
            return;
        }

        const interval = setInterval(() => {
            if (listeningTimeLeft <= 0) {
                socket.emit("listening-for-keybinds", false)
                setIsListening(false);
                clearInterval(interval);
                onChangePropCall(pickedKeyCodes, pickedKeyValue);
                return;
            }

            setListeningTimeLeft(prevListeningTime => Math.max((prevListeningTime - 0.1), 0));
        }, 100);

        return () => {
            clearInterval(interval);
        };
    }, [isListening, listeningTimeLeft, setListeningTimeLeft, onChangePropCall, pickedKeyCodes, pickedKeyValue])

    const onPressedKeys = useCallback((keys) => {
        setPickedKeyCodes(Object.keys(keys));

        let keyNames = Object.values(keys).sort((a, b) => b.length - a.length);
        let keyValueString = keyNames.join(" + ").toLowerCase();

        setPickedKeyValue(keyValueString)

    }, [setPickedKeyCodes, setPickedKeyValue]);

    useEffect(() => {
        if (!isListening) {
            return;
        }

        socket.on("pressing-keys", onPressedKeys);

        return () => {
            socket.off("pressing-keys", onPressedKeys);
        };

    }, [isListening, onPressedKeys, pickedKeyCodes, pickedKeyValue, onChangePropCall])

    const onStartListening = () => {
        setListeningTimeLeft(duration);
        setIsListening(true);
        socket.emit("listening-for-keybinds", true)
    }

    const onIconClicked = (id) => {
        if (id === "keyboard") {
            onStartListening();
            return;
        }

        if (props.onIconClicked) {
            props.onIconClicked(id)
        }
    }

    const icons = (props.icons) ? props.icons : [];

    return (
        <TextInput disabled={props.disabled} onIconClicked={onIconClicked} value={pickedKeyValue} allowTyping={false} placeholder={placeholder} icons={[...icons, { id: "keyboard", src: "images/icons/keyboard.png" }]} className={props.className}></TextInput>
    )
}

const mapStateToProps = (state) => {
    return {
        allSettings: state.settings.allSettings,
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(KeyPickerInput);
