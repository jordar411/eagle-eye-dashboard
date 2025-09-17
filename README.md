# Eagle Eye Dashboard 🦅 (###CAW!)

A comprehensive trading risk monitoring and analytics dashboard built with React. Eagle Eye provides real-time insights into trading account performance, risk utilization, and volume analytics with advanced visualization capabilities.

## Features

### 📊 Analytics
- **Account Overview**: Monitor total accounts, limit utilization, and risk metrics
- **Hot Account Detection**: Automatically identifies accounts with unusual trading activity (>2.5σ above average)
- **Limit Monitoring**: Track accounts approaching or exceeding notional trading limits
- **Volume Analytics**: Detailed volume tracking and trend analysis

### 📈 Interactive Visualizations
- **Top Account Volumes**: Bar chart showing highest volume accounts for the most recent trading date
- **Plantwide Volume Trends**: Line chart displaying total notional volume across all accounts over time
- **Account Detail Charts**: Individual account trading patterns with reference lines for limits and averages

### 🎯 Risk Management
- **Utilization Tracking**: Real-time monitoring of account limit utilization
- **Warning Systems**: Color-coded alerts for accounts at 70%+ utilization
- **Risk Percentage**: Overall portfolio risk assessment
- **Yesterday's Volume**: Most recent trading day volume with date tracking

### 📋 Account Management
- **Detailed Account Views**: Comprehensive stats including status, limits, averages, and activity metrics
- **Interactive Navigation**: Click-through functionality from overview to detailed account analysis
- **Search and Filter**: Easy account discovery across multiple views

## Technology Stack

- **Frontend**: React 19 with Hooks
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts library for interactive data visualization
- **Data Processing**: XLSX for Excel file import
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/eagle-eye-dashboard.git
cd eagle-eye-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

### Demo Mode

The application includes a demo mode with sample trading data. Click "Explore with Demo Data" on the upload page to see the dashboard in action with realistic financial data.

## Data Format

### Excel Upload Requirements
Your Excel file should follow this structure:
- **Column A**: Client account numbers
- **Column B**: Account names
- **Column D**: Notional limits
- **Columns E+**: Trading dates with corresponding volumes

### Sample Data Structure
```
Account Number | Account Name    | [Skip Col C] | Notional Limit | 2024-01-01 | 2024-01-02 | ...
GS001         | Goldman Sachs   |              | 120000000      | 35000000   | 42000000   | ...
JPM002        | JPMorgan Chase  |              | 65000000       | 45000000   | 38000000   | ...
```

## Key Analytics

### Hot Account Detection
Accounts are flagged as "hot" when their maximum volume exceeds their average volume by more than 2.5 standard deviations, indicating unusual trading activity that may require attention.

### Risk Utilization
- **Green Zone**: < 70% of notional limit
- **Yellow Zone**: 70-100% of notional limit
- **Red Zone**: > 100% of notional limit (over limit)

### Volume Calculations
- **Total Volume**: Sum across all trading days in the dataset
- **Average Volume**: Total volume divided by active trading days
- **Yesterday's Volume**: Volume for the most recent date in the dataset
- **Max Utilization**: Highest single-day utilization percentage

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)



---

Built with ❤️ for financial risk management and trading analytics.
