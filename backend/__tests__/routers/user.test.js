const express = require("express");
const request = require("supertest");

// Mock dependencies before requiring the router
const mockFindOne = jest.fn();
const mockSave = jest.fn();
jest.mock("../../model/user", () => {
  const mock = jest.fn().mockImplementation(() => ({ save: mockSave }));
  mock.findOne = mockFindOne;
  return mock;
});
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const Users = require("../../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

process.env.secret = "test-secret";

const userRouter = require("../../routers/user");

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/user", userRouter);
  return app;
};

describe("User Router", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  describe("POST /user/validateLogin", () => {
    it("should return 400 when user is not found", async () => {
      mockFindOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/user/validateLogin")
        .send({ email: "unknown@test.com", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.text).toBe("user not found");
      expect(mockFindOne).toHaveBeenCalledWith({ userId: "unknown@test.com" });
    });

    it("should return 400 when password is incorrect", async () => {
      const mockUser = {
        id: "user123",
        userId: "test@test.com",
        passwordHash: "hashedPassword",
        isAdmin: false,
      };
      mockFindOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(false);

      const res = await request(app)
        .post("/user/validateLogin")
        .send({ email: "test@test.com", password: "wrongpassword" });

      expect(res.status).toBe(400);
      expect(res.text).toBe("password is incorrect");
      expect(bcrypt.compareSync).toHaveBeenCalledWith("wrongpassword", "hashedPassword");
    });

    it("should return 400 when password is missing", async () => {
      const mockUser = {
        id: "user123",
        userId: "test@test.com",
        passwordHash: "hashedPassword",
        isAdmin: false,
      };
      mockFindOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/user/validateLogin")
        .send({ email: "test@test.com" });

      expect(res.status).toBe(400);
      expect(res.text).toBe("password is incorrect");
    });

    it("should return 200 with user, token, and admin when credentials are valid", async () => {
      const mockUser = {
        id: "user123",
        userId: "test@test.com",
        passwordHash: "hashedPassword",
        isAdmin: false,
      };
      mockFindOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue("mock-jwt-token");

      const res = await request(app)
        .post("/user/validateLogin")
        .send({ email: "test@test.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        user: "test@test.com",
        token: "mock-jwt-token",
        admin: false,
      });
      expect(res.body).toHaveProperty("token");
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "user123", isAdmin: false },
        "test-secret",
        { expiresIn: "1d" }
      );
    });

    it("should return admin true when user is admin", async () => {
      const mockUser = {
        id: "admin123",
        userId: "admin@test.com",
        passwordHash: "hashedPassword",
        isAdmin: true,
      };
      mockFindOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue("mock-admin-token");

      const res = await request(app)
        .post("/user/validateLogin")
        .send({ email: "admin@test.com", password: "adminpass" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        user: "admin@test.com",
        token: "mock-admin-token",
        admin: true,
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "admin123", isAdmin: true },
        "test-secret",
        { expiresIn: "1d" }
      );
    });
  });

  describe("POST /user/register", () => {
    it("should return 201 and create user when registration succeeds", async () => {
      mockFindOne.mockResolvedValue(null);
      bcrypt.hashSync.mockReturnValue("hashedPassword");

      const mockSavedUser = {
        _id: "newuser123",
        name: "Test User",
        userId: "newuser@test.com",
        isAdmin: false,
      };
      mockSave.mockResolvedValue(mockSavedUser);

      const res = await request(app)
        .post("/user/register")
        .send({
          name: "Test User",
          userId: "newuser@test.com",
          password: "password123",
          address1: "Address 1",
          address2: "Address 2",
          pincode: "123456",
          mobileNumber: "1234567890",
          isAdmin: false,
        });

      expect(res.status).toBe(201);
      expect(mockFindOne).toHaveBeenCalledWith({ userId: "newuser@test.com" });
      expect(bcrypt.hashSync).toHaveBeenCalledWith("password123", 11);
      expect(mockSave).toHaveBeenCalled();
    });

    it("should return 400 when userId already exists", async () => {
      mockFindOne.mockResolvedValue({ userId: "existing@test.com" });

      const res = await request(app)
        .post("/user/register")
        .send({
          name: "Test User",
          userId: "existing@test.com",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        error: "Username and email already exists",
        success: false,
      });
      expect(mockSave).not.toHaveBeenCalled();
    });

    it("should return 500 when save fails", async () => {
      mockFindOne.mockResolvedValue(null);
      bcrypt.hashSync.mockReturnValue("hashedPassword");
      mockSave.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .post("/user/register")
        .send({
          name: "Test User",
          userId: "newuser@test.com",
          password: "password123",
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty("error");
    });

    it("should create admin user when isAdmin is true", async () => {
      mockFindOne.mockResolvedValue(null);
      bcrypt.hashSync.mockReturnValue("hashedPassword");

      const mockSavedUser = {
        _id: "admin123",
        name: "Admin User",
        userId: "admin@test.com",
        isAdmin: true,
      };
      mockSave.mockResolvedValue(mockSavedUser);

      const res = await request(app)
        .post("/user/register")
        .send({
          name: "Admin User",
          userId: "admin@test.com",
          password: "adminpass",
          isAdmin: true,
        });

      expect(res.status).toBe(201);
      expect(Users).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "admin@test.com",
          isAdmin: true,
        })
      );
    });
  });
});
