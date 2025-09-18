export const requireRole = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          message: "No role information found — authentication required",
          success: false,
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Forbidden: insufficient permissions",
          success: false,
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        message: "Server error while checking user role",
        success: false,
      });
    }
  };
};
