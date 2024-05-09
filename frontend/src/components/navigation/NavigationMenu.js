import "styles/components/navigation/navigationmenu.scss";
import { Link, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';

const NavigationMenu = (props) => {
    const currentScript = props.currentScript;
    const scriptIsMissing = currentScript["missing-script"];

    const location = useLocation();
    const links = [
        {
            "text": "Home",
            "icon": "images/icons/home.png",
            "to": "/"
        },
        {
            "text": "Script Editor",
            "icon": "images/icons/script.png",
            "to": "/script-editor",
            "class": (props.scriptIsModified === true) ? "alert" : "",
            "disabled": scriptIsMissing,
        },
        {
            "text": "Settings",
            "icon": "images/icons/settings.png",
            "to": "/settings",
            "class": "",
        },
    ];

    return (
        <div className="navigation-menu">
            <div className="content">
                <div className="items">
                    {links.map(link =>
                        <Link key={link.to} to={link.to} className={"item" + ((link.disabled) ? " disabled" : "") + ((location.pathname === link.to) ? " active" : "")}>
                            <div className={"icon-wrapper" + ((link.class) ? ` ${link.class}` : "")}>
                                <img alt={link.text} className="icon" src={link.icon} />
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        scriptIsModified: state.actionScript.scriptIsModified,
        currentScript: state.actionScript.currentScript,
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationMenu);