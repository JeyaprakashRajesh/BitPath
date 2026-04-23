const jwt = require("jsonwebtoken");
const User = require("../models/User");

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

const sanitizeText = (value) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim()
    : "";

const normalizeEmail = (value) => sanitizeText(value).toLowerCase();
const normalizeUsername = (value) => sanitizeText(value).toLowerCase();

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: "7d" });
};

const signup = async (req, res, next) => {
  try {
    const { name, fullName, username, email, password, dateOfBirth, dob } = req.body;
    const resolvedName = sanitizeText(name || fullName);
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    const resolvedPassword = typeof password === "string" ? password : "";
    const resolvedDob = dateOfBirth || dob;

    if (!resolvedName || !normalizedUsername || !normalizedEmail || !resolvedPassword) {
      return res
        .status(400)
        .json({ message: "username, name, email, and password are required" });
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 32) {
      return res.status(400).json({ message: "username must be 3-32 characters long" });
    }

    if (!USERNAME_REGEX.test(normalizedUsername)) {
      return res.status(400).json({
        message: "username can only include lowercase letters, numbers, underscore, and hyphen",
      });
    }

    if (resolvedPassword.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }

    if (resolvedDob && Number.isNaN(new Date(resolvedDob).getTime())) {
      return res.status(400).json({ message: "dateOfBirth must be a valid date" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existingUser) {
      if (existingUser.username === normalizedUsername) {
        return res.status(409).json({ message: "Username is already taken" });
      }
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({
      username: normalizedUsername,
      name: resolvedName,
      email: normalizedEmail,
      dateOfBirth: resolvedDob ? new Date(resolvedDob) : undefined,
      passwordHash: resolvedPassword,
      role: "student",
      orgs: [],
    });
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const resolvedPassword = typeof password === "string" ? password : "";

    if (!normalizedEmail || !resolvedPassword) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(resolvedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  login,
};
