package com.finance.util;

import java.sql.*;


public class DatabaseUtil {

    private static final String DB_URL = "jdbc:postgresql://localhost:5432/finance_tracker";
    private static final String DB_USER = "postgres";
    private static final String DB_PASS = "root";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
    }
}
