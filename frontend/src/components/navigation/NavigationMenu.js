import "styles/components/navigation/navigationmenu.scss";
import { Link, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';

const NavigationMenu = (props) => {
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
            "class": (props.scriptIsModified === true) ? "alert" : ""
        },
        {
            "text": "Settings",
            "icon": "images/icons/settings.png",
            "to": "/settings",
            "class": ""
        },
    ];

    return (
        <div className="navigation-menu">
            <div className="content">
                <div className="items">
                    {links.map(link =>
                        <Link key={link.to} to={link.to} className={"item" + ((location.pathname === link.to) ? " active" : "")}>
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

    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationMenu);