module.exports = (req, res) => {
  let token = req.cookies["access-token"];
  res.cookie("access-token", token, {
    maxAge: -10,
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });
  res.json({ message: "logged out" });
};
