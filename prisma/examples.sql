-- ============================================================
-- PostgreSQL + Prisma CHEAT SHEET for EL.AY Beauty
-- ============================================================
-- Run any of these with:
--   psql -U postgres -h 127.0.0.1 -p 5433 -d elay_beauty -c "YOUR QUERY"
-- ============================================================

-- 1. SEE ALL SERVICES
SELECT id, name, price, category FROM "Service" ORDER BY category, price;

-- 2. SEE ALL BOOKINGS (with client + service names)
SELECT b.id, u.name AS client, s.name AS service, b.date, b.time, b.status
FROM "Booking" b
JOIN "User" u ON b."clientId" = u.id
JOIN "Service" s ON b."serviceId" = s.id;

-- 3. COUNT BY CATEGORY
SELECT category, COUNT(*) FROM "Service" GROUP BY category;

-- 4. BOOKINGS PENDING DEPOSIT
SELECT * FROM "Booking" WHERE status = 'PENDING_DEPOSIT';

-- 5. TODAY'S BOOKINGS
SELECT * FROM "Booking" WHERE date = CURRENT_DATE;
