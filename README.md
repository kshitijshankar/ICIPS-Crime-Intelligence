🛡️ Indian Crime Intelligence & Public Safety Analytics (ICIPS)

📊 Data-Driven Insights for a Safer Tomorrow

Indian Crime Intelligence & Public Safety Analytics (ICIPS) is a data-driven crime analytics and public-safety dashboard designed to transform reported crime records into structured, visual, and actionable insights.

The project analyzes crime information across cities, crime domains, crime categories, victims, weapons, dates, case status, and police deployment to help understand crime patterns and support data-driven public-safety decisions.

🛡️ INTELLIGENCE TODAY. SAFETY TOMORROW.

📌 Table of Contents

🎯 Project Objectives

🚀 Key Features

📊 Executive Dashboard

🔎 Crime Analysis

💡 Key Insights

🛠️ Technology Stack

🗂️ Data Model

📈 KPIs & Calculations

🔄 Data Flow

🧹 Data Cleaning & Transformation

💻 Application Architecture

📁 Project Structure

⚙️ How to Run

👥 Stakeholder Perspectives

🎓 Portfolio Value

⚠️ Data Limitations

🚀 Future Enhancements

🌟 Long-Term Vision

🎯 Project Objectives

The main objectives of ICIPS Analytics are:

📊 Transform raw crime records into meaningful analytical information.

🧹 Clean and transform crime-related data.

📈 Identify crime trends over time.

🏙️ Compare reported crimes across Indian cities.

🔎 Analyze crime categories and crime domains.

👥 Analyze victim demographics.

🔫 Analyze weapon-related information.

⚖️ Understand closed and open case distributions.

👮 Analyze police deployment information.

💡 Generate data-driven insights from crime records.

🛡️ Support better understanding of public-safety patterns.

🚀 Key Features

📊 Executive Overview

The executive dashboard provides a high-level view of the complete crime dataset.

It includes:

🚨 Total Crimes Reported

✅ Closed Cases

🔓 Open Cases

📈 Case Closure Rate

🛡️ Violent Crime Percentage

🏙️ Top Crime City

📈 Reported Crime Trend Over Time

🏙️ Top 10 Cities by Reported Crimes

🔎 Crime Domain Distribution

📋 Top Reported Crime Categories

⚖️ Case Resolution Status

👥 Violent Crime Demographics

💡 Data-driven analytical insights

👮 Police Operations

Provides analysis related to:

👮 Police deployment

📊 Operational workload

⚖️ Case status

🏙️ City-level comparisons

🔎 Crime-category analysis

🧠 Crime Intelligence

Provides deeper analytical views of:

🔎 Crime categories

📈 Crime trends

🏙️ City patterns

🔫 Weapons

👥 Victim demographics

🕐 Time-based patterns

🛡️ Crime domains

👩 Women's Safety

Provides analysis focused on reported cases involving female victims, including:

👥 Victim demographics

🔎 Crime categories

⚖️ Case outcomes

🏙️ City-level patterns

🏙️ City Risk

Provides comparative city-level analysis including:

🏙️ City rankings

📊 Crime volumes

🔎 Crime composition

📈 Crime-domain comparisons

🛡️ Risk-oriented analytical indicators

📊 Executive Dashboard

The supplied dashboard displays the following overall results:

KPI

Value

🚨 Total Crimes Reported

40,160

✅ Closed Cases

20,062

🔓 Open Cases

20,098

📈 Case Closure Rate

50.0%

🛡️ Violent Crime %

28.6%

🏙️ Top Crime City

Delhi

📈 Reported Crime Trend Over Time

The dashboard presents a monthly aggregate of reported crime occurrences.

The displayed trend shows:

📉 Lower reported crime levels during parts of 2022.

📈 A sharp increase around January 2023.

🔥 Relatively high levels through the first half of 2023.

📉 A decline after the middle of 2023.

📊 Stabilization toward the end of the displayed period.

💡 Insight: Crime incidents increased sharply in January 2023 and remained high until approximately June 2023 before declining and stabilizing toward the end of the year.

🏙️ Top 10 Cities by Reported Crimes

Rank

City

Reported Crimes

🥇 1

Delhi

7,456

🥈 2

Bengaluru

5,684

🥉 3

Mumbai

4,507

4

Hyderabad

3,215

5

Ahmedabad

2,542

6

Pune

2,126

7

Chennai

1,756

8

Kolkata

1,452

9

Lucknow

1,024

🔟 10

Jaipur

924

🏙️ Top Crime City

Delhi has the highest reported-crime count among the cities shown in the dashboard.

🔎 Crime Domain Distribution

The dashboard categorizes reported crimes into primary crime domains such as:

🔵 Theft

🟢 Assault

🟡 Fraud

🔵 Other

🔷 Cyber Crime

The distribution provides a high-level view of how reported crime is divided across major crime domains.

📋 Top Reported Crime Categories

Rank

Crime Category

Reported Crimes

🥇 1

Theft

6,845

🥈 2

Assault

6,210

🥉 3

Criminal Intimidation

5,125

4

Fraud

4,302

5

Robbery

3,256

6

Burglary

2,894

7

Kidnapping & Abduction

2,125

8

Cheating

1,980

9

Cyber Crime

1,745

🔟 10

Murder

1,678

⚖️ Case Resolution Status

The dashboard compares:

✅ Closed Cases

🔓 Open Cases

The displayed data contains:

20,062 closed cases

20,098 open cases

50.0% displayed case closure rate

This provides an overview of the current distribution between resolved and unresolved reported cases.

👥 Violent Crime Demographics

The dashboard provides a demographic breakdown of reported cases using:

👨 Male

👩 Female

🧑 Other

The displayed dashboard shows 28.6% of total crimes as violent in nature.

💡 Key Insights

📈 1. Rising Crime Trend

Crime incidents peaked between January and June 2023 in the displayed trend.

🔎 Continuous monitoring is essential for understanding changes in reported crime activity.

🏙️ 2. Top Crime City

Delhi reports the highest number of crimes among the displayed cities.

🔎 3. Theft & Assault Domain

Theft and Assault are among the most reported crime categories in the displayed dataset.

⚖️ 4. Case Resolution

The dashboard shows almost an even distribution between closed and open cases, with a displayed 50.0% closure rate.

🛡️ 5. Data for Action

These insights can help support:

👮 Better resource allocation

📊 Data-driven planning

📈 Crime monitoring

🏙️ City-level comparison

🛡️ Public-safety analysis

🛠️ Technology Stack

Technology

Purpose

🌐 HTML5

Dashboard structure and interface

🎨 CSS3

Styling, responsive layout and visual design

⚡ JavaScript (ES6+)

Data processing, filtering and calculations

📊 ApexCharts

Interactive charts and visualizations

🔤 Google Fonts

Typography

🎨 FontAwesome

Icons

🐍 Python

Data cleaning and transformation

🗄️ SQL / SQLite

Data storage and analytical queries

📄 JSON

Crime dataset storage

🗂️ Data Model

ICIPS uses a dimensional data model with FACT_CRIME as the central fact table.

                         ┌──────────────────┐
                         │     DIM_DATE     │
                         └────────┬─────────┘
                                  │
                                  │
┌──────────────────┐       ┌──────▼───────┐       ┌────────────────────┐
│    DIM_CITY      │──────►│  FACT_CRIME  │◄──────│ DIM_CRIME_DOMAIN  │
└──────────────────┘       └──────┬───────┘       └────────────────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
       ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
       │DIM_CRIME_CATEGORY│ │ DIM_WEAPON  │ │ DIM_VICTIM  │
       └─────────────────┘ └──────────────┘ └──────────────┘

📊 FACT_CRIME

crime_id
date_id
city_id
domain_id
category_id
weapon_id
victim_id
report_number
crime_code
date_reported
date_occurrence
time_occurrence
police_deployed
case_closed
date_case_closed

📌 Each record represents one reported crime.

📅 DIM_DATE

date_id
full_date
day
day_name
month
month_name
quarter
year
is_weekend

🏙️ DIM_CITY

city_id
city_name
state
region
population

🔎 DIM_CRIME_DOMAIN

domain_id
domain_name
description

📋 DIM_CRIME_CATEGORY

category_id
crime_code
category_name
description

🔫 DIM_WEAPON

weapon_id
weapon_name
weapon_type

👥 DIM_VICTIM

victim_id
age
age_group
gender
gender_group

📈 KPIs & Calculations

🚨 Total Cases

Total Cases = Count of Report Numbers

✅ Closed Cases

Case Closed = Yes

🔓 Open Cases

Case Closed = No

📊 Case Closure Rate

Case Closure Rate =
(Closed Cases / Total Cases) × 100

🛡️ Violent Crime Percentage

Violent Crime % =
(Violent Domain / Total Crimes) × 100

👮 Average Police Deployment

Calculated using the mean police deployment across crime records.

⏱️ Average Case Resolution Time

For closed cases:

Resolution Time =
Date Case Closed - Date Reported

🔎 Most Common Crime / Weapon

The most frequently occurring crime or weapon can be identified using the mathematical mode.

🕐 Time-of-Day Classification

Crime occurrences can be classified into four time periods:

Time

Classification

🌅 06:00 – 11:59

Morning

☀️ 12:00 – 16:59

Afternoon

🌆 17:00 – 20:59

Evening

🌙 21:00 – 05:59

Night

🔄 Data Flow

📄 JSON Dataset
       │
       ▼
🧹 Data Cleaning & Transformation
       │
       ▼
🗃️ Normalized Database
       │
       ▼
🔎 Analytical Queries
       │
       ▼
📊 KPI Calculations
       │
       ▼
📈 Dashboard & Visualization
       │
       ▼
💡 Dynamic Insights
       │
       ▼
🛡️ Public Safety Intelligence

🧹 Data Cleaning & Transformation

The project processes raw crime data before analysis.

🧹 Data Cleaning

Validate crime records.

Handle missing values.

Handle invalid age values.

Handle missing gender values.

Handle invalid police-deployment values.

Parse date fields.

Parse time fields.

Normalize categorical values.

🏷️ Derived Fields

The project can derive analytical fields such as:

case_closure_rate
violent_crime_flag
age_group
gender_group
response_time
monthly_trend
top_cities
top_categories

💻 Application Architecture

The dashboard is designed primarily as a client-side analytical application.

┌──────────────────────┐
│    Crime Dataset     │
│       JSON           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Data Cleaning /      │
│ Transformation       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Analytical Logic     │
│ & KPI Calculations   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ ApexCharts / UI      │
│ Visualization        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Interactive ICIPS    │
│ Dashboard             │
└──────────────────────┘

📁 Project Structure

ICIPS-Analytics/
│
├── data/
│   ├── raw/
│   │   └── crime_dataset_india.json
│   └── processed/
│
├── database/
│   └── icips_analytics.db
│
├── python/
│   ├── data_cleaning.py
│   ├── database.py
│   ├── analytics.py
│   └── risk_analysis.py
│
├── sql/
│   ├── schema.sql
│   ├── analysis_queries.sql
│   └── views.sql
│
├── dashboard/
│   └── frontend/
│       ├── index.html
│       ├── style.css
│       ├── script.js
│       └── crime_dataset.js
│
├── reports/
│   ├── ICIPS_Analytics_Project_Report.pdf
│   └── Documentation.docx
│
├── images/
│   ├── dashboard.png
│   └── data_model.png
│
├── .gitignore
├── requirements.txt
└── README.md

⚙️ How to Run

🎯 Option 1 — Open Directly

Clone or download the repository.

Open the project folder.

Open index.html.

Open it in a modern web browser.

Navigate through the dashboard.

🌐 Option 2 — VS Code Live Server

Open the project in Visual Studio Code.

Right-click index.html.

Select Open with Live Server.

The dashboard will open in your browser.

🐍 Option 3 — Python Local Server

Run:

python -m http.server 8000

Then open:

http://localhost:8000

🟢 Option 4 — Node.js

Run:

npx http-server

Then open the displayed local URL.

👥 Stakeholder Perspectives

Perspective

Focus

📊 Executive Overview

Overall crime volume, trends and case outcomes

👮 Police Operations

Deployment, workload and case status

🧠 Crime Intelligence

Crime types, categories, demographics and patterns

👩 Women's Safety

Female-victim-oriented analysis

🏙️ City Risk

City comparisons and risk-oriented indicators

🎓 Portfolio Value

This project demonstrates practical skills in:

📊 Data Analytics

🧹 Data Cleaning

🔄 Data Transformation

🗃️ Data Modeling

🗄️ SQL / SQLite

🐍 Python

🌐 Frontend Development

📈 Data Visualization

📊 KPI Development

🔎 Exploratory Data Analysis

💡 Insight Generation

🏙️ City-Level Analysis

🛡️ Public-Safety Analytics

📋 Dashboard Development

⚠️ Data Limitations & Responsible Interpretation

This project analyzes reported crime records and is intended for analytical and educational purposes.

Therefore:

⚠️ Reported crime records should not automatically be interpreted as a complete measure of all crime.

⚠️ Derived risk indicators are analytical measures unless independently validated.

⚠️ Real-time crime information requires a connected live data source.

⚠️ Response-time analysis requires reliable response/dispatch timestamps.

⚠️ Weather or environmental analysis requires additional datasets.

⚠️ Missing or inconsistent source values can affect analytical results.

⚠️ Large client-side datasets may affect initial loading time and browser memory.

🛡️ Responsible interpretation is essential when using crime-related data.

🚀 Future Enhancements

Potential improvements include:

🔴 Live crime-data feeds

🔄 Automatic data refresh

🕐 Scheduled ETL pipelines

👮 Police deployment integration

🚨 Emergency dispatch integration

⏱️ Verified response-time analytics

🌦️ Weather and environmental datasets

📍 Geographic crime clustering

🔥 Crime hotspot detection

🔐 User authentication

👥 Role-based dashboard access

🌐 Production deployment

📈 Predictive analytics using historical data

📄 Exportable analytical reports

📅 Scheduled executive summaries

🌟 Long-Term Vision

The long-term vision of ICIPS is to develop a validated public-safety intelligence platform that combines historical crime information with current operational signals.

The platform aims to provide:

📊 Transparent Data
        +
🔎 Explainable Analytics
        +
💡 Actionable Insights
        ↓
🛡️ Better Public-Safety Intelligence

🛡️ Project Philosophy

“Data should not only tell us what happened — it should help us understand where, when, how, and why patterns emerge.”

ICIPS transforms crime data into clear and interpretable analytical intelligence that can support better understanding, resource allocation, and public-safety decision making.

📚 Documentation

The project documentation can include:

📄 Project Report

📊 Dashboard Screenshots

🗂️ Data Model Diagram

🧹 Data Cleaning Methodology

🔎 Analytical Methodology

📈 Dashboard Results

💡 Key Insights

🚀 Future Enhancements

🛡️ ICIPS ANALYTICS

INTELLIGENCE TODAY. SAFETY TOMORROW.

Indian Crime Intelligence & Public Safety Analytics

⭐ Data → Intelligence → Insights → Safer Communities

📊 DATA
   ↓
🔎 INTELLIGENCE
   ↓
💡 INSIGHTS
   ↓
🛡️ SAFER COMMUNITIES


If this project is useful for learning or academic work, consider giving the repository a ⭐ Star on GitHub.

Built with 🐍 Python + 🗄️ SQLite + 🔎 SQL + 📊 Data Analytics

© ICIPS Analytics — Indian Crime Intelligence & Public Safety Analytics
