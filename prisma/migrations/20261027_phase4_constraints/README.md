This migration adds database-level checks for non-negative money/stock and
positive cart/order quantities. Prisma's schema language does not currently
express these check constraints, so they are maintained in SQL.
