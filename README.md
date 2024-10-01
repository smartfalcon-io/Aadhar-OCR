# Aadhar-OCR System

A real-time Aadhaar Optical Character Recognition (OCR) system that extracts and displays Aadhaar details from front and back images of the Aadhaar card. The system is built using **Vite-React** for the frontend, utilizing **RTK Query** for efficient data fetching and state management. The backend, developed with **Node.js** and **Express** in a microservice architecture, and **MongoDB** for storing user data.


![Screenshot 2024-10-01 093111](https://github.com/user-attachments/assets/977e10f7-2306-49d8-8ed5-405dc8208c30)


## Features

- **Frontend**: Vite-React with RTK Query for fast, efficient data fetching and state management.
- **Backend**: Node.js and Express microservices for image processing, Aadhaar data extraction, and API interactions.
- **OCR**: Integration of an OCR engine to extract text from Aadhaar card images.

## Getting Started

### Collect Environment Variables

Please contact the admin to collect the necessary environment variables required for the application to run. Create a `.env` file in the root of your project directory and populate it with the collected environment variables.


### Prerequisites

- Docker

### Installation

```bash

git clone https://github.com/suhailabdaz/Aadhar-OCR.git

cd Aadhar-OCR-System

docker compose up --build
```

##  Usage
Access the application frontend at http://localhost:8001.
