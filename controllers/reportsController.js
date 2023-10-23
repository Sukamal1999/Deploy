const path = require("path");
const Expense = require("../models/expenseModel");
const { Op } = require("sequelize");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Function to download reports as CSV
exports.downloadReports = async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Replace this logic with your database query to fetch the expenses data
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
    });

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }

    // Define the CSV fields and create a CSV writer
    const csvWriter = createCsvWriter({
      path: "expenses.csv", // This will create the file in the same directory as reportsController.js
      header: [
        { id: "date", title: "Date" },
        { id: "category", title: "Category" },
        { id: "description", title: "Description" },
        { id: "amount", title: "Amount" },
      ],
    });

    // Write the expenses data to a CSV file
    await csvWriter.writeRecords(expenses);

    // Set response headers to trigger the download
    res.setHeader("Content-disposition", "attachment; filename=expenses.csv");
    res.setHeader("Content-Type", "text/csv");

    // Construct the file path
    const file = path.join(__dirname, "expenses.csv");

    // Send the CSV file as a response
    res.download(file);
  } catch (error) {
    console.error("Error downloading reports:", error.message);
    res.status(500).json({ error: "Failed to download reports" });
  }
};

// Function to render the reports page
exports.getReportsPage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "reports.html"));
};

// Function to retrieve daily reports
exports.dailyReports = async (req, res, next) => {
  try {
    const date = req.body.date;
    const expenses = await Expense.findAll({
      where: { date: date, userId: req.user.id },
    });
    return res.send(expenses);
  } catch (error) {
    console.log(error);
  }
};

// Function to retrieve monthly reports
exports.monthlyReports = async (req, res, next) => {
  try {
    const month = req.body.month;

    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.like]: `%-${month}-%`,
        },
        userId: req.user.id,
      },
      raw: true,
    });

    return res.send(expenses);
  } catch (error) {
    console.log(error);
  }
};




















// const path = require("path");
// const Expense = require("../models/expenseModel");
// const { Op } = require("sequelize");

// exports.getReportsPage = (req, res, next) => {
//   res.sendFile(path.join(__dirname, "../", "public", "views", "reports.html"));
// };

// exports.dailyReports = async (req, res, next) => {
//   try {
//     const date = req.body.date;
//     const expenses = await Expense.findAll({
//       where: { date: date, userId: req.user.id },
//     });
//     return res.send(expenses);
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.monthlyReports = async (req, res, next) => {
//   try {
//     const month = req.body.month;

//     const expenses = await Expense.findAll({
//       where: {
//         date: {
//           [Op.like]: `%-${month}-%`,
//         },
//         userId: req.user.id,
//       },
//       raw: true,
//     });

//     return res.send(expenses);
//   } catch (error) {
//     console.log(error);
//   }
// };
