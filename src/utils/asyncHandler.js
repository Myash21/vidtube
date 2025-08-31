export const asyncHandler = (requestHandler) => {
    return(req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


/*
asyncHandler is a utility that avoids repetitive try/catch in Express routes
by catching async errors and passing them to Express’s error-handling middleware.

**Basically to avoid manually writing try/catch everywhere**

4. Example with error middleware
// Route
app.get('/user/:id', asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id);
   if (!user) throw new Error("User not found");
   res.json(user);
}));

// Centralized error handler
app.use((err, req, res, next) => {
   res.status(500).json({ message: err.message });
});

If any async error happens, it will land in the error middleware automatically.
*/