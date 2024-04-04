import BasicButton from "components/inputs/BasicButton";
import { Link } from "react-router-dom";
import "styles/views/missingpageview.scss"

const MissingPageView = (props) => {
    return (
        <div className="missing-page-view">
            <h1>No page found!</h1>
            <Link to="#" onClick={() => window.history.back()}><BasicButton>Go back!</BasicButton></Link>
        </div>
    )
}

export default MissingPageView;