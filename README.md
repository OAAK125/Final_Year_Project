# Online Platform for IT Certification Preparation (Final Year Project)

## Contributors 
- Obaapa Ama Ampaben-Kyereme
- Divine Kofi Delase Dumevi
---

## Introduction
We designed the IT Certification Practice Platform to assist aspiring IT professionals in efficiently preparing for certification exams. Many certification aspirants struggle to find relevant practice questions that are not just past questions, curated resources, learning progress analysis and personalised quiz options. This platform addresses these gaps by providing an interactive, user-friendly system for practice tests, resource tracking, and contribution to a growing question bank.


## Problem Statement
- Absence of a centralised platform offering comprehensive, up-to-date practice tests.
- Lack of structured resources aligned with certification objectives. 
- Many existing platforms fail to support peer collaboration, leaving learners isolated.
- There is a lack of integrated systems that combine personalised learning, collaborative forums, and performance insights.


## Project Aims
The overarching aim of this project is to develop a user-friendly and comprehensive responsive website that significantly enhances the preparation process for individuals pursuing computer science international certifications. This platform will serve as a centralised hub, offering both practice test functionalities and a vibrant community forum designed to foster collaboration and knowledge exchange among learners. 

It will also integrate a subscription-based pricing structure (Free, Standard, Full Access) to make the platform financially accessible while sustaining long-term scalability. Through this integrated approach, the project aims to reduce the fragmentation of existing learning resources and provide a more efficient, affordable, and community-driven pathway to success in IT certifications.


## Goals
- Create a platform that provides quizzes for multiple IT certifications.
- Implement performance tracking and analytics for learners.
- Build a contributor system allowing users to submit questions and earn.
- Provide subscription tiers for access control and monetisation.
- Deliver a scalable, modern web experience using Next.js and Tailwind CSS.


## Solution Overview
The platform enables users to:

- Browse IT certifications and take quizzes from vendors such as Cisco, CompTIA, and AWS.
- Specific home page and explore features which include a search bar for quizzes, the ability to retake the last test, recommended test and resources suggestions, and practice test filters (by certification type, arrangement, and topic).
- Bookmark favourite certifications for easy access.
- Resources like official exam objectives, videos, study guides, articles, etc.
- Track performance using charts and insights. (progress over time, subtopic strength, flagged questions list)
- Build custom quizzes by selecting question counts and adding flagged questions.
- Contribute questions, which, after admin approval, become part of the question bank and can earn money.
- Subscribe to different access tiers as per needs.

The platform enables admins to:

- Add or remove questions, users and contributors.
- Check the questions contributors add or edit before approving payment.
- Feed the question generator materials and corrections to help generate questions.


## Technology Stack
| Layer | Technology |
| ----------- | ----------- |
| Frontend | Next.js, React, Tailwind CSS, ShadCN UI, Lucide Icons |
| Backend | Supabase (PostgreSQL, Auth, Functions) |
| Authentication | Supabase Auth |
| Payment & Subscription | Paystack API |
| Hosting | Vercel |


## Future Improvements
- Automated content generation or large-scale content generation mechanisms are beyond the current scope.
- Adaptive learning is something we hope to add to improve studying and user insights. 
- Advanced predictive analytics or deep learning models for highly nuanced feedback and personalised study recommendations are future enhancements.
- The project's initial evaluation is a limited user base. Comprehensive scalability testing under extreme load conditions or with very large datasets is not fully simulated within the project timeline.
- While content management and moderation strategies are planned for the forum, sophisticated AI-driven content moderation beyond user reporting mechanisms is outside the current scope.
- The Free, Standard, and Full Access subscription tiers have been designed as a prototype, but long-term financial sustainability and user adoption rates of these pricing structures cannot be fully validated within the current scope.
- Multi-language support for non-English IT aspirants.


## Conclusion
This project demonstrates a holistic approach to IT certification exam preparation and/or serves as a basis for improvements on online learning in this space. 


## Link
[Website](https://final-year-project-olive-omega.vercel.app/)
