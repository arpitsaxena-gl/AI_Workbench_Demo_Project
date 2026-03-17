function errorhandler(err, req, res, next) {
    if (!err) {
        return next();
    }

    if (err.name === "UnauthorizedError") {
        return res.status(401).send({ message: "Authentication is not valid" });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err });
    }

    return res.status(500).json(err);
}

module.exports = errorhandler;