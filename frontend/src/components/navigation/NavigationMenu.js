import "styles/components/navigation/navigationmenu.scss";
import { Link, useLocation } from 'react-router-dom';

const NavigationMenu = () => {
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
            "to": "/script-editor"
        },
    ];

    return (
        <div className="navigation-menu">
            <div className="content">
                <div className="items">
                    {links.map(link =>
                        <Link key={link.to} to={link.to} className={"item" + ((location.pathname === link.to) ? " active" : "")}>
                            <div className="icon-wrapper">
                                <img alt={link.text} className="icon" src={link.icon} />
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NavigationMenu;