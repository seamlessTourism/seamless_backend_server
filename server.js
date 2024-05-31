import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import http from "http";

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Function to call the server
const callServer = () => {
  const options = {
    host: "localhost",
    port: port,
    path: "/",
  };

  http
    .get(options, (res) => {
      console.log(`Self call status code: ${res.statusCode}`);
      res.on("data", (chunk) => {
        console.log(`Response: ${chunk}`);
      });
    })
    .on("error", (e) => {
      console.error(`Got error: ${e.message}`);
    });
};

// Call the server every 15 minutes
const interval = 15 * 60 * 1000;
setInterval(callServer, interval);

app.post("/send", async (req, res) => {
  const { name, number, email, enquiryType, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "no-reply@seamlessdmc.com",
      pass: "zbwr ywxq nhqf zqsd",
    },
  });

  const mailOptions = {
    from: "no-reply@seamlessdmc.com",
    to: "no-reply@seamlessdmc.com",
    subject: `New Contact Form Submission - ${enquiryType}`,
    text: `Name: ${name}\nPhone Number: ${number}\nEmail: ${email}\nEnquiry Type: ${enquiryType}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

// New endpoint for travel agent inquiries
app.post("/send/travel-agent", async (req, res) => {
  const { name, email, message } = req.body;
  const senderEmail = email;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "no-reply@seamlessdmc.com",
      pass: "zbwr ywxq nhqf zqsd",
    },
  });

  const mailOptions = {
    from: "no-reply@seamlessdmc.com",
    to: "no-reply@seamlessdmc.com",
    subject: "New Travel Agent Inquiry",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  const replyMailOptions = {
    from: "no-reply@seamlessdmc.com", // Update with your email
    to: senderEmail, // Send reply email to the sender's email address
    subject: `Thank you for contacting us, ${name}!`,
    text: `Dear ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you as soon as possible.\n\nBest Regards,\nSeamless DMC`,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(replyMailOptions);
    res.status(200).send("Travel agent inquiry sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Save files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

// POST endpoint for sending email with attachment
app.post("/apply", upload.single("resume"), async (req, res) => {
  const { name, email, role } = req.body;
  const senderEmail = email;
  const resumePath = req.file.path;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "no-reply@seamlessdmc.com",
      pass: "zbwr ywxq nhqf zqsd",
    },
  });

  const mailOptions = {
    from: "no-reply@seamlessdmc.com",
    to: "no-reply@seamlessdmc.com",
    subject: "New Job Application",
    text: `Name: ${name}\nEmail: ${email}\nRole: ${role}`,
    attachments: [
      {
        filename: req.file.originalname,
        path: resumePath,
      },
    ],
  };
  const replyMailOptions = {
    from: "no-reply@seamlessdmc.com", // Update with your email
    to: senderEmail, // Send reply email to the sender's email address
    subject: `Thank you for applying, ${name}!`,
    text: `Dear ${name},

Thank you for taking the time to fill out the job application form on our website. We appreciate your interest in joining our team and are thrilled to have the opportunity to review your application.

Our hiring team has received your submission and will review it promptly. If we find a suitable position that matches your qualifications, we will get in touch with you.

Thank you once again for your interest in working with us!`,
  };

  try {
    // Send email to recipient
    await transporter.sendMail(mailOptions);
    // Send reply email to sender
    await transporter.sendMail(replyMailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
