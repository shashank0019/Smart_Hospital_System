# 🏥 Smart Hospital Management System

A full-stack web application designed to digitize and simplify hospital operations by providing a centralized platform for managing patients, doctors, appointments, and inventory.

---

## 📌 Project Overview

Hospitals handle a large amount of patient and operational data every day. Managing patient records, appointments, and inventory manually can be time-consuming and difficult to maintain.

The **Smart Hospital Management System** provides a centralized digital platform where administrators, doctors, and patients can manage hospital-related activities securely.

The system uses **JWT authentication and role-based access control** to ensure that each user can access only the features and information relevant to their role.

---

## 🎯 Problem Statement

Traditional hospital management can involve:

- Difficulties in maintaining patient records
- Manual appointment management
- Difficulty tracking hospital inventory
- Data management across different systems
- Lack of centralized access to information
- Security concerns around sensitive patient information

This project aims to provide a single platform to simplify these operations.

---

## 💡 Solution

The Smart Hospital Management System centralizes important hospital operations into one web application.

Users can securely log in based on their role and perform the operations available to them.

### Main User Roles

**Admin**
- Manage doctors
- Manage patients
- Manage appointments
- Manage inventory
- Access overall hospital information

**Doctor**
- View patient information
- Manage appointments
- Access relevant patient records

**Patient**
- Manage personal information
- View appointments
- Access available patient-related information

---

## 🚀 Key Features

### 👤 Patient Management

- Patient registration
- Patient profile management
- Patient record management
- Secure access to patient information

### 📅 Appointment Management

- Schedule appointments
- View appointments
- Manage appointment information
- Connect patients with doctors

### 👨‍⚕️ Doctor Management

- Manage doctor information
- View doctor details
- Manage doctor-related appointments

### 📦 Inventory Management

- Track hospital inventory
- Maintain inventory information
- Help administrators manage available resources

### 🔐 Authentication

The application uses **JWT (JSON Web Token)** for secure user authentication.

Users must authenticate before accessing protected resources.

### 🛡️ Role-Based Access Control

Different users have different permissions.

```text
Admin
 ├── Patient Management
 ├── Doctor Management
 ├── Appointment Management
 └── Inventory Management

Doctor
 ├── Patient Information
 └── Appointment Management

Patient
 ├── Profile
 └── Appointments
