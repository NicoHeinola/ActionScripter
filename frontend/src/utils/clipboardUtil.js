const getCopiedActions = () => {
    let parsedActions = [];

    try {
        parsedActions = JSON.parse(localStorage.getItem("copied-actions"));
    } catch {
        parsedActions = [];
    }

    if (!Array.isArray(parsedActions)) {
        parsedActions = [];
        copyActions([]);
    }

    return parsedActions;
}

const copyActions = (actions) => {
    localStorage.setItem("copied-actions", JSON.stringify(actions));
}

const functions = {
    getCopiedActions,
    copyActions,
}

export default functions;