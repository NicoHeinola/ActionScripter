import "styles/components/boxes/groupbox.scss";

const GroupBox = (props) => {
    return (
        <div className={"group-box" + ((props.className) ? ` ${props.className}` : "")}>
            <div className="borders">
                <div className="border-top-left"></div>
                <div className={"text-container" + ((!props.title) ? "no-title" : "")}>
                    <p className="text">{props.title}</p>
                    <p className="hidden-text">{props.title}</p>
                </div>
                <div className="border-top-right"></div>
            </div>
            {props.children}
        </div>
    );
}

export default GroupBox;