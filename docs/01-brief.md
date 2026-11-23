# Aura Salon — Project Brief & Scope

## Problem
Customers often wait at a salon without knowing their position or when their turn will arrive. Staff also need a clear way to coordinate several barbers, walk-ins and customer preferences without losing the first-come-first-served order.

Aura Salon gives customers a live queue position and gives staff one shared view of the waiting line.

## Users
- **Customer:** joins from a phone, chooses services and a preferred barber, and checks live status.
- **Receptionist:** adds walk-ins, calls the next eligible customer, and handles cancellations/no-shows.
- **Barber:** sees the assigned customer, starts and completes a service, and sets availability or break status.
- **Owner:** maintains services and prices, manages barbers on duty, opens/closes online joining, and reviews today's simple statistics.

## Must-have features
1. Join online with name, validated 10-digit phone number, one to three services, and a preferred barber or Any barber.
2. Issue a sequential token and show position, estimated wait, a start-coming-soon notice and a called/turn notice.
3. Reception dashboard with walk-in creation, waiting list, call-next, no-show and cancel actions.
4. Barber view with current customer, Start/Done actions, availability and break toggle.
5. Waiting-area TV display with each barber's current token and the next five customers.
6. Owner settings for bilingual services, prices/durations, barber duty/break status and online queue switch.
7. Shared state across customer, reception, barber and TV views, with local demo mode when hosted storage is not configured.
8. English/Gujarati interface labels and responsive phone, tablet and TV layouts.

## Out of scope
Online payments, future-date appointments, SMS/WhatsApp notifications, loyalty programs and multiple salon branches. This is a classroom demo; staff PINs are not production authentication.

## Look & feel
A calm premium salon identity: charcoal navigation, warm gold accents, soft ivory cards, editorial serif headings, clean sans-serif body text and mobile-first spacing. English and Gujarati labels are supported.
