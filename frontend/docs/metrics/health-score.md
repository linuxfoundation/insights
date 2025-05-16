# Health Score Explained

The Health Score in LFX Insights is **a single, unified metric (0–100) that reflects the overall health of an open source project**. It's designed to give developers a quick, high-confidence signal about whether a project is actively maintained, widely used, secure, and well-governed.

::: warning ⚠️ Please note
While the Health Score provides a useful, data-driven snapshot of a project's overall state, no single score can capture all the nuance of an open source project. Different projects serve different goals—some are mature and stable, others are experimental or niche by design. This scoring model is meant to highlight potential signals and risks, not to make final judgments. Always consider context and use your own judgment alongside the score.
:::

## Insights Health Score Formula

The Insights Health Score is calculated as the sum of four equally weighted categories:

**Health Score (0-100 pts) = Contributors (0–25 pts) + Popularity (0–25 pts) + Development (0–25 pts) + Security & Best Practices (0–25 pts)**

The aggregated score is evaluated as follows:

- **> 90 pts**: Rock Solid
- **76 - 90 pts**: Healthy
- **51 - 75 pts**: Stable
- **25 - 50 pts**: Unsteady
- **< 25 pts**: Critical

## Scoring Criteria

Each of the following metrics is scored on a 0–5 point scale, and grouped into four categories: Contributors, Popularity, Development, and Security & Best Practices. Each category can reach up to 25 points.

### 1. Contributors (0–25 pts)

#### 1.1 Contributor Dependency
- **0 pts:** 1 contributor accounts for 51%+ of contributions  
- **1 pt:** 2 contributors account for 51%+ of contributions  
- **2 pts:** 3–4 contributors account for 51%+ of contributions  
- **3 pts:** 5–6 contributors account for 51%+ of contributions  
- **4 pts:** 7–9 contributors account for 51%+ of contributions  
- **5 pts:** 10 or more contributors account for 51%+ of contributions  

#### 1.2 Organization Dependency
- **0 pts:** 1 organization accounts for 51%+ of contributions  
- **1 pt:** 2 organizations account for 51%+ of contributions  
- **2 pts:** 3 organizations account for 51%+ of contributions  
- **3 pts:** 4–5 organizations account for 51%+ of contributions  
- **4 pts:** 6–7 organizations account for 51%+ of contributions  
- **5 pts:** 8 or more organizations account for 51%+ of contributions  

#### 1.3 Quarterly Active Contributors
- **0 pts:** 0–1 active contributors in the last quarter  
- **1 pt:** 2–3 active contributors in the last quarter  
- **2 pts:** 4–6 active contributors in the last quarter  
- **3 pts:** 7–10 active contributors in the last quarter  
- **4 pts:** 11–20 active contributors in the last quarter  
- **5 pts:** 21 or more active contributors in the last quarter  

#### 1.4 Quarterly Contributor Retention Rate
- **0 pts:** Less than 10% of contributors are contributing quarter over quarter  
- **1 pt:** 10–29% of contributors are contributing quarter over quarter  
- **2 pts:** 30–49% of contributors are contributing quarter over quarter  
- **3 pts:** 50–64% of contributors are contributing quarter over quarter  
- **4 pts:** 65–79% of contributors are contributing quarter over quarter  
- **5 pts:** 80% or more of contributors are contributing quarter over quarter  

#### 1.5 Embargoed Countries
- **0 pts:** 1 or more companies from embargoed countries (Cuba, Iran, North Korea, Syria) contributed  
- **5 pts:** 0 companies from embargoed countries (Cuba, Iran, North Korea, Syria) contributed  

### 2. Popularity (0–25 pts)

::: warning ⚠️ Please note
If Insights only has GitHub data availabe for a project, its popularity score will be based solely on GitHub stars and forks. In this case, each of these two metrics will contribute up to 12.5 points, for a combined total of 25 points.
:::

#### 2.1 GitHub Stars
- **0 pts:** 0–9 GitHub stars  
- **1 pt:** 10–49 GitHub stars  
- **2 pts:** 50–199 GitHub stars  
- **3 pts:** 200–499 GitHub stars  
- **4 pts:** 500–999 GitHub stars  
- **5 pts:** 1,000+ GitHub stars  

#### 2.2 GitHub Forks
- **0 pts:** 0–4 forks  
- **1 pt:** 5–9 forks  
- **2 pts:** 10–19 forks  
- **3 pts:** 20–39 forks  
- **4 pts:** 40–79 forks  
- **5 pts:** 80+ forks  

#### 2.3 Social Mentions per Month
- **0 pts:** 0–4 social mentions  
- **1 pt:** 5–9 social mentions  
- **2 pts:** 10–24 social mentions  
- **3 pts:** 25–49 social mentions  
- **4 pts:** 50–99 social mentions  
- **5 pts:** 100+ social mentions  

#### 2.4 GitHub Mentions
- **0 pts:** 0–9 GitHub mentions  
- **1 pt:** 10–29 GitHub mentions  
- **2 pts:** 30–99 GitHub mentions  
- **3 pts:** 100–249 GitHub mentions  
- **4 pts:** 250–499 GitHub mentions  
- **5 pts:** 500+ GitHub mentions  

#### 2.5 Google Search Queries per Month
- **0 pts:** <10 queries  
- **1 pt:** 10–49 queries  
- **2 pts:** 50–199 queries  
- **3 pts:** 200–499 queries  
- **4 pts:** 500–999 queries  
- **5 pts:** 1,000+ queries  


### 3. Development (0-25 pts)

#### 3.1 New Pull Requests per Month
- **0 pts:** 0–1 new pull requests
- **1 pt:** 2–3 new pull requests
- **2 pts:** 4–7 new pull requests
- **3 pts:** 8–15 new pull requests
- **4 pts:** 16–30 new pull requests
- **5 pts:** 31+ new pull requests

#### 3.2 Issue Resolution Time
- **0 pts:** Average resolution time > 60 days
- **1 pt:** 45–60 days
- **2 pts:** 30–44 days
- **3 pts:** 15–29 days
- **4 pts:** 7–14 days
- **5 pts:** < 7 days

#### 3.3 Merge Lead Time
- **0 pts:** > 30 days
- **1 pt:** 21–30 days
- **2 pts:** 15–20 days
- **3 pts:** 7–14 days
- **4 pts:** 3–6 days
- **5 pts:** < 3 days

#### 3.4 Active Days (Last 30 Days)
- **0 pts:** Active on 0–5 days
- **1 pt:** Active on 6–10 days
- **2 pts:** Active on 11–15 days
- **3 pts:** Active on 16–20 days
- **4 pts:** Active on 21–26 days
- **5 pts:** Active on 27–30 days

#### 3.5 Contributions Outside Work Hours
- **0 pts:** 80%+ outside work hours
- **1 pt:** 60–79% outside work hours
- **2 pts:** 40–59% outside work hours
- **3 pts:** 25–39% outside work hours
- **4 pts:** 10–24% outside work hours
- **5 pts:** <10% outside work hours

### 4. Security & Best Practices (0-25 pts)

We run a set of control assessments for all available repositories of a project, powered by the [Open Source Project Security Baseline](https://baseline.openssf.org) by OpenSSF.

The Security & Best Practices dimension is evaluated with an equally weighted score from all applicable control assessments. We only consider control assessments that worked without privileged access to the project's codebase and ignore those that are not applicable (e.g., controls that cannot be evaluated due to repository limitations or project structure).

The formula used is:
**Security & Best Practices Score = Passed Control Assessments / (Passed + Failed Control Assessments)**

This percentage is then converted to a 0-25 point scale for the final Health Score.