import BasicButton from "components/inputs/BasicButton";
import { Link } from "react-router-dom";
import "styles/views/missingpageview.scss"
import { motion } from "framer-motion";


const MissingPageView = (props) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="missing-page-view page">
            <h1>No page found!</h1>
            <Link to="#" onClick={() => window.history.back()}><BasicButton>Go back!</BasicButton></Link>
        </motion.div>
    )
}

export default MissingPageView;